import express from "express";
import userController from "../controllers/user_controller.js";

const router = express.Router();

router.put('/updateUser/:id', userController.updateUser);
router.get('/getAllUsers/:loggesInUser', userController.getAllContacts);
router.post('/addToMyContactList', userController.addToMyContactList);

export default router;