
import path from 'path'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import googleCloud from '@google-cloud/storage'
const { Storage } = googleCloud
const BUCKET_NAME = 'chatty-bucket'

const gcs = new Storage({
    keyFilename: path.join(__dirname, './cloudConfig.json'),
    projectId: 'chatty-message-app'
})
export const bucket = gcs.bucket(BUCKET_NAME);