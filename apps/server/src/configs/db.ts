import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // Ensure these logs are enabled
});

// Explicitly define event type for better type safety
prisma.$on("query" as never, (e: any) => {
  console.log(`🔵 Executed Query: ${e.query}`);
  console.log(`🔵 Params: ${e.params}`);
  console.log(`🔵 Duration: ${e.duration}ms`);
});

export default prisma;
