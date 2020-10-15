import generateUniqePrivateChatId from './generateUniqePrivateChatId.js'
import mongoose from 'mongoose'
import Room from '../models/RoomSchema.js'

export default async (currentUserId, friendId) => {
    const privateChatUuid = generateUniqePrivateChatId(currentUserId, friendId)
    const privateChat = await Room.find({
        private_chat_id: privateChatUuid
    })
    return privateChat.length ? true : false

}