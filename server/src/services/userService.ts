import { PrismaClient } from "@prisma/client";

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

const PACK_PRICES = { 1: 0, 3: 500, 5: 800 } as const;
type Pack = keyof typeof PACK_PRICES;

function isPack(val: number): val is Pack {
  return val === 1 || val === 3 || val === 5;
}

export const buyHint = async (userId: number, qty: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coin: true },
    });
    if (!user) {
      const err: any = new Error("User not found");
      err.code = "USER_NOT_FOUND";
      throw err;
    }

    const PACK_PRICES = { 1: 100, 3: 300, 5: 500 } as const;
    type Pack = keyof typeof PACK_PRICES;

    const pack = qty as Pack;
    const price: number = PACK_PRICES[pack];

    if (user.coin < price) {
      const err: any = new Error("Insufficient funds");
      err.code = "INSUFFICIENT_FUNDS";
      throw err;
    }

    if (user.coin < price) {
      throw new Error("Don't havbe");
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coin: { decrement: price },
        hint: { increment: qty },
      },
      select: {
        id: true,
        username: true,
        coin: true,
        hint: true,
      },
    });

    return updatedUser;
  } catch (err) {
    console.error("Error buy hint:", err);
    throw new Error("Failed to buy hint");
  }
};
