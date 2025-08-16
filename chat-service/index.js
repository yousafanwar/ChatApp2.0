import express from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import router from './routes/routes.js';
import { Server } from "socket.io";
import http from 'http';
import message from './db/schemas/message.js';

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
});

io.on('connection', (socket) => {
    console.log('User has been connected', socket.id);

    socket.on('message', async (data) => {
        const { sender, receiver, text } = data;
        const newMessage = new message({ sender, receiver, text });
        await newMessage.save();
        io.emit('message', newMessage);
    })

    socket.on('fetchChat', async (data) => {
        const { sender, receiver } = data;
        const chats = await message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort({ timeStamp: 1 });

        io.emit('chatHistory', chats);

    });
    socket.on('disconnect', () => {
        console.log('user disconneted');
    })
})

app.use('/api/chats', router);

server.listen(5000, function () {
    console.log("app is listing on 5000");
})