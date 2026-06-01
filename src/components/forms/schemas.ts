import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required."),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.email("Enter a valid email address."),
  phone: z.string().min(7, "Phone number is required."),
  address: z.string().min(10, "Address is required."),
  apartment: z
    .string()
    .max(80, "Keep apartment details under 80 characters.")
    .optional(),
  city: z.string().min(2, "City is required."),
  postalCode: z.string().max(10, "Postal code is too long.").optional(),
  deliveryMethod: z.string().min(1, "Choose a delivery method."),
  paymentMethod: z.string().min(1, "Choose a payment method."),
});

export const newsletterSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type CheckoutValues = z.infer<typeof checkoutSchema>;
export type NewsletterValues = z.infer<typeof newsletterSchema>;
