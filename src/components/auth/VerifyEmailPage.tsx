import React, { useEffect, useState } from "react";
import { AuthLayout } from "./AuthLayout";
import { useTranslations } from "../../hooks/useTranslations";
import { API_BASE_URL } from "../../constants";
import { Button } from "../ui/Button";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export const VerifyEmailPage: React.FC = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const t = useTranslations();

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null;

    if (!token) {
      setStatus("error");
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("fail");
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return (
      <AuthLayout title={t.auth?.verify_email_title || "Verify email"}>
        <div className="flex justify-center p-6">
          <LoadingSpinner />
        </div>
      </AuthLayout>
    );
  }

  if (status === "success") {
    return (
      <AuthLayout title={t.auth?.verify_email_title || "Verify email"}>
        <div className="space-y-6 text-center">
          <p>
            {t.auth?.verify_email_success || "Your email has been verified."}
          </p>
          <Button onClick={() => (window.location.href = "/auth/login")}>
            {t.auth?.go_to_login || "Go to login"}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t.auth?.verify_email_title || "Verify email"}>
      <div className="space-y-6 text-center">
        <p>{t.auth?.verify_email_error || "Verification failed."}</p>
        <Button onClick={() => (window.location.href = "/auth/login")}>
          {t.auth?.back_to_login || "Back to login"}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
