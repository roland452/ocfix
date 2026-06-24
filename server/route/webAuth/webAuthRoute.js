import express from 'express';
import crypto from 'crypto';
import userAuth from '../../controller/userAuth.js';
import User from '../../model/client/pages/profile/user.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Helper: base64 to buffer
const base64ToBuffer = (base64) => Buffer.from(base64, 'base64');

// Helper: buffer to base64
const bufferToBase64 = (buffer) => Buffer.from(buffer).toString('base64');

// Store challenges temporarily (in production use Redis)
const challengeStore = new Map();

// ============================================
// 1. GET register options — send challenge
// ============================================
router.get('/api/auth/webauthn/register-options', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate random challenge
    const challenge = crypto.randomBytes(32);
    const challengeBase64 = bufferToBase64(challenge);

    // Store challenge temporarily (expires in 5 minutes)
    challengeStore.set(userId, {
      challenge: challengeBase64,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Return options for the browser
    res.status(200).json({
      challenge: challengeBase64,
      rp: {
        name: 'Octfix',
        id: req.hostname // e.g 'localhost' or 'octfix.com'
      },
      user: {
        id: bufferToBase64(Buffer.from(userId)),
        name: user.email,
        displayName: user.name || user.email
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256
        { alg: -257, type: 'public-key' }  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // use device built-in (fingerprint/face)
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
// 2. POST register verify — save credential
// ============================================
router.post('/api/auth/webauthn/register-verify', userAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, rawId, type, response } = req.body;

    // Get stored challenge
    const stored = challengeStore.get(userId);
    if (!stored || Date.now() > stored.expires) {
      return res.status(400).json({ message: 'Challenge expired. Please try again.' });
    }

    // Clear challenge after use
    challengeStore.delete(userId);

    // Parse clientDataJSON to verify challenge
    const clientData = JSON.parse(
      Buffer.from(base64ToBuffer(response.clientDataJSON)).toString('utf8')
    );

    const receivedChallenge = clientData.challenge
      .replace(/-/g, '+').replace(/_/g, '/');
    const storedChallenge = stored.challenge
      .replace(/-/g, '+').replace(/_/g, '/');

    if (receivedChallenge !== storedChallenge) {
      return res.status(400).json({ message: 'Challenge mismatch. Setup failed.' });
    }

    // Save credential to user's record
    await User.findByIdAndUpdate(userId, {
      $push: {
        webauthnCredentials: {
          credentialId: id,
          publicKey: response.attestationObject, // simplified storage
          counter: 0,
          deviceType: clientData.type || 'public-key'
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
// 3. GET login options — send challenge
// ============================================
router.get('/api/auth/webauthn/login-options', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });

    if (!user || !user.webauthnCredentials?.length) {
      return res.status(404).json({ message: 'No biometric registered for this account' });
    }

    const challenge = crypto.randomBytes(32);
    const challengeBase64 = bufferToBase64(challenge);

    // Store with email as key (no auth token yet)
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
// 4. POST login verify — authenticate user
// ============================================
router.post('/api/auth/webauthn/login-verify', async (req, res) => {
  try {
    const { email, id, response } = req.body;

    const stored = challengeStore.get(email);
    if (!stored || Date.now() > stored.expires) {
      return res.status(400).json({ message: 'Challenge expired. Try again.' });
    }

    challengeStore.delete(email);

    const user = await User.findById(stored.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the matching credential
    const credential = user.webauthnCredentials.find(c => c.credentialId === id);
    if (!credential) {
      return res.status(400).json({ message: 'Biometric not recognized' });
    }

    // Parse and verify clientDataJSON
    const clientData = JSON.parse(
      Buffer.from(base64ToBuffer(response.clientDataJSON)).toString('utf8')
    );

    const receivedChallenge = clientData.challenge
      .replace(/-/g, '+').replace(/_/g, '/');
    const storedChallenge = stored.challenge
      .replace(/-/g, '+').replace(/_/g, '/');

    if (receivedChallenge !== storedChallenge) {
      return res.status(400).json({ message: 'Biometric verification failed' });
    }

    // Generate JWT token — same as your normal login
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite:'none',
      maxAge:7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: 'Biometric login successful',
      data: {
        userId: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
