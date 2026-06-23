import express from 'express';
import { UAParser } from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../../../model/client/pages/profile/user.js';
import userAuth from '../../../../../controller/userAuth.js';
import LoginHistory from '../../../../../model/client/pages/profile/security/loginhistory.js';
const route = express.Router();


//** faceId registeration route */
route.post('/api/face-register',userAuth, async (req, res) => {
    const matric = req.user.matric;
    const { faceDescriptor } = req.body;
    console.log(faceDescriptor);
    
    try {
        
        const user = await User.findOne({ matric })

        user.faceDescriptor = faceDescriptor;
        await user.save();

        res.status(201).json({ success: true, message: "User registered!" });

    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(400).json({ message: "Registration Failed" });
    }
});



// Helper: Calculate Euclidean distance for Face descriptors
const getFaceDistance = (desc1, desc2) => Math.sqrt(desc1.reduce((acc, val, i) => acc + Math.pow(val - desc2[i], 2), 0));


// ** face login route
route.post('/api/face-login', async (req, res) => {
    const { matric, faceDescriptor } = req.body;

    try {
        const user = await User.findOne({ matric });

        // 1. Safety check: Does the student even exist?
        if (!user || !user.faceDescriptor) {
            return res.status(404).json({ message: "Student not found or Face ID not enrolled", success: false });
        }

        const distance = getFaceDistance(user.faceDescriptor, faceDescriptor);

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



        if (distance < 0.45) { 
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
                secure: false, // Set to true if using HTTPS
                sameSite: 'lax',
                path: '/'
            })
    
            res.status(200).json({ message:'login successful', user })
        }

        // 2. If distance is too high, reject
        res.status(401).json({ 
            message: "Face not recognized", 
            success: false,
            // distance: distance // Uncomment this only during testing!
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "An error occurred on the server", success: false });
    }
});




export default route;


