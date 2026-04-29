import jwt from 'jsonwebtoken';
import user from '../db/schemas/user.js';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const ACCESS_TOKEN_EXPIRY = process.env.accessTokenExpiry || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.refreshTokenExpiry || "7d";
const REFRESH_TOKEN_SALT_ROUNDS = Number(process.env.refreshTokenSaltRounds || process.env.saltRounds || 10);
const ACCESS_SECRET = process.env.privateKey;
const REFRESH_SECRET = process.env.refreshPrivateKey || process.env.privateKey;

const signToken = (payload, secret, options) => jwt.sign(payload, secret, options);
const verifyToken = (token, secret) => jwt.verify(token, secret);

const generateRefreshToken = async (email) => {
    const randomSeed = crypto.randomBytes(32).toString("hex");
    return signToken({ email, seed: randomSeed }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const storeRefreshToken = async (userId, refreshToken) => {
    const hash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    await user.findByIdAndUpdate(userId, { refreshToken: hash });
};

const createAuthPayload = async (findUser) => {
    const token = signToken({ email: findUser.email }, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = await generateRefreshToken(findUser.email);
    await storeRefreshToken(findUser._id, refreshToken);

    return {
        _id: findUser._id,
        email: findUser.email,
        name: findUser.name,
        avatar: findUser.avatar,
        myContacts: findUser.myContacts,
        token,
        refreshToken
    };
};

const verifyJWT = async (token) => {
    try {
        verifyToken(token, ACCESS_SECRET);
        return { success: true, status: 200, message: "JWT verified successfuly", };
    } catch (error) {
        return { success: false, status: 401, message: "Invalid or expired token" };
    }
}

const login = async (email, password) => {
    const verifyPass = promisify(bcrypt.compare);
    try {
        const findUser = await user.findOne({ email });
        if (!findUser) {
            return { success: false, status: 401, message: "Incorrect email" };
        }

        let result = await verifyPass(password, findUser.password);
        if (!result) {
            return { success: false, status: 401, message: "Wrong password" };
        } else {
            const userData = await createAuthPayload(findUser);
            return { success: true, status: 200, message: "Login successful", payload: userData };
        };
    }
    catch (error) {
        console.log("Error while logingin in:", error);
        return { sucess: false, status: 500, message: "Internal server error" }
    }
};

const refreshUserToken = async (refreshToken) => {
    if (!refreshToken) {
        return { success: false, status: 401, message: "Refresh token is required" };
    }

    try {
        const decoded = verifyToken(refreshToken, REFRESH_SECRET);
        const findUser = await user.findOne({ email: decoded.email });

        if (!findUser || !findUser.refreshToken) {
            return { success: false, status: 401, message: "Invalid refresh session" };
        }

        const isTokenMatch = await bcrypt.compare(refreshToken, findUser.refreshToken);
        if (!isTokenMatch) {
            return { success: false, status: 401, message: "Refresh token is invalid" };
        }

        const userData = await createAuthPayload(findUser);
        return { success: true, status: 200, message: "Token refreshed", payload: userData };
    } catch (error) {
        return { success: false, status: 401, message: "Refresh token expired or invalid" };
    }
};

const logout = async (refreshToken) => {
    if (!refreshToken) {
        return { success: false, status: 400, message: "Refresh token is required" };
    }

    try {
        const decoded = verifyToken(refreshToken, REFRESH_SECRET);
        await user.findOneAndUpdate(
            { email: decoded.email },
            { $set: { refreshToken: null } }
        );
        return { success: true, status: 200, message: "Logged out successfully" };
    } catch (error) {
        return { success: false, status: 200, message: "Session already expired" };
    }
};

const registerUser = async (name, email, password) => {
    const hashPass = promisify(bcrypt.hash);

    try {
        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return { success: false, status: 409, message: "Email already in use" };
        }
        const hash = await hashPass(password, Number(process.env.saltRounds));

        const newUser = await new user({ name, email, password: hash });
        let result = await newUser.save();
        if (result) return { success: true, status: 200, message: "New user registered" };
    } catch (err) {
        return { success: false, status: 400, message: "Error while creating new user" };
    }
}

let authService = {
    verifyJWT,
    login,
    registerUser,
    refreshUserToken,
    logout
};

export default authService;


