import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./stores/useAuthStore";
import { useLanguage } from "./hooks/useLanguage";
import { useTheme } from "./hooks/useTheme";

// Layout Components
import BaseAuth from "./components/layout/BaseAuth";
import Base from "./components/layout/Base";

// Auth Pages
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./components/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./components/auth/VerifyEmailPage";

// OAuth Callbacks
import GoogleCallback from "./components/auth/callbacks/GoogleCallback";
import GithubCallback from "./components/auth/callbacks/GithubCallback";
import FacebookCallback from "./components/auth/callbacks/FacebookCallback";
import LinkedinCallback from "./components/auth/callbacks/LinkedinCallback";

// Main App Pages
import MapPage from "./components/map/MapPage";

// Data Pages

// New Pages
import { DatasetsPage } from "./components/datasets/DatasetsPage";


// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const { getCurrentUser } = useAuthStore();

  // Initialize language and theme hooks to ensure they're available globally
  useLanguage();
  useTheme();

  // Initialize auth state on app start
  React.useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <Router>
      <Routes>
        {/* Public routes (auth pages) */}
        <Route
          path="/auth/login"
          element={
            <PublicRoute>
              <BaseAuth>
                <LoginPage />
              </BaseAuth>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/register"
          element={
            <PublicRoute>
              <BaseAuth>
                <RegisterPage />
              </BaseAuth>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/forgot-password"
          element={
            <PublicRoute>
              <BaseAuth>
                <ForgotPasswordPage />
              </BaseAuth>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/reset-password"
          element={
            <PublicRoute>
              <BaseAuth>
                <ResetPasswordPage />
              </BaseAuth>
            </PublicRoute>
          }
        />
        <Route
          path="/auth/verify-email"
          element={
            <BaseAuth>
              <VerifyEmailPage />
            </BaseAuth>
          }
        />

        {/* OAuth callback routes */}
        <Route path="/auth/callback/google" element={<GoogleCallback />} />
        <Route path="/auth/callback/github" element={<GithubCallback />} />
        <Route path="/auth/callback/facebook" element={<FacebookCallback />} />
        <Route path="/auth/callback/linkedin" element={<LinkedinCallback />} />

        {/* Protected routes */}
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <Base>
                <MapPage />
              </Base>
            </ProtectedRoute>
          }
        />
        
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;
