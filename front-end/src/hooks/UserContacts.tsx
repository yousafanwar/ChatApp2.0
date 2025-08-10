import { useContext } from "react";
import { UserContactsContext } from "../context/UserContactsProvider";

const UserContacts = () => {

    const ctx = useContext(UserContactsContext);
    console.log("UserContactsContext", ctx);

    if (!ctx) {
        throw Error("UserContacts must be used inside UserContactsProvider")
    } else {
        return ctx;
    }
};

export default UserContacts;