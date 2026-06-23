import express from 'express'
const route = express.Router()
import admin from '../../model/admin/admin.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()




//admin login
route.post('/api/admin-login', async(req, res) => {

    const {email, password} = req.body
    
    try {

        const admin = await admin.findOne({email})
        if(!admin) return res.status(402).json({message:'no email found'})

        const passwordCheck = await bcrypt.compare(admin.password, password)
        if(!passwordCheck) res.status(402).json({message: 'invalid admin'})

        const adminToken = jwt.sign(
            {
                adminId: admin._id,
                email: admin.email
            },
            process.env.ADMIN_SECRET_KEY,
            {
                expiresIn: '1d'
            }
        )
        
        res.cookie('adminToken',adminToken,{
            httpOnly: true,
            secure: false,
            sameSite:'lax',
            path:'/'
        })

        res.status(200).json({ adminId: admin._id, email: admin.email })
        
    } catch (error) {

        res.status(500).json({message: 'error could not login'})
    }
})





export default route