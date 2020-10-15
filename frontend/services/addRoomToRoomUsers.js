import mongoose from 'mongoose'
import User from '../models/UserSchema.js'

export default async (newRoom) => {
    const usersArray = []

    newRoom.users.forEach(userId => {
        const user = User.findByIdAndUpdate(
            userId,
            { '$push': { 'rooms': newRoom._id } }
        )
        usersArray.push(user)
    });

    await Promise.all(usersArray)
}