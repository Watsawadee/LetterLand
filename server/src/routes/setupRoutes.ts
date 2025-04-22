import express from "express";
import { setupProfile } from "../controllers/setupProfileController";

const router = express.Router();

router.post("/setup-profile", setupProfile);

export default router;
