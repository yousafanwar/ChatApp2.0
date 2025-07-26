import chatService from "../services/chatService.js";

const getAllMessages = async (req, res) => {
    const { sender, receiver } = req.body;
    const chats = await chatService.retrieveChats(sender, receiver);
    if (chats.payload) {
        res.status(chats.status).json({ message: chats.message, payload: chats.payload })
    } else {
        res.status(chats.status).send(chats.message);
    }
};

const createNewMessage = async (req, res) => {
    const { sender, receiver, text } = req.body;
    const chats = await chatService.createMessage(sender, receiver, text);
    if (chats.success) {
        res.status(chats.status).json({ message: chats.message })
    } else {
        res.status(chats.status).send(chats.message);
    }

};

const chatController = {
    getAllMessages,
    createNewMessage
};

export default chatController;