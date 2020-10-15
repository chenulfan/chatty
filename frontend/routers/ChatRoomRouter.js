import express from 'express'
import User from '../models/UserSchema.js'
import Room from '../models/RoomSchema.js'
import authMiddleware from '../middleware/auth.js'
import mongoose from 'mongoose'
import isPrivateChatExist from '../services/isPrivateChatExist.js'
import createNewMessage from '../services/createNewMessage.js'
import createNewPrivateChat from '../services/createNewPrivateChat.js'
import addRoomToRoomUsers from '../services/addRoomToRoomUsers.js'
import createNewGroupChat from '../services/createNewGroupChat.js'
import uploadImage from '../middleware/uploadImage.js'
import deleteUserFromCloud from '../services/deleteImageFromCloud.js'

const router = express.Router()

router.post('/room', authMiddleware, async (req, res) => {
    const { currentUserId, selectedFriends, isPrivateChat, roomName, message } = req.body

    if (selectedFriends.length) {
        if (isPrivateChat && await isPrivateChatExist(currentUserId, selectedFriends[0])) {
            res.status(400).send("error")
        }
        else {
            let newRoom
            if (isPrivateChat) {
                const newMessage = await createNewMessage(message, currentUserId)
                newRoom = await createNewPrivateChat(currentUserId, selectedFriends, newMessage)
                await addRoomToRoomUsers(newRoom)
            }
            else {
                newRoom = await createNewGroupChat(currentUserId, selectedFriends, roomName)
                await addRoomToRoomUsers(newRoom)
            }
            await Room.populate(newRoom, {
                path: 'messages',
                populate: {
                    path: 'sender',
                    select: 'id name email avatar'
                }
            })
            await Room.populate(newRoom,
                { path: 'users', select: 'id name email avatar fcmToken' })

            res.status(201).send(newRoom)
        }
    }
    else {
        res.status(400)
    }
})

router.put('/upload/image/profile', authMiddleware, uploadImage, async (req, res) => {
    const { user } = req
    user.avatar = req.fileName
    user.save()
    res.send(req.fileName).status(200)
})

router.put('/upload/image/room', authMiddleware, uploadImage, async (req, res) => {
    const roomId = req.fields.roomId[0]
    await Room.findByIdAndUpdate(roomId, { avatar: req.fileName })
    res.end().status(204)
})

router.delete('/image/profile', authMiddleware, async (req, res) => {
    await deleteUserFromCloud(req.user.avatar)
    const { user } = req
    user.avatar = ''
    user.save()
    res.status(200).send(req.fileName)
})



export default router
