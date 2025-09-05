import express from "express";
import userController from "../controllers/user_controller.js";

const router = express.Router();

router.put('/updateUser/:id', userController.updateUser);
router.get('/getAllUsers/:loggesInUser', userController.getAllContacts);
router.post('/addToMyContactList', userController.addToMyContactList);
router.get('/getMyContacts/:id', userController.getUserContacts);
router.get('/getIndividualUser/:id', userController.getIndividualUser);
router.post('/createGroup', userController.createNewGroup);
router.get('/getGroups/:id', userController.getGroups);
router.put('/updateGroup', userController.updateGroup);
router.get('/getAllGroupMembers/:id', userController.getAllGroupMembers);

export default router;