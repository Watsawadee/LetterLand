import express from 'express';
import { getUserByIdController } from '../controllers/userController';

const router = express.Router();

router.get('/user/:userId', getUserByIdController);

export default router;
