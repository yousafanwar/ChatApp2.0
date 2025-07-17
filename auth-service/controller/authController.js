import authService from "../services/authService.js";
import dotenv from "dotenv";

dotenv.config();

const authenticateUser = async (req, res, next) => {
    const authHeaders = req.headers.authorization;

    const token = authHeaders && authHeaders.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }
    const result = await authService.verifyJWT(token);

    if (result.success) {
        next();
    } else {
        console.error("auth failed");
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let result = await authService.login(email, password);
        if (!result.success) {
            console.error(result.message.message);
        } else {
            res.status(result.status).send(result.payload);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal server error");
    }

};

const registerNewUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.registerUser(name, email, password);
        res.status(result.status).send(result.message);
    } catch (error) {
        res.status(400).json("Error while creating new user");
    }
}

const authController = {
    authenticateUser,
    loginUser,
    registerNewUser
};

export default authController;