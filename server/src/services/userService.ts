import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUser = async () => {
  try {
    const user = await prisma.user.findMany();

    return user;
  } catch (err) {
    console.error("Error User service:", err);
    throw new Error("Failed to getAllUser");
  }
};

export const getUserById = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (err) {
    console.error("Error User service:", err);
    throw new Error("Failed to getUserById");
  }
};

export const useHint = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { hint: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.hint <= 0) {
      throw new Error("No hints left");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hint: { decrement: 1 },
      },
      select: {
        id: true,
        username: true,
        hint: true,
      },
    });

    return updatedUser;
  } catch (err) {
    console.error("Error using hint:", err);
    throw new Error("Failed to use hint");
  }
};
