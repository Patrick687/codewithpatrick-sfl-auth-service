import jwt from 'jsonwebtoken';
import serviceConfig from '../config/config';

export function generateToken(userId: string): string {
    return jwt.sign({ userId }, serviceConfig.JWT_SECRET);
}
