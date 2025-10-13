import express from "express";
import {
  createUserController,
  getUserByIdController,
  loginUserController,
  getAllUserController,
  useHintController,
  progressLevelupController,
  buyHintController,
  getUserLastFinishedGame,
} from "../controllers/userController";
import { authenticatedUser } from "../middleware/authMiddleware";
const router = express.Router();

router.get("/", getAllUserController);
router.get("/:userId", getUserByIdController);
router.post("/auth/register", createUserController);

router.post("/auth/login", loginUserController);
router.post("/:userId/usehint", useHintController);

//progress Level up route
router.put("/progress", authenticatedUser, progressLevelupController)
router.post("/:userId/buyhint", buyHintController);
router.get("/user/lastfinishedgame", authenticatedUser, getUserLastFinishedGame);


export default router;
