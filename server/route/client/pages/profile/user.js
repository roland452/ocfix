import express from 'express'
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
const route = express.Router()
import User from '../../../../model/client/pages/profile/user.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Upload from '../../../../multer.js'
dotenv.config()
import LoginHistory from '../../../../model/client/pages/profile/security/loginhistory.js';
import userAuth from '../../../../controller/userAuth.js'
import nodemailer from 'nodemailer'

//NODEMAILER CONFIGURATION
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aminuroland452@gmail.com', 
        pass: 'szndmexauskdrwbe'     
    }
});




// user login
route.post('/api/login', async(req, res) => {
    const {email, password} = req.body
    
    try {
        const user = await User.findOne({email})
        if(!user) return res.status(402).json({message:'no email found'})

       const passwordCheck = await bcrypt.compare(password, user.password)
        if(!passwordCheck) return res.status(402).json({message: 'invalid user'})

        // --- NEW 2FA CHECK ---
        if (user.twoFactorEnabled) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.twoFactorCode = otp;
            user.twoFactorExpires = Date.now() + 300000; // 5 mins
            await user.save();

            user.twoFactorCode = otp;
            user.twoFactorExpires = Date.now() + 300000; 
            await user.save();
            console.log(otp)
            // Send Email 
            await transporter.sendMail({
                from: '"Octfix Security" <no-reply@octfix.com>',
                to: email,
                subject:'Your Octfix Verification Code',
                html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                        <h2>Security Verification</h2>
                        <p>Your 6-digit verification code is:</p>
                        <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
                        <p>This code expires in 5 minutes.</p>
                    </div>`
            });
            return res.status(200).json({ 
                mfaRequired: true, 
                message: '2FA code sent to your email' 
            });
        }

        // 1. Get Device Info
        const parser = new UAParser(req.headers['user-agent']);
        const result = parser.getResult(); // Renamed to 'result' for clarity

        const ip = req.ip || req.headers['x-forwarded-for'] || "::1";
        let detectedLocation = "Unknown Location"; // Default

        // 2. Add the lookup logic
        if (ip !== "::1" && ip !== "127.0.0.1") {
            try {
                // We call an external API to turn the IP into a Location string
                const geo = await axios.get(`http://ip-api.com/json/${ip}`);
                if (geo.data.status === 'success') {
                    detectedLocation = `${geo.data.city}, ${geo.data.country}`;
                }
            } catch (err) {
                console.error("Geo-location lookup failed");
            }
        }

        // 2. Generate the Token FIRST so we can save it in the session
        const userToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                name: user.name,
                birthdate: user.birthdate,
                about: user.about,
                link: user.link,
                phone: user.phone,
                image: user.image,
                cv: user.cv,
                twoFactorEnabled: user.twoFactorEnabled,
                createdAt: user.createdAt || user.updatedAt
            },
            process.env.USER_JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )

        await LoginHistory.create({
            userId: user._id,
            deviceName: result.device.model || result.os.name || "Desktop",
            browser: result.browser.name,
            os: result.os.name,
            ipAddress: ip,
            location: detectedLocation,
            status: 'success'
        });

        // 3. Create the Session
        const newSession = {
            sessionId: uuidv4(), // Use the uuid you imported
            token: userToken,    // Use the actual generated token
            deviceName: result.device.model || result.os.name || "Desktop",
            os: result.os.name,
            browser: result.browser.name,
            ipAddress: ip,
            location: detectedLocation,
            lastActive: new Date()
        };

        if(user.sessions.length >= 5) {
            user.sessions.shift();
        }

        // 4. Update Database
        user.sessions.push(newSession)
        await user.save()
        
        // 5. Set Cookie and Response
        res.cookie('userToken', userToken, {
            httpOnly: true,
            secure: true,
            sameSite:'none',
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({ message:'login successful', user })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'error could not login'})
    }
})







//user signup
route.post('/api/signup', async(req, res) => {

    const { email, password, birthdate, phone, profession }  = req.body;

    try {
        const emailCheck = await User.findOne({email})
        if(emailCheck) return res.json({message: 'email already exist go to login'})

        const hashedPassword = await bcrypt.hash(password,10)

        const user = new User({
            email,
            password: hashedPassword,
            birthdate, phone, profession
        })

        await user.save()

        res.status(200).json({message: 'sign up successful'})

        
    } catch (error) {

        res.status(500).json({message:'error could not sign user up'})
    }
    res.status(200).json({message:'user signed up'})
})



// This route handles the face registration
route.post('/api/user/register-face', userAuth, async (req, res) => {
  try {
    const { descriptor } = req.body;

    if (!descriptor || descriptor.length !== 128) {
      return res.status(400).json({ message: "Invalid face descriptor data" });
    }

    // Find the logged-in user and save their face print
    const user = await User.findByIdAndUpdate(
      req.user.userId, 
      { 
        faceDescriptor: descriptor,
        isBiometricallyVerified: true 
      },
      { new: true }
    );

    res.status(200).json({ 
      success: true, 
      message: "Biometric profile updated successfully" 
    });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});







// auth check
route.get('/api/auth-check', userAuth, async(req, res) => {
    const user = req.user
    res.json({ 
        authenticated: true, 
        data: user
    }) 
})






// user profile
route.get('/api/profile', userAuth, async(req, res) => {
     
     
    try {

        const user = await User.findById(req.user.userId)

         const userToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                name: user.name,
                birthdate: user.birthdate,
                about: user.about,
                link: user.link,
                phone: user.phone,
                image: user.image,
            },
            process.env.USER_JWT_SECRET,
            {
                expiresIn: '1d'
            }
        )
        
        res.cookie('userToken',userToken,{
            httpOnly: true,
            secure: true,
            sameSite:'none',
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        res.json({ data: !user? req.user : user })

        
    } catch (error) {

        res.json({ message:'failed to fetch updated details' })
        
    }   

})





// Add this to your user/profile route file
route.patch('/api/user/update-avatar', userAuth, async (req, res) => {
  try {
    const { image } = req.body;
    const userId = req.user.userId;

    if (!image) return res.status(400).json({ message: 'No avatar provided' });

    await User.findByIdAndUpdate(userId, { image });

    res.status(200).json({ success: true, message: 'Avatar updated' });
  } catch (error) {
    console.error('Avatar update error:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
});




// user image upload
route.patch('/api/profile-image', Upload.single('image'), userAuth, async(req, res) => {

    const imageUrl = req.file ? req.file.path : '';

    try {
        
        const user = await User.findOne({email:req.user.email})
        if(!user) return res.status(404).json({message:'failed to update', success: false})
        user.image = imageUrl
        await user.save()
        return res.status(200).json({message:'profile image updated successfully', success: false})

    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:'failed to update', success: false})
        
    }
})






// user name update
route.patch('/api/update-name', userAuth, async(req, res) => {

    const { settings } = req.body

    try {
        
        const user = await User.findOne({email:req.user.email})
        if(!user) return res.status(404).json({message:'failed to update', success: false})
        user.name = settings
        await user.save()
        return res.status(200).json({message:'name updated successfully', success: false})

    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:'failed to update', success: false})
        
    }
})






// user phone number update
route.patch('/api/update-phone', userAuth, async(req, res) => {

    const { settings } = req.body

    try {
        
        const user = await User.findOne({email:req.user.email})
        if(!user) return res.status(404).json({message:'failed to update', success: false})
        user.phone = settings
        await user.save()
        return res.status(200).json({message:'phone number updated successfully', success: false})

    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:'failed to update', success: false})
        
    }
})






// user link update
route.patch('/api/update-link', userAuth, async(req, res) => {

    const { settings } = req.body

    try {
        
        const user = await User.findOne({email:req.user.email})
        if(!user) return res.status(404).json({message:'failed to update', success: false})
        user.link = settings
        await user.save()
        return res.status(200).json({message:'link updated successfully', success: false})

    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:'failed to update', success: false})
        
    }
})






// user about update
route.patch('/api/update-about', userAuth, async(req, res) => {

    const { settings } = req.body

    try {
        
        const user = await User.findOne({email:req.user.email})
        if(!user) return res.status(404).json({message:'failed to update', success: false})
        user.about = settings
        await user.save()
        return res.status(200).json({message:'about updated successfully', success: false})

    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:'failed to update', success: false})
        
    }
})




// user birthdate
route.patch('/api/update-birthdate', userAuth, async(req, res) => {

    const { settings } = req.body

    try {
        
        const user = await User.findOne({email:req.user.email})
        if(!user) return res.status(404).json({message:'failed to update', success: false})
        user.birthdate = settings
        await user.save()
        return res.status(200).json({message:'birthdate updated successfully', success: false})

    } catch (error) {
        
        console.log(error);
        res.status(500).json({message:'failed to update', success: false})
        
    }
})





// cv update route
route.patch('/api/update-cv', userAuth, Upload.single('image'), async (req, res) => {

    try {
        
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

        await User.findByIdAndUpdate(req.user.userId,{
            $push: { cv: imageUrl }
        })

        res.status(200).json({message:'cv updated successfully'})

               
    } catch (error) {

        console.log(error);
        
        res.status(500).json({message:'could not update cv'})
    }
    
})





export default route;