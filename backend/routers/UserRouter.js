import express from 'express'
import User from '../models/UserSchema.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.post('/users', async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({
            name: user.name,
            email: user.email,
            token
        })
    } catch (error) {
        if (error._message == 'User validation failed') res.status(404).send('validation error')
        else if (error.code == 11000) res.status(404).send('email already exist')

    }
})

router.post('/users/login', async (req, res) => {
    //Login a registered user
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' })
        }

        const token = await user.generateAuthToken()
        res.status(200).send({
            currentUser: {
                _id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                token: user.token,
                rooms: user.rooms
            },
            friends: user.friends,
            friendRequests: user.friendRequests,
            pendingRequests: user.pendingRequests
        })

    } catch (error) {
        res.status(400).send(error.message ? error.message : null)
    }

})

router.post('/users/me/logout', authMiddleware, async (req, res) => {
    try {
        req.user.token = null
        req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/users', authMiddleware, async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } })
        .select('_id name email')
        .sort({ email: 'asc' })
    res.send(users)
})

router.get('/users/search/:searchVal', authMiddleware, async (req, res) => {
    const { searchVal } = req.params
    const regex = new RegExp(searchVal, 'i')
    const users = await User.find({ 'email': regex, _id: { $ne: req.user._id } }, 'id name email avatar fcmToken')
    const { friends, pendingRequests } = req.user
    const notFriendUsers = users.filter(user => !friends.includes(user) && !pendingRequests.includes(user))
    res.send(notFriendUsers)
})

router.get('/user/rooms', authMiddleware, async (req, res) => {
    const user = await User
        .findById(req.user._id).select('rooms')
        .populate({
            path: 'rooms',
            populate: {
                path: 'users',
                select: 'id name email avatar fcmToken'
            },
        })
        .populate({
            path: 'rooms',
            populate: {
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'id name email avatar'
                }
            }
        })
    res.send(user.rooms)
})

router.put('/user/name', authMiddleware, async (req, res) => {
    const user = req.user
    const newName = req.body.name
    if (newName.trim() !== '') {
        user.name = newName
        try {
            await user.save()
            res.status(200).send(newName)
        }
        catch (err) {
            res.end().status(400)
        }
    }
    else {
        res.end().status(400)
    }
})

router.put('/user/fcmToken', authMiddleware, async (req, res) => {
    const { user } = req
    user.fcmToken = req.body.fcmToken
    await user.save()
    res.sendStatus(204)
})


export default router