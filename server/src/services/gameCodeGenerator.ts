import prisma from "../configs/db";

export async function generateGameCode(length = 6) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code: string;
    let exist = true;
    do {
        code = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
        exist = !!(await prisma.gameTemplate.findUnique({ where: { gameCode: code } }));
    } while (exist);
    return code;
}