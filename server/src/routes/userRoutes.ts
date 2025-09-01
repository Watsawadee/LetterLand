import express from "express";
import {
  createUserController,
  getUserByIdController,
  loginUserController,
  getAllUserController,
  useHintController,
} from "../controllers/userController";
const router = express.Router();

router.get("/", getAllUserController);
router.get("/:userId", getUserByIdController);
router.post("/auth/register", createUserController);

router.post("/auth/login", loginUserController);
router.post("/:userId/usehint", useHintController);


export default router;
