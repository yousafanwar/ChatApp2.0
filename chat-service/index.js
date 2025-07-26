import express from 'express';
import cors from 'cors';
import mongoose from './db/db.js';
import router from './routes/routes.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use('/api/chats', router);

app.listen(5000, function (req, res) {
    console.log("app is listing on 5000");
})