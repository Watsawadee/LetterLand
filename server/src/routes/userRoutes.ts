import express from "express";
import {
  createUserController,
  getUserByIdController,
  loginUserController,
  getAllUserController,
  useHintController,
  buyHintController,
} from "../controllers/userController";
const router = express.Router();

router.get("/", getAllUserController);
router.get("/:userId", getUserByIdController);
router.post("/auth/register", createUserController);

router.post("/auth/login", loginUserController);
router.post("/:userId/usehint", useHintController);
router.post("/:userId/buyhint", buyHintController);

export default router;
