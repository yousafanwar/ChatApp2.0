import authService from "../services/authService.js";
import dotenv from "dotenv";

dotenv.config();

const authenticateUser = async (req, res) => {
    try {
        const tokenFromBody = req.body?.token;
        const tokenFromHeader = req.headers.authorization?.split(" ")[1];
        const token = tokenFromBody || tokenFromHeader;

        if (!token) {
            return res.status(401).json({ success: false, message: "Token is required" });
        }

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

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refreshUserToken(refreshToken);

        if (result.success) {
            res.status(result.status).json({ success: true, message: result.message, payload: result.payload });
        } else {
            res.status(result.status).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error("Refresh token error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.logout(refreshToken);

        if (result.success) {
            res.status(result.status).json({ success: true, message: result.message });
        } else {
            res.status(result.status).json({ success: false, message: result.message });
        }
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
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
    registerNewUser,
    refreshToken,
    logoutUser
};

export default authController;