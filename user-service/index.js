import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from './db/db.js';
import router from './routes/routes.js';

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/users', router);

app.listen(5001, () => {
  console.log("App is listening on port 5001");
});
