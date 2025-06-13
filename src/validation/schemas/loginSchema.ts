import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().trim().email().transform(val => val.toLowerCase()),
    password: z.string().min(8),
});

export default loginSchema;