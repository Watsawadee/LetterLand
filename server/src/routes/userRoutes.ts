import express, { Request, Response } from "express";
import {
  createUserController,
  getUserByIdController,
  loginUserController,
} from "../controllers/userController";
const router = express.Router();

router.get("/user/:userId", getUserByIdController);
router.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const result = await createUserController(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const result = await loginUserController(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
