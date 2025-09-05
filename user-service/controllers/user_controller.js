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

export const createNewGroup = async (req, res) => {
    const { name, members, adminId } = req.body;
    try {
        const response = await userService.createGroup(name, members, adminId);
        const obj = {
            success: response.success,
            message: response.message,
            payload: response.payload
        }
        res.status(response.status).json(obj);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
};

// get all groups is user is member of or isAdmin
export const getGroups = async (req, res) => {
    const id = req.params.id;
    try {
        const response = await userService.retrieveGroups(id);
        const obj = {
            success: response.success,
            message: response.message,
            payload: response.payload
        }
        res.status(response.status).json(obj);
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' })
    }
};

export const updateGroup = async (req, res) => {
    const { newMember, groupId } = req.body;

    try {
        const response = await userService.updateUserGroup(newMember, groupId);
        const obj = {
            success: response.success,
            message: response.message,
            payload: response.payload
        }
        res.status(response.status).json(obj);
    }
    catch (error) {
        res.status(500).send('internal server error');
    }
};

// gets every individual of a group
export const getAllGroupMembers = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await userService.getGroupMembers(id);
        const obj = {
            success: response.success,
            message: response.message,
            payload: response.payload
        }
        res.status(response.status).json(obj);
    } catch (error) {
        res.status(500).send("Internal server error");
    }
};

const userControl = {
    updateUser,
    getAllContacts,
    addToMyContactList,
    getUserContacts,
    getIndividualUser,
    createNewGroup,
    getGroups,
    updateGroup,
    getAllGroupMembers
};

export default userControl;