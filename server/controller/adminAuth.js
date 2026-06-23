import jwt from 'jsonwebtoken'

async function adminAuth(req, res, next) {
    
    const adminToken = req.cookies.adminToken
    if(!adminToken) return res.status(401).json({authenticated: false})

    try {
        const decoded = jwt.verify(adminToken, process.env.ADMIN_SECRET_KEY)

        req.admin = decoded
        console.log(decoded, 'admin decoded');
        

        next()
    } catch (error) {

        res.status(401).json({authenticated: false, message:'invalid token'})
    }
}


export default adminAuth