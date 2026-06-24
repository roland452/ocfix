import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import userAuth from '../../controller/userAuth.js';
import User from '../../model/client/pages/profile/user.js';
const router = express.Router();

// Temp challenge store — use Redis in production
const challengeStore = new Map();

// Helpers
const base64ToBuffer = (base64) =>
  Buffer.from(base64.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

const bufferToBase64 = (buffer) =>
  Buffer.from(buffer).toString('base64');

// ============================================
// CHECK STATUS — is fingerprint registered?
// ============================================
router.get('/api/auth/webauthn/status', userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json({
      registered: !!(user?.webauthnCredentials?.length > 0),
      count: user?.webauthnCredentials?.length || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to check status' });
  }
});

// ============================================
// REGISTER OPTIONS — send challenge
// ============================================
router.get('/api/auth/webauthn/register-options', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const challenge = crypto.randomBytes(32);
    const challengeBase64 = bufferToBase64(challenge);

    challengeStore.set(userId, {
      challenge: challengeBase64,
      expires: Date.now() + 5 * 60 * 1000
    });

    res.status(200).json({
      challenge: challengeBase64,
      rp: {
        name: 'Octfix',
        id: req.hostname
      },
      user: {
        id: bufferToBase64(Buffer.from(userId)),
        name: user.email,
        displayName: user.name || user.email
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none'
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to generate options' });
  }
});

// ============================================
// REGISTER VERIFY — save credential
// ============================================
router.post('/api/auth/webauthn/register-verify', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, rawId, type, response } = req.body;

    const stored = challengeStore.get(userId);
    if (!stored || Date.now() > stored.expires) {
      return res.status(400).json({ message: 'Challenge expired. Please try again.' });
    }
    challengeStore.delete(userId);

    // Verify challenge from clientDataJSON
    const clientData = JSON.parse(
      Buffer.from(base64ToBuffer(response.clientDataJSON)).toString('utf8')
    );

    const receivedChallenge = clientData.challenge.replace(/-/g, '+').replace(/_/g, '/');
    const storedChallenge = stored.challenge.replace(/-/g, '+').replace(/_/g, '/');

    if (receivedChallenge !== storedChallenge) {
      return res.status(400).json({ message: 'Challenge mismatch. Setup failed.' });
    }

    // Check if credential already exists
    const user = await User.findById(userId);
    const alreadyExists = user.webauthnCredentials?.find(c => c.credentialId === id);
    if (alreadyExists) {
      return res.status(400).json({ message: 'This device is already registered' });
    }

    // Save credential
    await User.findByIdAndUpdate(userId, {
      $push: {
        webauthnCredentials: {
          credentialId: id,
          publicKey: response.attestationObject,
          counter: 0,
          deviceType: 'platform'
        }
      },
      fingerprintEnabled: true
    });

    res.status(200).json({ success: true, message: 'Biometric registered successfully' });

  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ============================================
// REMOVE — delete all credentials
// ============================================
router.delete('/api/auth/webauthn/remove', userAuth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      $set: {
        webauthnCredentials: [],
        fingerprintEnabled: false
      }
    });
    res.status(200).json({ success: true, message: 'Biometric removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove biometric' });
  }
});

// ============================================
// LOGIN OPTIONS — send challenge for login
// ============================================
router.get('/api/auth/webauthn/login-options', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user || !user.webauthnCredentials?.length) {
      return res.status(404).json({ message: 'No biometric registered for this account' });
    }

    const challenge = crypto.randomBytes(32);
    const challengeBase64 = bufferToBase64(challenge);

    challengeStore.set(email, {
      challenge: challengeBase64,
      userId: user._id.toString(),
      expires: Date.now() + 5 * 60 * 1000
    });

    res.status(200).json({
      challenge: challengeBase64,
      rpId: req.hostname,
      allowCredentials: user.webauthnCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key'
      })),
      userVerification: 'required',
      timeout: 60000
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to generate login options' });
  }
});

// ============================================
// LOGIN VERIFY — authenticate user
// ============================================
router.post('/api/auth/webauthn/login-verify', async (req, res) => {
  try {
    const { email, id, response } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const stored = challengeStore.get(email);
    if (!stored || Date.now() > stored.expires) {
      return res.status(400).json({ message: 'Challenge expired. Try again.' });
    }
    challengeStore.delete(email);

    const user = await User.findById(stored.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find matching credential
    const credential = user.webauthnCredentials.find(c => c.credentialId === id);
    if (!credential) {
      return res.status(400).json({ message: 'Biometric not recognized on this account' });
    }

    // Verify challenge
    const clientData = JSON.parse(
      Buffer.from(base64ToBuffer(response.clientDataJSON)).toString('utf8')
    );

    const receivedChallenge = clientData.challenge.replace(/-/g, '+').replace(/_/g, '/');
    const storedChallenge = stored.challenge.replace(/-/g, '+').replace(/_/g, '/');

    if (receivedChallenge !== storedChallenge) {
      return res.status(400).json({ message: 'Biometric verification failed' });
    }

    // Issue JWT — same as normal login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Biometric login successful',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;

