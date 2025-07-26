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
export const addToMyContacts = async (loggedInUserId, _id, email, name) => {
    await user.updateOne({ _id: loggedInUserId }, { $push: { myContacts: _id } });
}

const userService = {
    updateIndUser,
    getAllUsers,
    addToMyContacts,
};
export default userService;
