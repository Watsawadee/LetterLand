import { getUserById } from '../services/userService';
import { Request, Response } from 'express';

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    await getUserById(req, res); 
  } catch (error) {
    if (error instanceof Error) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
};
