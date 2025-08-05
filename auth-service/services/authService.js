import jwt from 'jsonwebtoken';
import user from '../db/schemas/user.js';
import bcrypt from 'bcrypt';
import { promisify } from 'util';
import dotenv from "dotenv";

dotenv.config();

const verifyJWT = async (token) => {
    let verify = promisify(jwt.verify);
    try {
        await verify(token, process.env.privateKey);
        return { success: true, status: 200, message: "JWT verified successfuly", };
    } catch (error) {
        return { sucess: false, status: 500, message: "Internal server error" };
    }
}

const login = async (email, password) => {
    let verifyPass = promisify(bcrypt.compare);
    let signJwt = promisify(jwt.sign);
    try {
        const findUser = await user.findOne({ email });
        if (!findUser) {
            return { success: false, status: 401, message: "Incorrect email" };
        }

        let result = await verifyPass(password, findUser.password);
        if (!result) {
            return { success: false, status: 401, message: "Wrong password" };
        } else {
            let token = await signJwt({ email }, process.env.privateKey, { expiresIn: '1h' });
            if (token) {
                const userData = {
                    _id: findUser._id,
                    email: findUser.email,
                    name: findUser.name,
                    avatar: findUser.avatar,
                    myContacts: findUser.myContacts,
                    token
                }
                return { success: true, status: 200, message: "jwt signed", payload: userData };
            }
        };
    }
    catch (error) {
        console.log("Error while logingin in:", error);
        return { sucess: false, status: 500, message: "Internal server error" }
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
    registerUser
};

export default authService;


