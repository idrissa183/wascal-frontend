// src/lib/validation.ts
import { z } from "zod";

// Schéma pour la connexion
export const loginSchema = z.object({
  email: z.string().min(1, "Email requis").email("Format email invalide"),
  password: z
    .string()
    .min(1, "Mot de passe requis")
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  rememberMe: z.boolean().optional(),
});

// Schéma pour l'inscription
export const registerSchema = z
  .object({
    firstname: z
      .string()
      .min(1, "Prénom requis")
      .min(2, "Le prénom doit contenir au moins 2 caractères")
      .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
    lastname: z
      .string()
      .min(1, "Nom requis")
      .min(2, "Le nom doit contenir au moins 2 caractères")
      .max(50, "Le nom ne peut pas dépasser 50 caractères"),
    email: z.string().min(1, "Email requis").email("Format email invalide"),
    password: z
      .string()
      .min(1, "Mot de passe requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
      ),
    confirmPassword: z.string().min(1, "Confirmation du mot de passe requise"),
    phone: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^\+?[\d\s\-\(\)]+$/.test(value),
        "Format de téléphone invalide"
      ),
    terms: z
      .boolean()
      .refine(
        (value) => value === true,
        "Vous devez accepter les conditions d'utilisation"
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma pour le changement de mot de passe
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(1, "Nouveau mot de passe requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
      ),
    confirmPassword: z.string().min(1, "Confirmation du mot de passe requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Schéma pour la demande de réinitialisation de mot de passe
export const requestPasswordResetSchema = z.object({
  email: z.string().min(1, "Email requis").email("Format email invalide"),
});

// Schéma pour la réinitialisation de mot de passe
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    newPassword: z
      .string()
      .min(1, "Nouveau mot de passe requis")
      .min(8, "Le mot de passe doit contenir au moins 8 caractères")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial"
      ),
    confirmPassword: z.string().min(1, "Confirmation du mot de passe requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// Types extraits des schémas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type RequestPasswordResetFormData = z.infer<
  typeof requestPasswordResetSchema
>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Utilitaire pour valider les données
export const validateForm = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
} => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: ["Erreur de validation"] } };
  }
};
