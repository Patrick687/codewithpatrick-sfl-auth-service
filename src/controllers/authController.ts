import { Request, Response } from "express";
import User from "../dbModels/UserModel";
import bcrypt from "bcrypt";
import AuthProvider from "../dbModels/AuthProviderModel";
import { generateToken } from "../service/tokenService";

const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            res.status(409).json({ message: 'Email already in use' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email: normalizedEmail, passwordHash });
        await AuthProvider.create({ userId: user.id, provider: 'local' });

        const token = generateToken(user.id);
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Registration failed' });
    }
};

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user || !user.passwordHash) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user.id);
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Login failed' });
    }
};

const changePassword = async (req: Request, res: Response) => {
    const user = req.user as User;
    const { oldPassword, newPassword } = req.body;
    try {
        if (!user.passwordHash) {
            res.status(400).json({ message: "No local password set for this account" });
            return;
        }
        const valid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!valid) {
            res.status(401).json({ message: "Old password is incorrect" });
            return;
        }
        const newHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newHash;
        await user.save();
        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to change password" });
    }
};

const protectedRoute = (req: Request, res: Response) => {
    const user = req.user as User;
    res.json({ message: "You are authenticated", user: { id: user.id, email: user.email } });
};

const authController = {
    register,
    login,
    changePassword,
    protectedRoute
};

export default authController;