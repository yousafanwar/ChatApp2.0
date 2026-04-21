import { useState, useEffect, createContext } from "react";
import type { PropsWithChildren } from "react";
import toast from 'react-hot-toast';
import UseProfile from "../hooks/UseProfile";
import authenticationFailed from "../helperFunctions";
import { apiUrl } from "../config/apiBase";

export const UserContactsContext = createContext<IContact[]>([]);

// optional fields will be used in the implementation of of group chats
export interface IContact {
    _id: string,
    name: string,
    email: string,
    avatar: string,
    members?: Array<string>,
    adminId?: string
}

const UserContactsProvider = ({ children }: PropsWithChildren) => {

    const [myContactList, setMyContactList] = useState<IContact[]>([]);
    const userData = UseProfile();

    useEffect(() => {

        const fetchUserContacts = async () => {
            if (userData.profile?._id) {
                try {
                    const response = await fetch(apiUrl(`/user/getMyContacts/${userData.profile?._id}`), {
                        headers: {
                            authorization: `Bearer ${userData.profile?.token}`
                        }
                    });
                    const result = await response.json();
                    if (result.success) {
                        setMyContactList(result.payload);
                        await renderAllGroups();
                    } else {
                        toast.error(result.message || "Failed to load contacts");
                    }
                }
                catch (error) {
                    console.error(error);
                    toast.error("An error occurred while loading contacts");
                    authenticationFailed();
                }
            }
        };

        fetchUserContacts();
    }, [userData.profile?._id]);

    const renderAllGroups = async () => {
        if (userData) {
            try {
                const response = await fetch(apiUrl(`/user/getGroups/${userData.profile?._id}`), {
                    headers: {
                        authorization: `Bearer ${userData.profile?.token}`
                    }
                });
                const result = await response.json();
                if (result.success) {
                    setMyContactList((prevState) => [...prevState, ...result.payload.map((groupItem: IContact) => ({
                        groupId: groupItem._id,
                        name: groupItem.name,
                        email: groupItem.email,
                        avatar: groupItem.avatar,
                        members: groupItem.members,
                        adminId: groupItem.adminId,
                    }))]);
                } else {
                    toast.error(result.message || "Failed to load groups");
                }
            } catch (error) {
                console.error(error);
                toast.error("An error occurred while loading groups");
                authenticationFailed();
            }
        }
    }

    return (
        <UserContactsContext.Provider value={myContactList}>
            {children}
        </UserContactsContext.Provider>
    )
};

export default UserContactsProvider;