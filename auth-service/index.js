import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from './db/db.js';
import router from './routes/routes.js';
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'https://295vmfn5-5173.asse.devtunnels.ms'],
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', router);

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(process.env.port, () => {
  console.log(`App is listening on port ${process.env.port}`);
});
