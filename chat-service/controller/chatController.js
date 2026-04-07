import chatService from "../services/chatService.js";

const getAllMessages = async (req, res) => {
    try {
        const { sender, receiver } = req.body;
        const chats = await chatService.retrieveChats(sender, receiver);
        if (chats.success) {
            res.status(chats.status).json({ success: true, message: chats.message, payload: chats.payload });
        } else {
            res.status(chats.status).json({ success: false, message: chats.message });
        }
    } catch (err) {
        console.error('Get messages error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const createNewMessage = async (req, res) => {
    try {
        const { sender, receiver, text } = req.body;
        const chats = await chatService.createMessage(sender, receiver, text);
        if (chats.success) {
            res.status(chats.status).json({ success: true, message: chats.message });
        } else {
            res.status(chats.status).json({ success: false, message: chats.message });
        }
    } catch (err) {
        console.error('Create message error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const chatController = {
    getAllMessages,
    createNewMessage
};

export default chatController;