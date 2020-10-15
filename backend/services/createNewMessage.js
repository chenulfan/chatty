import mongoose from 'mongoose'
import Message from '../models/MessageSchema.js'
import moment from 'moment-timezone'

export default async (message, from) => {
    const newMessage = new Message({
        text: message,
        sender: from,
        sent_date: moment().tz("asia/jerusalem").format(`DD/MM/YYYY`),
        sent_time: moment().tz("asia/jerusalem").format(`HH:mm`),
    })

    await newMessage.save()

    await Message.populate(newMessage, {
        path: "sender",
        select: 'id name email avatar'
    })

    return newMessage
}