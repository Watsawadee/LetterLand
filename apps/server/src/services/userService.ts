import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
