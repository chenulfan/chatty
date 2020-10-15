import Room from "./models/RoomSchema.js";
import User from "./models/UserSchema.js";
import Message from "./models/MessageSchema.js";
import redisClient from './redis.js'
import createNewMessage from "./services/createNewMessage.js";
const SELECT_ATTRS_FROM_DB = 'id name email avatar fcmToken'

export default (io) => {

    io.on("connection", (socket) => {

        const currentUserId = socket.decoded_token._id
        const currentSocketId = socket.id
        redisClient.set(currentUserId, currentSocketId)

        socket.on("unauthorized", function (error, callback) {
            console.log("unauthorized")
            if (error.data.type == "UnauthorizedError" || error.data.code == "invalid_token") {
                console.log("User's token has expired");
            }
        });

        socket.on("error", function (error) {
            if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
                console.log("User's token has expired");
            }
        });

        socket.on('disconnect', () => {
            console.log(`ID ${socket.decoded_token._id} disconnected`)
            redisClient.del(socket.decoded_token._id)
        });

        socket.on('join_room', async (userId, roomId) => {
            console.log(`joining to room ${roomId}`)
            socket.join(roomId)

            await Room.findByIdAndUpdate(
                roomId,
                { '$push': { 'users': userId } }
            )

            await User.findByIdAndUpdate(
                userId,
                { '$push': { 'rooms': roomId } }
            )

            socket.broadcast.in(roomId).emit('join_room', `${userId} join to the room`) // to all group members except the sender 
        })

        socket.on('typing', (from, to) => {
            socket.broadcast.to(to).emit('typing', from, to) // to all group members except the sender 
        })

        socket.on('stopped_typing', (to) => {
            socket.broadcast.to(to).emit('stopped_typing', to)
        })

        socket.on('room_created', async (newRoomUsers, newRoomId) => {
            for (let user of newRoomUsers) {
                const socketUserId = await redisClient.getAsync(user._id.toString())
                io.sockets.to(socketUserId).emit('room_created', newRoomId)
            }
        })
        socket.on('join_created_room', (roomId) => {
            socket.join(roomId)
        })

        socket.on('join_all_rooms', (rooms) => {
            rooms.forEach(room => {
                socket.join(room._id)
            })
        })

        socket.on('send_message', async ({ from, to, message }) => {
            const sendTime = Date.now()
            try {
                const newMessage = await createNewMessage(message, from)
                await Room.findOneAndUpdate(
                    { _id: to },
                    { $push: { messages: newMessage._id }, last_message_sent_time: sendTime }
                )
                io.sockets.to(to).emit('send_message', newMessage, to, sendTime)

            }
            catch (err) {
                io.sockets.to(currentSocketId).emit('send_message', err)
            }
        })

        socket.on('add_friend', async ({ friendId }) => {
            // upadate the pending requests of the USER! 
            const currentUser = await User.findByIdAndUpdate(
                currentUserId,
                { $push: { pendingRequests: friendId } }
            ).select(SELECT_ATTRS_FROM_DB)

            // upadate the Friend requests of the FRIEND! 
            const friend = await User.findByIdAndUpdate(
                friendId,
                { $push: { friendRequests: currentUserId } }
            ).select(SELECT_ATTRS_FROM_DB)

            io.sockets.to(currentSocketId).emit('friend_request_sent', friend)

            const friendSocketId = await redisClient.getAsync(friendId.toString())

            io.sockets.to(friendSocketId).emit('new_friend_request', currentUser)
        })

        socket.on('delete_friend_request', async ({ friendId }) => {

            const currentUser = await User.findByIdAndUpdate(
                currentUserId,
                {
                    $pull: { pendingRequests: friendId }
                }
            ).select(SELECT_ATTRS_FROM_DB)

            const friend = await User.findByIdAndUpdate(
                friendId,
                {
                    $pull: { friendRequests: currentUserId }
                }
            ).select(SELECT_ATTRS_FROM_DB)

            io.sockets.to(currentSocketId).emit('remove_pending_request', friend)

            const friendSocketId = await redisClient.getAsync(friendId.toString())

            io.sockets.to(friendSocketId).emit('remove_friend_request', currentUser)
        })

        socket.on('approve_friend', async (friendId) => {

            const currentUser = await User.findByIdAndUpdate(
                currentUserId,
                {
                    $push: { friends: friendId },
                    $pull: { friendRequests: friendId }
                }
            ).select(SELECT_ATTRS_FROM_DB)

            const friend = await User.findByIdAndUpdate(
                friendId,
                {
                    $push: { friends: currentUserId },
                    $pull: { pendingRequests: currentUserId }
                }
            ).select(SELECT_ATTRS_FROM_DB)

            io.sockets.to(currentSocketId).emit('remove_friend_request_and_update_friends', friend)

            const friendSocketId = await redisClient.getAsync(friendId.toString())

            io.sockets.to(friendSocketId).emit('remove_pending_request_and_update_friends', currentUser)
        })

        socket.on('decline_friend', async (friendId) => {

            const currentUser = await User.findByIdAndUpdate(
                currentUserId,
                {
                    $pull: { friendRequests: friendId }
                }
            ).select(SELECT_ATTRS_FROM_DB)

            const friend = await User.findByIdAndUpdate(
                friendId,
                {
                    $pull: { pendingRequests: currentUserId }
                }
            ).select(SELECT_ATTRS_FROM_DB)

            io.sockets.to(currentSocketId).emit('remove_friend_request', friend)

            const friendSocketId = await redisClient.getAsync(friendId.toString())

            io.sockets.to(friendSocketId).emit('remove_pending_request', currentUser)
        })
    })
}