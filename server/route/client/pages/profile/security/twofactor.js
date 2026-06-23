import express from 'express'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import path from 'path'
import User from '../../../../../model/client/pages/profile/user.js';
import userAuth from '../../../../../controller/userAuth.js';
import LoginHistory from '../../../../../model/client/pages/profile/security/loginhistory.js';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const route = express.Router()



// 3. NODEMAILER CONFIGURATION
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aminuroland452@gmail.com', // Replace with your email
        pass: 'szndmexauskdrwbe'     // Replace with your Gmail App Password
    }
});




// 4. ROUTES

// --- 2FA SETUP (Send Code) ---
route.post('/api/2fa/setup',userAuth, async (req, res) => {
    try {
        // In real app, get user ID from session/JWT
        const user = await User.findOne({ email: req.user.email }); 
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB with 5-minute expiry
        user.twoFactorCode = otp;
        user.twoFactorExpires = Date.now() + 300000; 
        await user.save();

        // Send Email
        await transporter.sendMail({
            from: '"Octfix Security" <no-reply@octfix.com>',
            to: req.user.email,
            subject:'Your Octfix Verification Code',
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2>Security Verification</h2>
                    <p>Your 6-digit verification code is:</p>
                    <h1 style="color: #2563eb; letter-spacing: 5px;">${otp}</h1>
                    <p>This code expires in 5 minutes.</p>
                   </div>`
        });

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

        await LoginHistory.create({
            userId: user._id,
            deviceName: result.device.model || result.os.name || "Desktop",
            browser: result.browser.name,
            os: result.os.name,
            ipAddress: ip,
            location: detectedLocation,
            status: '2fa_pending'
        });

        res.json({ message: "Verification code sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Error sending email" });
        console.log(error);
        
    }
});





// --- 2FA VERIFY (Enable Feature) ---
route.post('/api/2fa/verify',userAuth, async (req, res) => {
    const { code } = req.body;
    console.log( code )
    
    try {
        const user = await User.findOne({ 
            email: req.user.email, 
            twoFactorCode: code, 
            twoFactorExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired code" });


        // Finalize activation
        user.twoFactorEnabled = true;
        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        await user.save();

        res.json({ message: "2FA successfully enabled!" });
    } catch (error) {
        res.status(500).json({ message: "Server error during verification" });
        console.log(error);
        
    }
});




// login 2fa
route.post('/api/verify-2fa/login', async (req, res) => {
    const { email, code } = req.body;
    console.log(email, code);
    
    try {
        const user = await User.findOne({ 
            email: email, 
            twoFactorCode: code, 
            twoFactorExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired code" });
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

        // 1. Create the Session (Same logic as user.js)

        const newSession = {
            sessionId: uuidv4(),
            token: userToken, // Reuse the token from the auth check
            deviceName: result.device.model || result.os.name || "Desktop",
            os: result.os.name,
            browser: result.browser.name,
            ipAddress: req.ip || "::1",
            location: "Unknown", // Re-add your Geo-API logic here
            lastActive: new Date()
        };

        // 2. Housekeeping (Limit to 5)
        if (user.sessions.length >= 5) user.sessions.shift();
        user.sessions.push(newSession);

        user.twoFactorCode = undefined;
        user.twoFactorExpires = undefined;
        await user.save();

        res.cookie('userToken', userToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            sameSite: 'lax',
            path: '/'
        })

        res.json({ message: "Login verified!", success: true });
    } catch (error) {
        res.status(500).json({ message: "Verification failed", success: false });
        console.log(error);
        
    }
});




export default route