import { useContext, useEffect } from "react";
import { ProfileContext } from "../context/ProfileProvider";
import type { Profile, ProfileContextInterface } from "../context/ProfileProvider";
import { apiUrl } from "../config/apiBase";

const UseProfile = () => {

    const userContext = useContext<ProfileContextInterface | undefined>(ProfileContext);

    if (!userContext) {
        throw Error("UseProfile must be used within Profile Provider");
    };
    const { profile, setProfile } = userContext;

    useEffect(() => {
        const initializeProfile = async () => {
            if (profile) {
                localStorage.setItem("profile", JSON.stringify(profile));
                return;
            }

            try {
                const user = localStorage.getItem("profile");
                if (!user) {
                    return;
                }

                const parsedProfile: Profile | undefined = JSON.parse(user);
                if (!parsedProfile?.token) {
                    localStorage.removeItem("profile");
                    return;
                }

                const authResponse = await fetch(apiUrl("/auth/authenticate"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${parsedProfile.token}`
                    }
                });

                const authResult = await authResponse.json();
                if (authResult.success) {
                    setProfile(parsedProfile);
                    return;
                }

                if (!parsedProfile.refreshToken) {
                    localStorage.removeItem("profile");
                    setProfile(undefined);
                    return;
                }

                const refreshResponse = await fetch(apiUrl("/auth/refresh-token"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ refreshToken: parsedProfile.refreshToken })
                });

                const refreshResult = await refreshResponse.json();
                if (!refreshResult.success) {
                    localStorage.removeItem("profile");
                    setProfile(undefined);
                    return;
                }

                setProfile(refreshResult.payload);
            } catch (error) {
                localStorage.removeItem("profile");
                setProfile(undefined);
            }
        };

        initializeProfile();
    }, [profile, setProfile]);

    return { profile, setProfile };
}

export default UseProfile;