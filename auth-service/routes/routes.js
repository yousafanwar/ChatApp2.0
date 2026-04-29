import express from "express";
import authController from "../controller/authController.js";

let router = express.Router();

router.post("/authenticate", authController.authenticateUser);
router.post("/login", authController.loginUser);
router.post("/register", authController.registerNewUser);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logoutUser);

export default router;