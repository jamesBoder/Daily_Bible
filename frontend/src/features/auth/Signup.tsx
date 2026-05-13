import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../../services/api/authService";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { Card } from "../../components/common/Card";
import GoogleLoginButton from "../../components/common/GoogleLoginButton";
import { PasswordInput } from "../../components/common/PasswordInput";

export const Signup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t('auth.validation.emailRequired', 'Email is required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.validation.emailInvalid', 'Email is invalid');
    }

    if (!formData.username) {
      newErrors.username = t('auth.validation.usernameRequired', 'Username is required');
    } else if (formData.username.length < 3) {
      newErrors.username = t('auth.validation.usernameMinLength', 'Username must be at least 3 characters');
    }

    if (!formData.password) {
      newErrors.password = t('auth.validation.passwordRequired', 'Password is required');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordsMustMatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.signup({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        name: formData.name,
      });
      navigate("/verify-email-pending", { state: { email: formData.email } });
    } catch (err: any) {
      const errorMessage = err.response?.data?.details ||
                     err.response?.data?.error ||
                     t('auth.signup.registrationFailed', 'Signup failed. Please try again.');
      const errorField = err.response?.data?.field;
      const suggestion = err.response?.data?.suggestion;

      if (errorField) {
        setErrors({ [errorField]: errorMessage });
        if (suggestion) {
          setSuggestions({ [errorField]: suggestion });
        }
      } else {
        setErrors({ general: errorMessage });
      }

    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error and suggestion for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
    if (suggestions[e.target.name]) {
      setSuggestions({
        ...suggestions,
        [e.target.name]: "",
      });
    }
  };

  const applySuggestion = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    setSuggestions({
      ...suggestions,
      [field]: "",
    });
    setErrors({
      ...errors,
      [field]: "",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[var(--foreground)]">
            {t('auth.signup.title', 'Create Account')}
          </h2>
          <p className="mt-2 text-[var(--journal-text-muted)]">
            {t('auth.signup.subtitle', 'Join us on your spiritual journey')}
          </p>
        </div>
        <GoogleLoginButton
          mode="login"
          onError={(err) => setErrors({ general: err.message })}
        />
        <div className="my-6 flex items-center">
          <hr className="flex-grow border-t border-[var(--theme-border)]" />
          <span className="mx-4 text-[var(--journal-text-muted)]">{t('auth.signup.or', 'OR')}</span>
          <hr className="flex-grow border-t border-[var(--theme-border)]" />
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                <p className="font-semibold">{t('auth.signup.registrationFailed', 'Registration Failed')}</p>
                <p className="text-sm mt-1">{errors.general}</p>
              </div>
            )}


            <div>
              <Input
                label={t('auth.signup.email', 'Email')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                error={errors.email}
                required
                autoComplete="email"
              />
              {suggestions.email && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {t('auth.signup.didYouMean', 'Did you mean')}{" "}
                    <button
                      type="button"
                      onClick={() => applySuggestion("email", suggestions.email)}
                      className="font-semibold underline hover:no-underline"
                    >
                      {suggestions.email}
                    </button>
                    ?
                  </p>
                </div>
              )}
            </div>

            <Input
              label={t('auth.signup.username', 'Username')}
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              error={errors.username}
              required
              autoComplete="username"
            />

            <Input
              label={t('auth.signup.name', 'Name (Optional)')}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
            />

            <PasswordInput
              label={t('auth.signup.password', 'Password')}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.password}
              showRequirements={true}
              required
              autoComplete="new-password"
            />

            <PasswordInput
              label={t('auth.signup.confirmPassword', 'Confirm Password')}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
              autoComplete="new-password"
            />


            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full"
            >
              {t('auth.signup.submit', 'Create Account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--journal-text-muted)]">
              {t('auth.signup.hasAccount', 'Already have an account?')}{" "}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                {t('auth.signup.signIn', 'Sign in')}
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
