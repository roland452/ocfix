import express from 'express'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
dotenv.config()
import userAuth from '../../../../controller/userAuth.js'
import User from '../../../../model/client/pages/profile/user.js'

const route = express.Router()



route.post('/api/password-update',userAuth, async(req, res) => {

    const { password, newPassword } = req.body

    try {

        const user = await User.findOne({email:req.user.email})

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(402).json({message:'invalid password could not update password', success: false})

        const hashedPassword = await bcrypt.hash(newPassword,10)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({message:'password updated successfully', success: true})
        console.log('password updated successfully');
        

    } catch (error) {

        console.log(error);
        res.status(500).json({ message:'failed to update', success: false})
    }
    
})



export default route;