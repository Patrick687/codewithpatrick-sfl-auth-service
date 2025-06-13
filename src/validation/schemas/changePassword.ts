import { z } from "zod";

const changePasswordSchema = z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
});

export default changePasswordSchema;