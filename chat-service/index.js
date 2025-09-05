import express from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import router from './routes/routes.js';
import { Server } from "socket.io";
import http from 'http';
import message from './db/schemas/message.js';
import imageAttachments from './db/schemas/imageMessage.js';
import videoAttachments from './db/schemas/videoMessage.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
    maxHttpBufferSize: 1e8  
});

io.on('connection', (socket) => {
    console.log('User has been connected', socket.id);

    socket.on('message', async (data) => {
        try {
            const { sender, receiver, text, blob, blobType, groupId } = data;
            const newMessage = new message({ sender, receiver, text, groupId });
            const imageResource = blob && blobType.includes("image") && new imageAttachments({ originalMessageId: newMessage._id, dbBlob: blob });
            const videoResource = blob && blobType.includes("video") && new videoAttachments({ originalMessageId: newMessage._id, dbBlob: blob });
            const senderAvatar = await getIndividualUser(sender);

            await Promise.all([
                newMessage.save(),
                blob && blobType.includes("image") && imageResource.save(),
                blob && blobType.includes("video") && videoResource.save(),
            ])

            const obj = {
                id: newMessage._id,
                sender: newMessage.sender,
                receiver: newMessage.receiver,
                text: newMessage.text,
                timeStamp: newMessage.timeStamp,
                blobFetchedFromDb: blob,
                groupId: newMessage.groupId,
                blobType,
                senderAvatar
            }
            io.emit('message', obj);
        } catch (error) {
            io.emit('message', error);
        }
    })

    socket.on('fetchChat', async (data) => {
        const { sender, receiver, groupId } = data;
        let blobFetchedFromDb = null;
        let blobType = "";
        let chats = [];

        if (groupId) {
            chats = await message.find({ groupId });
        } else {
            chats = await message.find({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender },
                ],
                groupId: null
            }).sort({ timeStamp: 1 });
        }

        const retrievedChats = await Promise.all(
            chats.map(async (item) => {
                const chatImages = await imageAttachments.find({ originalMessageId: item._id });
                const chatVideos = await videoAttachments.find({ originalMessageId: item._id });
                const senderData = await getIndividualUser(item.sender);
                const senderAvatar = senderData.avatar;
                const senderName = senderData.name;
                if (chatImages.length > 0) {
                    blobFetchedFromDb = chatImages[0].dbBlob;
                    blobType = "image";
                }
                if (chatVideos.length > 0) {
                    blobFetchedFromDb = chatVideos[0].dbBlob;
                    blobType = "video";
                }

                const obj = {
                    _id: item._id,
                    sender: item.sender,
                    receiver: item.receiver ? item.receiver : null,
                    text: item.text,
                    timeStamp: item.timeStamp,
                    blobFetchedFromDb,
                    blobType,
                    senderAvatar,
                    senderName,
                    groupId: item.groupId ? item.groupId : null,
                }
                blobFetchedFromDb = null;
                blobType = null;

                return obj;
            })
        );

        io.emit('chatHistory', retrievedChats);

    });
    socket.on('disconnect', () => {
        console.log('user disconneted');
    })
})

// call user service
const getIndividualUser = async (id) => {
    const response = await fetch(`http://user-service:5001/api/users/getIndividualUser/${id}`);
    if (!response.ok) throw new Error("Service call failed");
    return response.json();
};

app.use('/api/chats', router);

server.listen(5000, function () {
    console.log("app is listing on 5000");
})