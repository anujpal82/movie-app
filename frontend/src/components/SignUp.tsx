import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useTranslation } from "react-i18next";
import {
  validateRegisterForm,
  validateFieldOnBlur,
  getFieldError,
  isFormValid,
} from "../utils/validation";
import { ValidationError } from "../types/auth";
import FormInput from "./FormInput";
import LoadingButton from "./LoadingButton";
import LanguageSwitcher from "./LanguageSwitcher";

// Extend Window interface to include showToast
declare global {
  interface Window {
    showToast?: (toast: {
      type: "success" | "error" | "info" | "warning";
      message: string;
    }) => void;
  }
}

const SignUp: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    setErrors((prev) => prev.filter((error) => error.field !== field));
  };

  const handleFieldBlur = (field: string, value: string) => {
    setTouched((prev) => new Set(prev).add(field));

    // Validate single field on blur
    const fieldError = validateFieldOnBlur(
      field,
      value,
      field === "confirmPassword" ? formData.password : undefined
    );

    if (fieldError) {
      setErrors((prev) => {
        const filtered = prev.filter((err) => err.field !== field);
        return [...filtered, { field, message: fieldError }];
      });
    } else {
      setErrors((prev) => prev.filter((err) => err.field !== field));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched(new Set(["name", "email", "password", "confirmPassword"]));

    // Validate entire form
    const validationErrors = validateRegisterForm(
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.name
    );

    if (validationErrors.length > 0) {
      setErrors(validationErrors);

      // Show toast for validation errors
      if (window.showToast) {
        window.showToast({
          type: "error",
          message: "Please fix the errors in the form before submitting.",
        });
      }

      return;
    }

    setLoading(true);

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });

      // Show success toast
      if (window.showToast) {
        window.showToast({
          type: "success",
          message: "Account created successfully! Redirecting...",
        });
      }

      setTimeout(() => {
        navigate("/movies");
      }, 1500);
    } catch (error: unknown) {
      console.error("Registration failed:", error);

      let errorMessage = "Registration failed. Please try again.";

      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; message?: string };
        if (apiError.status === 409) {
          errorMessage = "An account with this email already exists.";
        } else if (apiError.status === 400) {
          errorMessage = "Please check your input and try again.";
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }
      }

      // Show error toast
      if (window.showToast) {
        window.showToast({
          type: "error",
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isFieldTouched = (field: string) => touched.has(field);
  const getFieldErrorDisplay = (field: string) =>
    isFieldTouched(field) ? getFieldError(errors, field) : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Sign Up Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-input">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            {t("signup.title")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <FormInput
              type="text"
              name="name"
              placeholder={t("signup.name")}
              value={formData.name}
              onChange={(value) => handleInputChange("name", value)}
              onBlur={(value) => handleFieldBlur("name", value)}
              error={getFieldErrorDisplay("name")}
              required
              autoComplete="name"
            />

            {/* Email Field */}
            <FormInput
              type="email"
              name="email"
              placeholder={t("signup.email")}
              value={formData.email}
              onChange={(value) => handleInputChange("email", value)}
              onBlur={(value) => handleFieldBlur("email", value)}
              error={getFieldErrorDisplay("email")}
              required
              autoComplete="email"
            />

            {/* Password Field */}
            <FormInput
              type="password"
              name="password"
              placeholder={t("signup.password")}
              value={formData.password}
              onChange={(value) => handleInputChange("password", value)}
              onBlur={(value) => handleFieldBlur("password", value)}
              error={getFieldErrorDisplay("password")}
              required
              autoComplete="new-password"
            />

            {/* Confirm Password Field */}
            <FormInput
              type="password"
              name="confirmPassword"
              placeholder={t("signup.confirmPassword")}
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange("confirmPassword", value)}
              onBlur={(value) => handleFieldBlur("confirmPassword", value)}
              error={getFieldErrorDisplay("confirmPassword")}
              required
              autoComplete="new-password"
            />

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={!isFormValid(errors) || loading}
              className="w-full"
              loadingText={t("signup.creating")}
            >
              {t("signup.register")}
            </LoadingButton>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link
                to="/signin"
                className="text-primary hover:text-green-400 font-medium transition-colors"
              >
                {t("signup.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
