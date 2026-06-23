import jwt from 'jsonwebtoken'

async function userAuth(req, res, next) {

    const userToken = req.cookies.userToken

    if(!userToken) return res.status(402).json({authenticated: false})

    try {
        const decoded = jwt.verify(userToken,process.env.USER_JWT_SECRET)

        req.user = decoded

        console.log(decoded,'decoded user');
        
        next()

    } catch (error) {

        res.status(500).json({authenticated: false, message:'invalid token'})
        
    }
    
}


export default userAuth