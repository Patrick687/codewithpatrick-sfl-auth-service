import { NextFunction, Request, Response, Router } from "express";
import registerSchema from "../validation/schemas/registerSchema";
import passport from '../providers/google/passport';
import loginSchema from "../validation/schemas/loginSchema";
import authController from "../controllers/authController";
import { generateToken } from "../service/tokenService";
import User from "../dbModels/UserModel";
import validateBody from "../middleware/validateBody";
import changePasswordSchema from "../validation/schemas/changePassword";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as User | undefined;
        const token = user && user.id ? generateToken(user.id) : null;
        res.json({ token });
    }
);

router.post(
    '/change-password',
    requireAuth,
    validateBody(changePasswordSchema),
    authController.changePassword
);

router.get(
    '/protected',
    requireAuth,
    authController.protectedRoute
);

export default router;