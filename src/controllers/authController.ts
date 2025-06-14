import { Request, Response } from "express";
import { LoginRequest, CreateUserRequest, ChangePasswordRequest } from '@sfl/shared-types';
import User from "../dbModels/UserModel";
import bcrypt from "bcrypt";
import AuthProvider from "../dbModels/AuthProviderModel";
import { generateToken } from "../service/tokenService";
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createLoginResponse,
  convertUserToSharedType 
} from "../utils/responseHelpers";

const register = async (req: Request<{}, any, CreateUserRequest>, res: Response) => {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await User.findOne({ where: { email: normalizedEmail } });
        if (existing) {
            res.status(409).json(createErrorResponse('USER_EXISTS', 'Email already in use'));
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const user = await User.create({ email: normalizedEmail, passwordHash });
        await AuthProvider.create({ userId: user.id, provider: 'local' });

        const token = generateToken(user.id);
        const loginResponse = createLoginResponse(user, token);
        res.status(201).json(loginResponse);
    } catch (err) {
        res.status(500).json(createErrorResponse('REGISTRATION_FAILED', 'Registration failed'));
    }
};

const login = async (req: Request<{}, any, LoginRequest>, res: Response) => {
    const { email, password } = req.body;
    try {
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user || !user.passwordHash) {
            res.status(401).json(createErrorResponse('INVALID_CREDENTIALS', 'Invalid credentials'));
            return;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            res.status(401).json(createErrorResponse('INVALID_CREDENTIALS', 'Invalid credentials'));
            return;
        }

        const token = generateToken(user.id);
        const loginResponse = createLoginResponse(user, token);
        res.json(loginResponse);
    } catch (err) {
        res.status(500).json(createErrorResponse('LOGIN_FAILED', 'Login failed'));
    }
};

const changePassword = async (req: Request<{}, any, ChangePasswordRequest>, res: Response) => {
    const user = req.user as User;
    const { currentPassword, newPassword } = req.body;
    try {
        if (!user.passwordHash) {
            res.status(400).json(createErrorResponse('NO_PASSWORD', "No local password set for this account"));
            return;
        }
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
            res.status(401).json(createErrorResponse('INVALID_PASSWORD', "Current password is incorrect"));
            return;
        }
        const newHash = await bcrypt.hash(newPassword, 10);
        user.passwordHash = newHash;
        await user.save();
        res.json(createSuccessResponse(null, "Password changed successfully"));
    } catch (err) {
        res.status(500).json(createErrorResponse('PASSWORD_CHANGE_FAILED', "Failed to change password"));
    }
};

const protectedRoute = (req: Request, res: Response) => {
    const user = req.user as User;
    const sharedUser = convertUserToSharedType(user);
    res.json(createSuccessResponse({
        message: "You are authenticated",
        user: sharedUser
    }));
};

const authController = {
    register,
    login,
    changePassword,
    protectedRoute
};

export default authController;