import { useContext, useEffect } from "react";
import { ProfileContext } from "../context/ProfileProvider";
import type { Profile, ProfileContextInterface } from "../context/ProfileProvider";

const UseProfile = () => {

    const userContext = useContext<ProfileContextInterface | undefined>(ProfileContext);

    if (!userContext) {
        throw Error("UseProfile must be used within Profile Provider");
    };
    const { profile, setProfile } = userContext;

    useEffect(() => {
        if (!profile) {
            try {
                const user = localStorage.getItem("profile");
                if (user) {
                    const parsedProfile: Profile | undefined = JSON.parse(user);
                    setProfile(parsedProfile);
                }
            } catch (error) {
                localStorage.removeItem("profile");
            }
        } else {
            localStorage.setItem("profile", JSON.stringify(profile));

        }
    }, [profile]);

    return { profile, setProfile };
}

export default UseProfile;