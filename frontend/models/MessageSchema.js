import mongoose from 'mongoose';

const Schema = mongoose.Schema

const messageSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    sender: { type: mongoose.Types.ObjectId, ref: 'User' },
    sent_date: {
        type: String,
        required: true,
        trim: true
    },
    sent_time: {
        type: String,
        required: true,
        trim: true
    },
})

const Message = mongoose.model('Message', messageSchema)

export default Message;