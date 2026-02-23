const { z } = require("zod");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must include at least one symbol");

const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, "Full name contains invalid characters"),
  email: z.string().trim().toLowerCase().email().max(255),
  password: passwordSchema
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(72)
});

module.exports = {
  registerSchema,
  loginSchema
};
