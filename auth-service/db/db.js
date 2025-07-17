import mongoose from 'mongoose';

const connectToDb = async () => {
    try{
        await mongoose.connect("mongodb://mongo:27017/ChatApp2_user_service"), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        console.log("Db has been connected");
    }catch(error){
        console.error(error);
    }
};

connectToDb();

export default mongoose;