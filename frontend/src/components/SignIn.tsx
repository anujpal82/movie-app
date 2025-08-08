import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useTranslation } from "react-i18next";
import {
  validateLoginForm,
  validateFieldOnBlur,
  getFieldError,
  isFormValid,
} from "../utils/validation";
import { ValidationError } from "../types/auth";
import FormInput from "./FormInput";
import LoadingButton from "./LoadingButton";
import LanguageSwitcher from "./LanguageSwitcher";

const SignIn: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(false);

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
    const fieldError = validateFieldOnBlur(field, value);

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
    setTouched(new Set(["email", "password"]));

    // Validate form
    const validationErrors = validateLoginForm(
      formData.email,
      formData.password
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
      await authService.login(
        {
          email: formData.email,
          password: formData.password,
        },
        rememberMe
      );

      // Show success toast
      if (window.showToast) {
        window.showToast({
          type: "success",
          message: "Login successful! Redirecting...",
        });
      }

      // Navigate immediately after successful login
      navigate("/movies");
    } catch (error: unknown) {
      console.error("Login failed:", error);

      let errorMessage = "Login failed. Please check your credentials.";

      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number; message?: string };
        if (apiError.status === 401) {
          errorMessage = "Invalid email or password.";
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
        {/* Sign In Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-input">
          <h1 className="text-3xl font-bold text-white text-center mb-8">
            {t("signin.title")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <FormInput
              type="email"
              name="email"
              placeholder={t("signin.email")}
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
              placeholder={t("signin.password")}
              value={formData.password}
              onChange={(value) => handleInputChange("password", value)}
              onBlur={(value) => handleFieldBlur("password", value)}
              error={getFieldErrorDisplay("password")}
              required
              autoComplete="current-password"
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-slate-300 text-sm select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-input bg-input/50"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t("signin.remember_me")}</span>
              </label>
            </div>

            {/* Submit Button */}
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={!isFormValid(errors) || loading}
              className="w-full"
              loadingText={t("signin.signing_in")}
            >
              {t("signin.login")}
            </LoadingButton>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              {t("signin.dontHaveAccount")}{" "}
              <Link
                to="/signup"
                className="text-primary hover:text-green-400 font-medium transition-colors"
              >
                {t("signin.signUp")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
