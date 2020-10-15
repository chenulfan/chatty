import { bucket } from '../storage.js'

export default async (avatarUrl) => {
    await bucket.file(avatarUrl).delete();
}