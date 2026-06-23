import http from 'http'
import app from './app.js'
import dotenv from 'dotenv'
import { initSocket } from './socket/index.js'
dotenv.config()
const PORT = process.env.PORT || 5000

const server = http.createServer(app)

// Same CORS rules used for the REST API, so cookies are sent on the socket handshake too
const corsOptions = {
    origin: ['http://localhost:5173', `${process.env.CLIENT_URL}`],
    credentials: true
}

initSocket(server, corsOptions)

server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
})

