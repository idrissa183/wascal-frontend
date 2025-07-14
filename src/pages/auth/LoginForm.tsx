import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema } from "../../schemas/authSchema";
import { useAuthStore } from "../../stores/authStore";
import { useLanguage } from "../../hooks/useLanguage";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const { language } = useLanguage();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);

  const translations = {
    fr: {
      email: "Email",
      emailPlaceholder: "votre@email.com",
      password: "Mot de passe",
      passwordPlaceholder: "Votre mot de passe",
      rememberMe: "Se souvenir de moi",
      forgotPassword: "Mot de passe oublié ?",
      login: "Se connecter",
      loggingIn: "Connexion en cours...",
      showPassword: "Afficher le mot de passe",
      hidePassword: "Masquer le mot de passe",
      noAccount: "Vous n'avez pas encore de compte ?",
      registerHere: "Inscrivez-vous ici",
    },
    en: {
      email: "Email",
      emailPlaceholder: "your@email.com",
      password: "Password",
      passwordPlaceholder: "Your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password ?",
      login: "Sign in",
      loggingIn: "Signing in...",
      showPassword: "Show password",
      hidePassword: "Hide password",
      noAccount: "Don't have an account yet ?",
      registerHere: "Sign up here",
    },
  };

  const t = translations[language];

  const initialValues: LoginFormValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const handleSubmit = async (values: LoginFormValues) => {
    clearError();
    await login(values.email, values.password);
    // Redirect will be handled by the auth store
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

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
            <div className="mt-1">
              <div className="relative">
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder={t.passwordPlaceholder}
                  className={`appearance-none relative block w-full px-3 py-2 pr-10 border ${
                    errors.password && touched.password
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                  } placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:z-10 sm:text-sm dark:bg-gray-800`}
                />
                <button
                  type="button"
                  className="cursor-pointer absolute top-1/2 right-3 -translate-y-1/2 flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="p"
                className="mt-1 text-sm text-red-600 dark:text-red-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Field
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                {t.rememberMe}
              </label>
            </div>

            <div className="text-sm">
              <a
                href="/auth/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
              >
                {t.forgotPassword}
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t.loggingIn : t.login}
            </button>
          </div>

          <div className="text-sm font-medium text-start text-gray-500 dark:text-gray-400">
            {t.noAccount}{" "}
            <a
              href="/auth/register"
              className="text-primary-700 hover:underline dark:text-primary-500"
            >
              {t.registerHere}
            </a>
          </div>
        </Form>
      )}
    </Formik>
  );
}
