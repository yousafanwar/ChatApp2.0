import userService from "../services/user_service.js";

export const updateUser = async (req, res) => {
    const id = req.params.id;
    const { avatar, name, email } = req.body;
    const response = await userService.updateIndUser(id, avatar, name, email);
    res.json(response);
}

export const getAllContacts = async (req, res) => {
    const { loggesInUser } = req.params;
    const response = await userService.getAllUsers(loggesInUser);
    res.json(response);
}

export const addToMyContactList = async (req, res) => {
    const { loggedInUserId, _id, email, name } = req.body;
    try {
        await userService.addToMyContacts(loggedInUserId, _id, email, name);
        res.status(200).json({ response: "Record created successfully" });
    }
    catch (error) {
        res.status(500).send(error);
    }
}

// returns the loggedIn user's myContacts arr
export const getUserContacts = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await userService.fetchMyContacts(id);
        res.status(response.status).json(response.payload);
    } catch (error) {
        res.status(500).send(error);
    }

};

export const getIndividualUser = async (req, res) => {
    const { id } = req.params;
    try {
        const response = await userService.getIndUser(id);
        res.status(response.status).json(response.payload);
    } catch (error) {
        res.status(500).send(error);
    }
};

const userControl = {
    updateUser,
    getAllContacts,
    addToMyContactList,
    getUserContacts,
    getIndividualUser
};

export default userControl;