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
  const initialValues: RegisterFormValues = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  };

  const handleSubmit = async (values: RegisterFormValues) => {
    clearError();
    await register({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registerSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t.firstName}
              </label>
              <div className="mt-1">
                <Field
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder={t.firstNamePlaceholder}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.firstName && touched.firstName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:z-10 sm:text-sm dark:bg-gray-800`}
                />
                <ErrorMessage
                  name="firstName"
                  component="p"
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t.lastName}
              </label>
              <div className="mt-1">
                <Field
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder={t.lastNamePlaceholder}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    errors.lastName && touched.lastName
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:z-10 sm:text-sm dark:bg-gray-800`}
                />
                <ErrorMessage
                  name="lastName"
                  component="p"
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t.email}
            </label>
            <div className="mt-1">
              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  errors.email && touched.email
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:z-10 sm:text-sm dark:bg-gray-800`}
              />
              <ErrorMessage
                name="email"
                component="p"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t.password}
            </label>
            <div className="mt-1 relative">
              <Field
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t.passwordPlaceholder}
                className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                  errors.password && touched.password
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:z-10 sm:text-sm dark:bg-gray-800`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <ErrorMessage
                name="password"
                component="p"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {t.confirmPassword}
            </label>
            <div className="mt-1 relative">
              <Field
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t.confirmPasswordPlaceholder}
                className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:z-10 sm:text-sm dark:bg-gray-800`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <ErrorMessage
                name="confirmPassword"
                component="p"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Field
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label
              htmlFor="terms"
              className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
            >
              {t.terms}{" "}
              <a
                href="/terms"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                {t.termsLink}
              </a>{" "}
              {t.and}{" "}
              <a
                href="/privacy"
                className="text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                {t.privacyLink}
              </a>
            </label>
            <ErrorMessage
              name="terms"
              component="p"
              className="ml-2 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t.registering : t.register}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
