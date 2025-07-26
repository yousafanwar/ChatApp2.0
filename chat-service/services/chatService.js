import message from "../db/schemas/message.js";

const retrieveChats = async (sender, receiver) => {
    try {
        const chats = await message.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort({ timeStamp: 1 });
        return { success: true, status: 200, message: "chats retrieved successfully", payload: chats };
    } catch (err) {
        console.log("Error while retrieving messages:", err)
        return { success: false, status: 500, message: "Internal server error" }
    }
};

const createMessage = async (sender, receiver, text) => {
    try {
        const newMessage = new message({ sender, receiver, text });
        await newMessage.save();
        return { success: true, status: 200, message: "chat created successfully" };
    } catch (err) {
        return { success: false, status: 500, message: "Internal server error" }
    }
};

const chatService = {
    retrieveChats,
    createMessage
}

export default chatService;