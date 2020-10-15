import mongoose from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { JWT_KEY } from '../server.config.js'

const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid Email address' })
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    avatar: {
        type: String,
    },
    token: {
        type: String,
        trim: true
    },
    rooms: {
        type: [{type: mongoose.Types.ObjectId, ref: 'Room'}]
    },
    friendRequests: {
        type: [{type: mongoose.Types.ObjectId, ref: 'User'}] 
    },
    pendingRequests: {
        type: [{type: mongoose.Types.ObjectId, ref: 'User'}] 
    },
    friends: {
        type: [{type: mongoose.Types.ObjectId, ref: 'User'}] 
    },
    fcmToken : {
        type: String
    }
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10)
    }
    next()
})

userSchema.methods.generateAuthToken = async function () {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({ _id: user._id }, JWT_KEY)

    user.token = token
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email }).populate('rooms')
    if (!user) {
        throw new Error('Wrong email or password')
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error('Wrong password')
    }
    return user
}

const User = mongoose.model('User', userSchema)
export default User

