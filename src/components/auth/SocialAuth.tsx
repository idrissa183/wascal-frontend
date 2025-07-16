// src/components/auth/SocialAuth.tsx
import React from "react";
import { Button } from "../ui/Button";
import { useTranslations } from "../../hooks/useTranslations";
import { API_BASE_URL } from "../../constants";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

interface SocialAuthProps {
  mode?: "login" | "register";
}

export const SocialAuth: React.FC<SocialAuthProps> = ({ mode = "login" }) => {
  const t = useTranslations();

  const handleGoogleAuth = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/oauth/google/login`
      );
      const data = await response.json();

      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  const handleGithubAuth = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/oauth/github/login`
      );
      const data = await response.json();

      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (error) {
      console.error("GitHub auth error:", error);
    }
  };

  const isRegisterMode = mode === "register";

  return (
    <div className="grid grid-cols-1 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleAuth}
        className="w-full cursor-pointer"
      >
        <FcGoogle className="h5 w-5 mr-2" />
        {isRegisterMode
          ? t.signupWithGoogle || "S'inscrire avec Google"
          : t.loginWithGoogle || "Se connecter avec Google"}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleGithubAuth}
        className="w-full cursor-pointer"
      >
        <FaGithub className="h5 w-5 mr-2" />
        {isRegisterMode
          ? t.signupWithGithub || "S'inscrire avec GitHub"
          : t.loginWithGithub || "Se connecter avec GitHub"}
      </Button>
    </div>
  );
};
