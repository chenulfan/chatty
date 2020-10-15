import mongoose from 'mongoose'
import Room from '../models/RoomSchema.js'
import moment from 'moment-timezone'
import generateUniqePrivateChatId from './generateUniqePrivateChatId.js'

export default async (currentUserId, selectedFriends, newMessage, isPrivateChat) => {

    const newRoom = new Room({
        created_date: moment().tz("asia/jerusalem").format(`DD/MM/YYYY`),
        created_time: moment().tz("asia/jerusalem").format(`HH:mm`),
        created_time_in_number: Date.now(),
        users: [currentUserId, ...selectedFriends],
        messages: [newMessage._id],
        is_private_chat: true,
        private_chat_id: generateUniqePrivateChatId(currentUserId, selectedFriends[0])
    })

    await newRoom.save()

    return newRoom
}

