import { PORT, JWT_KEY } from './server.config.js'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import userRouter from './routers/UserRouter.js'
import chatRouter from './routers/ChatRoomRouter.js'
import authMiddleware from './middleware/auth.js'
import socketIo from 'socket.io'
import socketioJwt from 'socketio-jwt'
import socketEvents from './socket.js'
import redisClient from './redis.js'
import path from 'path'
const __dirname = path.resolve();

redisClient.on('connect', () => {
    console.log('Redis client connected');
});

const app = express()
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json())
app.use(cors())
app.use(userRouter)
app.use(chatRouter)

app.use((err, req, res, next) => {
    res.status(500).json({
        error: err,
        message: 'Internal server error!',
    })
    next()
})

const server = app.listen(PORT, () => {
    console.log(`listening to http://localhost:${PORT}`)
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chat',
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    mongoose.set('useFindAndModify', false);
})

const io = socketIo(server)

io.use(socketioJwt.authorize({
    secret: JWT_KEY,
    handshake: true // TODO - Check the meaning of handshake
}));

socketEvents(io)

app.get('/health', (req, res) => {
    res.json({ health: true }).status(200)
})

// TODO: refactor later
app.get('/auth', authMiddleware, (req, res) => {
    res.send(req.user).status(200)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname,'build', 'index.html'));
});
