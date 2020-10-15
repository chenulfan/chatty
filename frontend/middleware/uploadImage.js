import fs from 'fs'
import multiparty from 'multiparty'
import { bucket } from '../storage.js'
import sharp from 'sharp'

export default async (req, res, next) => {

    const form = new multiparty.Form();
    form.parse(req, async (error, fields, files) => {
        if (error) throw new Error(error);

        if (fields.useFor[0] === 'profile' && req.user.avatar) {
                const file = await bucket.file(req.user.avatar)
                file? file.delete() : null;
        }
        else if(fields.useFor[0] === 'chat'){
        }

        const path = files.file[0].path;
        const buffer = fs.readFileSync(path)
        const fileName = `${Date.now().toString()}-${files.file[0].originalFilename}`
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({});

        stream.on('error', (err) => {
            console.log(err);
        });
        stream.on('finish', async () => {
            req.fileName = fileName
            req.fields = fields
            next()
        });
        stream.end(
            await sharp(buffer)
                .resize(300, 300)
                .toBuffer()
        );
    })
}