import authService from "../services/authService.js";
import dotenv from "dotenv";

dotenv.config();

const authenticateUser = async (req, res) => {
    try {
        const { token } = req.body;
        const result = await authService.verifyJWT(token);
        res.json({ success: result.success, status: result.status, message: result.message });
    } catch (err) {
        console.log('controller faild: ', err);

        res.json({ success: false, 'error': err });
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
        res.status(result.status).json(result.message);
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