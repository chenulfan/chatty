import { JWT_KEY } from '../server.config.js'
import jwt from 'jsonwebtoken'
import User from '../models/UserSchema.js'


const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, JWT_KEY)
        const user = await User.findOne({ _id: data._id, token: token })
            .select('-password')
            .populate('rooms')
            .populate({path: 'friends', select: 'id name email avatar' })
            .populate({path: 'friendRequests', select: 'id name email avatar' })
            .populate({path: 'pendingRequests', select: 'id name email avatar' })
        if (!user) {
            throw new Error()
        }
        req.user = user
        req.token = token
        next()
    } catch (error) {
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }

}

export default auth