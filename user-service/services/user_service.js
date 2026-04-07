import user from '../db/schemas/user.js';
import group from '../db/schemas/group.js';

export const updateIndUser = async (id, avatar, name, email) => {
    try {
        const response = await user.updateOne({ _id: id }, { $set: { avatar, name, email } });
        if (response.acknowledged) {
            return { success: true, status: 200, message: "User updated successfully" };
        } else {
            return { success: false, status: 500, message: "Failed to update user" };
        }
    } catch (error) {
        return { success: false, status: 500, message: "Internal server error" };
    }
}

export const getAllUsers = async (loggesInUser) => {
    try {
        const users = await user.find({ _id: { $ne: loggesInUser } }).select("_id name email avatar");
        return { success: true, status: 200, message: "Users retrieved successfully", payload: users };
    } catch (error) {
        return { success: false, status: 500, message: "Internal server error" };
    }
}

// add a contact to the myContacts arr
export const addToMyContacts = async (loggedInUserId, _id) => {
    try {
        await user.updateOne({ _id: loggedInUserId }, { $push: { myContacts: _id } });
        return { success: true, status: 200, message: "Contact added successfully" };
    } catch (error) {
        return { success: false, status: 500, message: "Internal server error" };
    }
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

export const createGroup = async (name, members, adminId) => {
    try {
        const newGroup = new group({ name, members, adminId });
        await newGroup.save();
        return { success: true, status: 200, message: "group created successfully", payload: newGroup };
    } catch (error) {
        return { success: false, status: 500, message: "Internal server error" };
    }
};

const retrieveGroups = async (id) => {
    try {
        const response = await group.find({ $or: [{ members: id }, { adminId: id }] });
        return { success: true, status: 200, message: "groups retrieved successfully", payload: response };
    }
    catch (error) {
        return { success: false, status: 500, message: error }
    }
};

export const updateUserGroup = async (newMember, groupId) => {
    try {
        let updatedGroup = await group.findByIdAndUpdate(groupId, { $push: { members: newMember } }, { new: true });
        if (!updatedGroup) {
            return { success: false, status: 404, message: 'Could not find the group' };
        } else {
            return { success: true, status: 200, message: 'group members updated successfully', payload: updatedGroup };
        }
    } catch (error) {
        return { success: false, status: 500, message: 'Internal server error' };
    }
};

export const getGroupMembers = async (id) => {
    try {
        const allGroupMembers = await group.findOne({ $or: [{ members: id }, { adminId: id }] }, 'members adminId');
        console.log("allGroupMembers", allGroupMembers);
        const [chatMemberIds, chatAdminId] = await Promise.all([
            Promise.all(
                allGroupMembers.members.map(id => user.findById(id, 'name'))
            ),
            user.findById(allGroupMembers.adminId, 'name')
        ]);
        const responseObj = { groupMembers: chatMemberIds, groupAdmin: chatAdminId };
        return { success: true, status: 200, message: 'group members retrieved successfully', payload: responseObj };

    } catch (error) {
        return { success: false, status: 500, message: error }
    }
};

const userService = {
    updateIndUser,
    getAllUsers,
    addToMyContacts,
    fetchMyContacts,
    getIndUser,
    createGroup,
    retrieveGroups,
    updateUserGroup,
    getGroupMembers
};
export default userService;
