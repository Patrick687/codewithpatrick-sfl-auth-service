import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

function validateBody(schema: ZodSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.errors });
            return;
        }
        req.body = result.data;
        next();
    };
}

export default validateBody;