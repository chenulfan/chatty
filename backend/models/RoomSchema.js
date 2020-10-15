import mongoose from 'mongoose'

const Schema = mongoose.Schema

const roomSchema = new Schema({
    name: {
        type: String,
        minlength: 1,
        maxlength: 25,
        trim: true
    },
    creator: { type: mongoose.Types.ObjectId, ref: 'User' },
    created_date: {
        type: String,
        required: true,
        trim: true
    },
    created_time: {
        type: String,
        required: true,
        trim: true
    },
    created_time_in_number: {
        type: Number,
    },
    users: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'User' }]
    },
    messages: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Message' }]
    },
    last_message_sent_time: {
        type: Number
    },
    avatar: {
        type: String,
    },
    is_private_chat: {
        type: Boolean
    },
    private_chat_id: {
        type: String
    }
})

const Room = mongoose.model('Room', roomSchema)

export default Room;