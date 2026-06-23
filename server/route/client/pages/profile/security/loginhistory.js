import express from 'express';
import LoginHistory from '../../../../../model/client/pages/profile/security/loginhistory.js';
const route = express.Router();
import userAuth from '../../../../../controller/userAuth.js';




route.get('/api/login-history',userAuth, async(req, res) => {
   
    try {
        const user = await LoginHistory.find({userId: req.user.userId}).sort({ createdAt:-1 })

        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({message: 'failed to get login history'})
    }

})





export default route;


