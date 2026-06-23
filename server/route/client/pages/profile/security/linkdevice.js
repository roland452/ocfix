import express from 'express'
import User from '../../../../../model/client/pages/profile/user.js';
import userAuth from '../../../../../controller/userAuth.js';
const route = express.Router()
import dotenv from 'dotenv'
dotenv.config()



/**
 * ROUTE: GET ALL SESSIONS 
 * Logic: Returns the list of devices to the LinkDevice.jsx component
 */

route.get('/api/auth/sessions',userAuth, async (req, res) => {
    try {
        // In a real app, 'req.user.id' comes from your Auth Middleware
        const user = await User.findById(req.user.userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        // Map the sessions to only send what the frontend needs
        const activeSessions = user.sessions.map(s => ({
            sessionId: s.sessionId,
            deviceName: s.os || "Unknown Device",
            browser: s.browser,
            location: s.location,
            lastActive: s.lastActive
        }));

        res.json(activeSessions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching sessions" });
        console.log(error)
    }
});

/**
 * ROUTE: REVOKE (LOGOUT) DEVICE
 * Logic: Removes the specific session ID from the user's array in MongoDB
 */
route.post('/api/auth/logout-device',userAuth, async (req, res) => {
    const { sessionId } = req.body;
    
    try {
        await User.updateOne(
            { _id: req.user.userId },
            { $pull: { sessions: { sessionId: sessionId } } }
        );

        res.json({ success: true, message: "Device access revoked" });
    } catch (error) {
        res.status(500).json({ message: "Failed to revoke access" });
    }
});


export default route