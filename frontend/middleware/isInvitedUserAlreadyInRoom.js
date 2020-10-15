import mongoose from 'mongoose'
import User from '../models/UserSchema.js'
import Room from '../models/RoomSchema.js'

export const isInvitedUserAlreadyInRoom = async (req, res, next) => {

    const { roomId, userId } = req.body  
    const user = await User.findById(userId)
    const isInTheRoom = user.rooms.find( id => id == roomId)
    if(!isInTheRoom){
        next()
    }
    else{
        res.json({error: 'user is already in this room'}).status(403)
    }
}