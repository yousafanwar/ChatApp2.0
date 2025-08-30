import user from '../db/schemas/user.js';

export const updateIndUser = async (id, image) => {
    const response = await user.updateOne({ _id: id }, { $set: { avatar: image } });
    return response;
}

export const getAllUsers = async (loggesInUser) => {
    const response = await user.find({ _id: { $ne: loggesInUser } }).select("_id name email avatar");
    return response;
}

// add a contact to the myContacts arr
export const addToMyContacts = async (loggedInUserId, _id) => {
    await user.updateOne({ _id: loggedInUserId }, { $push: { myContacts: _id } });
}

export const fetchMyContacts = async (_id) => {
    try {
        const response = await user.findOne({ _id });
        const myContactsIds = response.myContacts;
        let userContacts = await Promise.all(myContactsIds.map(async (ele) => {
            return await user.findOne({ _id: ele });
        }))
        return { success: true, status: 200, message: "myContacts retrieved successfully", payload: userContacts };
    }
    catch (error) {
        return { success: false, status: 500, message: error }
    }
};

export const getIndUser = async (id) => {
    try {
        const userData = await user.findById(id, 'name email avatar').lean();
        if (!userData) {
            return { success: false, status: 404, message: "User not found" };
        }
        return { success: true, status: 200, message: "user retrieved successfully", payload: userData };
    } catch (error) {
        return { success: false, status: 500, message: error }
    };
};

const userService = {
    updateIndUser,
    getAllUsers,
    addToMyContacts,
    fetchMyContacts,
    getIndUser
};
export default userService;
