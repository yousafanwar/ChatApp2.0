import userService from "../services/user_service.js";

export const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { avatar, name, email } = req.body;
        const response = await userService.updateIndUser(id, avatar, name, email);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const getAllContacts = async (req, res) => {
    try {
        const { loggesInUser } = req.params;
        const response = await userService.getAllUsers(loggesInUser);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (err) {
        console.error('Get all contacts error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const addToMyContactList = async (req, res) => {
    try {
        const { loggedInUserId, _id, email, name } = req.body;
        const result = await userService.addToMyContacts(loggedInUserId, _id, email, name);
        if (result.success) {
            res.status(result.status).json({ success: true, message: result.message });
        } else {
            res.status(result.status).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Add to contacts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// returns the loggedIn user's myContacts arr
export const getUserContacts = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await userService.fetchMyContacts(id);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Get user contacts error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getIndividualUser = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await userService.getIndUser(id);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Get individual user error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const createNewGroup = async (req, res) => {
    try {
        const { name, members, adminId } = req.body;
        const response = await userService.createGroup(name, members, adminId);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// get all groups is user is member of or isAdmin
export const getGroups = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await userService.retrieveGroups(id);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Get groups error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateGroup = async (req, res) => {
    try {
        const { newMember, groupId } = req.body;
        const response = await userService.updateUserGroup(newMember, groupId);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// gets every individual of a group
export const getAllGroupMembers = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await userService.getGroupMembers(id);
        if (response.success) {
            res.status(response.status).json({ success: true, message: response.message, payload: response.payload });
        } else {
            res.status(response.status).json({ success: false, message: response.message });
        }
    } catch (error) {
        console.error('Get group members error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
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