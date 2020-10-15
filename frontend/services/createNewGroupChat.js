import mongoose from 'mongoose'
import Room from '../models/RoomSchema.js'
import moment from 'moment-timezone'

export default async (currentUserId, selectedFriends, roomName) => {

    const newRoom = new Room({
        name: roomName,
        creator: currentUserId,
        created_date: moment().tz("asia/jerusalem").format(`DD/MM/YYYY`),
        created_time: moment().tz("asia/jerusalem").format(`HH:mm`),
        created_time_in_number: Date.now(),
        users: [currentUserId, ...selectedFriends],
        messages: [],
        is_private_chat: false,
    })

    await newRoom.save()

    return newRoom
}

