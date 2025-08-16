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
                }
                catch (error) {
                    console.error(error);
                }
            }
        };

        fetchUserContacts();
    }, [userData.profile?._id]);

    return (
        <UserContactsContext.Provider value={myContactList}>
            {children}
        </UserContactsContext.Provider>
    )
};

export default UserContactsProvider;