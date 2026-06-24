import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const app = express()
const MONGO_URI = process.env.MONGO_URI
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


mongoose.connect(MONGO_URI).then(() => {
    console.log('mongodb connection successful');
}).catch((err) => {
    console.log('mongodb connection failed');
})


app.use(cors({
    origin:['http://localhost:5173',`${process.env.CLIENT_URL}`],
    credentials: true,
    methods: ['GET','PUT','POST','PATCH','DELETE','OPTIONS'],
    allowedHeaders:['Content-Type','Authorization','Cookie']
}))
app.use(cookieParser())
app.use(express.json())
app.use('/uploads',express.static(path.join(__dirname,'uploads'),{
    setHeaders: (res, path) => {
        res.setHeader('Content-Disposition','attachment')
    }
}))



// admin route import
import adminRoute from './route/admin/admin.js'



// webAuth import
import webAuthRoute from './route/webAuth/webAuthRoute.js'
import fingerprintWebAuthRoute from './route/webAuth/fingerprintWebAuth.js'


// dashboard route import
import useDashboard from './route/client/pages/dashboard/dashboard.js'



//user route imports
import userRoute from './route/client/pages/profile/user.js'
import userFeedbackRoute from './route/client/pages/profile/feedback.js'
import userJobOffer from './route/client/pages/job/job.js'
import userOffers from './route/client/pages/appointment/appointment.js'
import userChats from './route/client/pages/chat/chat.js'

// security folder
import usePasswordUpdateRoute from './route/client/pages/profile/security.js'
import useTwoFactor from './route/client/pages/profile/security/twofactor.js'
import useLinkedDevice from './route/client/pages/profile/security/linkdevice.js'
import useLoginHistory from './route/client/pages/profile/security/loginhistory.js'
import useFaceId from './route/client/pages/profile/security/faceId.js'
import useNotice from './route/client/pages/profile/notice.js'

// transactions
import useTransaction from './route/client/pages/job/finances/transaction.js'

// review
import useReview from './route/client/pages/profile/review.js'




// webAuth usage 
app.use(webAuthRoute)
app.use(fingerprintWebAuthRoute)


// dashboard
app.use('/',useDashboard)

// route usage
app.use('/',userRoute)
app.use('/',userFeedbackRoute)
app.use('/',userJobOffer)
app.use('/',userOffers)
app.use('/',userChats)

// security folder
app.use('/',usePasswordUpdateRoute)
app.use('/',useTwoFactor)
app.use('/',useLinkedDevice)
app.use('/',useLoginHistory)
app.use('/',useFaceId)

app.use('/',useNotice)


// transactions
app.use('/',useTransaction)


// review
app.use('/',useReview);






export default app