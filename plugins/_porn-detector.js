import uploadImage from '../lib/uploadImage.js'
import { webp2png } from '../lib/webp2mp4.js'
import fetch from 'node-fetch'
let { downloadContentFromMessage } = (await import(global.baileys))

let handler = m => m
handler.before = async function (m, { conn }) {
let media, link, buffer
try{
let q = m
let mime = (q.msg || q).mimetype || ''
if (!(/image/.test(mime)) || m.mtype == 'viewOnceMessageV2' || m.mtype == 'stickerMessage') return

let isTele = /^image\/(png|jpe?g)$/.test(mime)
if (isTele) {
media = await q.download()
link = await uploadImage(media)
}

if (m.mtype == 'viewOnceMessageV2') {
let msg = m.message.viewOnceMessageV2.message
let type = Object.keys(msg)[0]
if (type == 'imageMessage') {
media = await downloadContentFromMessage(msg[type], 'image')
buffer = Buffer.from([])
for await (const chunk of media) {
buffer = Buffer.concat([buffer, chunk])
}
link = await uploadImage(buffer)
}}

if (m.mtype == 'stickerMessage') {
media = await downloadContentFromMessage(msg[type], 'sticker')
/*buffer = Buffer.from([])
for await (const chunk2 of media) {
buffer = Buffer.concat([buffer, chunk2])
}
link = await uploadImage(buffer)*/
//media = await q.download()
buffer = await webp2png(media).catch(_ => null) || Buffer.alloc(0)
link = await uploadImage(buffer)
}

const response = await fetch(`https://api.alyachan.dev/api/porn-detector?image=${link}&apikey=GataDios`)
const result = await response.json()
await m.reply(link)
console.log(result.data.isPorn || 'null')
if (result.status && result.data && result.data.isPorn) {
await m.reply('La imagen contiene contenido para adultos.')
}
} catch (error) {
await m.reply(error)
}
  
}		
export default handler
