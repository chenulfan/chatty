import mongoose from 'mongoose'
import User from '../models/UserSchema.js'
import Room from '../models/RoomSchema.js'

export const isUserInTheRoom = async (req, res, next) => {
    const { roomId } = req.body
    const userId = req.user._id  
    const user = await User.findById(userId)
    const isInTheRoom = user.rooms.find( id => id == roomId)
    if(isInTheRoom){
        next()
    }
    else{
        res.json({error: 'user is not in this room'}).status(403)
    }
}