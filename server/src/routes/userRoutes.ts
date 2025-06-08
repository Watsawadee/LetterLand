import express from "express";
import {
  createUserController,
  getUserByIdController,
  loginUserController, // Add here
} from "../controllers/userController";
const router = express.Router();

router.get("/user/:userId", getUserByIdController);
router.post("/auth/register", createUserController);
router.post("/auth/login", loginUserController);

export default router;
