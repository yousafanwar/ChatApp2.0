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
                    if (parsedProfile?.token) {
                        // Validate token
                        fetch("http://localhost:5000/api/auth/authenticate", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                authorization: `Bearer ${parsedProfile.token}`
                            }
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                setProfile(parsedProfile);
                            } else {
                                // Token invalid, clear profile
                                localStorage.removeItem("profile");
                                setProfile(undefined);
                            }
                        })
                        .catch(() => {
                            // Error, clear profile
                            localStorage.removeItem("profile");
                            setProfile(undefined);
                        });
                    } else {
                        setProfile(parsedProfile);
                    }
                }
            } catch (error) {
                localStorage.removeItem("profile");
            }
        } else {
            localStorage.setItem("profile", JSON.stringify(profile));

        }
    }, [profile, setProfile]);

    return { profile, setProfile };
}

export default UseProfile;