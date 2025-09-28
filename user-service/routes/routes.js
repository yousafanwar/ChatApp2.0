import express from "express";
import userController from "../controllers/user_controller.js";
import authenticateUser from "../middlewares/authMiddleware.js";

const router = express.Router();

router.put('/updateUser/:id', authenticateUser, userController.updateUser);
router.get('/getAllUsers/:loggesInUser', authenticateUser, userController.getAllContacts);
router.post('/addToMyContactList', authenticateUser, userController.addToMyContactList);
router.get('/getMyContacts/:id', authenticateUser, userController.getUserContacts);
router.get('/getIndividualUser/:id', userController.getIndividualUser);
router.post('/createGroup', authenticateUser, userController.createNewGroup);
router.get('/getGroups/:id', authenticateUser, userController.getGroups);
router.put('/updateGroup', authenticateUser, userController.updateGroup);
router.get('/getAllGroupMembers/:id', authenticateUser, userController.getAllGroupMembers);

export default router;