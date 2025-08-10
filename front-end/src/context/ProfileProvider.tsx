import { useState, createContext } from "react";
import type { PropsWithChildren } from "react";

export interface Profile {
    _id: string
    name: string
    email: string
    myContacts: Array<string>
    avatar: string
    timeStamp: string
    token: string
};

export interface ProfileContextInterface {
    profile: Profile | undefined
    setProfile: (profile: Profile | undefined) => void;
}

export const ProfileContext = createContext<ProfileContextInterface | undefined>(undefined);

const ProfileProvider = ({ children }: PropsWithChildren) => {

    const [profile, setProfile] = useState<Profile | undefined>(undefined);

    return (
        <>
            <ProfileContext.Provider value={{ profile, setProfile }}>
                {children}
            </ProfileContext.Provider>
        </>
    )
}

export default ProfileProvider;