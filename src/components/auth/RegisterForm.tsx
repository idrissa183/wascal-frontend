import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { registerSchema } from "../../schemas/authSchema";
import { useAuthStore } from "../../stores/authStore";
import { useLanguage } from "../../hooks/useLanguage";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export default function RegisterForm() {
  const { language } = useLanguage();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const translations = {
    fr: {
      firstName: "Prénom(s)",
      firstNamePlaceholder: "John",
      lastName: "Nom",
      lastNamePlaceholder: "Doe",
      email: "Email",
      emailPlaceholder: "votre@email.com",
      password: "Mot de passe",
      passwordPlaceholder: "Votre mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      confirmPasswordPlaceholder: "Confirmez votre mot de passe",
      terms: "J'accepte les",
      termsLink: "conditions d'utilisation",
      and: "et la",
      privacyLink: "politique de confidentialité",
      register: "Créer mon compte",
      registering: "Création en cours...",
    },
    en: {
      firstName: "First name",
      firstNamePlaceholder: "John",
      lastName: "Last name",
      lastNamePlaceholder: "Doe",
      email: "Email",
      emailPlaceholder: "your@email.com",
      password: "Password",
      passwordPlaceholder: "Your password",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Confirm your password",
      terms: "I accept the",
      termsLink: "terms of service",
      and: "and",
      privacyLink: "privacy policy",
      register: "Create account",
      registering: "Creating account...",
    },
  };

  const t = translations[language];
}
