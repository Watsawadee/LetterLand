import { Request, Response } from "express";
import prisma from "../configs/db";
import { AuthenticatedRequest } from "../types/authenticatedRequest";
import { UserProfileResponse } from "../types/userProfile";
export const getUserProfile = async (
  req: AuthenticatedRequest,
  res: Response<UserProfileResponse | { error: string }>
): Promise<void> => {

  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorised Access" })
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, username: true, coin: true, englishLevel: true, email: true } })
    if (!user) {
      res.status(404).json({ error: "User not found" })
      return;
    }
    res.status(200).json(user)
  }
  catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}