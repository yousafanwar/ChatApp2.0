import authService from "../services/authService.js";
import dotenv from "dotenv";

dotenv.config();

const authenticateUser = async (req, res) => {
    try {
        const { token } = req.body;
        const result = await authService.verifyJWT(token);
        if (result.success) {
            res.status(result.status).json({ success: true, message: result.message });
        } else {
            res.status(result.status).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        if (result.success) {
            res.status(result.status).json({ success: true, message: result.message, payload: result.payload });
        } else {
            res.status(result.status).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const registerNewUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const result = await authService.registerUser(name, email, password);
        if (result.success) {
            res.status(result.status).json({ success: true, message: result.message });
        } else {
            res.status(result.status).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

const authController = {
    authenticateUser,
    loginUser,
    registerNewUser
};

export default authController;