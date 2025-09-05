import { useState, useEffect, createContext } from "react";
import type { PropsWithChildren } from "react";
import UseProfile from "../hooks/UseProfile";

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
                    const response = await fetch(`http://localhost:5001/api/users/getMyContacts/${userData.profile?._id}`, {
                        headers: {
                            authorization: `Bearer ${userData.profile?.token}`
                        }
                    });
                    if (!response.ok) {
                        throw Error("Error while fetching myContacts");
                    }
                    const result = await response.json();
                    setMyContactList(result);
                    await renderAllGroups();
                }
                catch (error) {
                    console.error(error);
                }
            }
        };

        fetchUserContacts();
    }, [userData.profile?._id]);

         const renderAllGroups = async () => {
        if (userData) {
            const response = await fetch(`http://localhost:5001/api/users/getGroups/${userData.profile?._id}`);
            const result = await response.json();

            setMyContactList((prevState) => [...prevState, ...result.payload.map((groupItem: IContact) => ({
                groupId: groupItem._id,
                name: groupItem.name,
                email: groupItem.email,
                avatar: groupItem.avatar,
                members: groupItem.members,
                adminId: groupItem.adminId,
            }))]);
        }
    }

    return (
        <UserContactsContext.Provider value={myContactList}>
            {children}
        </UserContactsContext.Provider>
    )
};

export default UserContactsProvider;