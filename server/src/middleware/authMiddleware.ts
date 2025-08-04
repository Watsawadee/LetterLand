import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWTtoken =
  process.env.JWT_SECRET || "bmY3eWNoY3k3OA.Y2lwczhsY3o3M3Y.a3V5bWR3cDNvNg";
interface AuthenticatedRequest extends Request {
  user?: { id: number };
}
export const authenticatedUser = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorised, No token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, JWTtoken) as { userId: number };
    req.user = { id: decodedToken.userId };
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorised, Invalid token" });
  }
};
