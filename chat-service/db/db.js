import mongoose from 'mongoose';
import message from './schemas/message.js';


const connectToDb = async () => {
    try {
        await mongoose.connect("mongodb://mongo:27017/ChatApp2_chat_service", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Db has been connected");
    } catch (error) {
        console.error(error);
    }
};

connectToDb();

export default mongoose;