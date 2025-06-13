import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import serviceConfig from "../config/config";
import User from "../dbModels/UserModel";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Missing or invalid authorization header" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jwt.verify(token, serviceConfig.JWT_SECRET) as { userId: string; };
        const user = await User.findByPk(payload.userId);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
}