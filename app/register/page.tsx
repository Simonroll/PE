"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorConfirmPassword, setErrorConfirmPassword] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (val: string): string => {
    if (!val) {
      return "Password is required";
    }
    if (val.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateConfirmPassword = (val: string, currentPassword: string): string => {
    if (!val) {
      return "Confirm password is required";
    }
    if (val !== currentPassword) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (hasSubmitted) {
      const err = validateEmail(val);
      setErrorEmail(err);
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (hasSubmitted) {
      const err = validatePassword(val);
      setErrorPassword(err);
      if (confirmPassword) {
        setErrorConfirmPassword(validateConfirmPassword(confirmPassword, val));
      }
    }
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (hasSubmitted) {
      const err = validateConfirmPassword(val, password);
      setErrorConfirmPassword(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth("");
    setFormSuccess("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword, password);

    setErrorEmail(emailErr);
    setErrorPassword(passwordErr);
    setErrorConfirmPassword(confirmErr);

    if (emailErr || passwordErr || confirmErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorAuth(error.message);
      } else {
        setFormSuccess("Registration successful");
      }
    } catch (err: unknown) {
      setErrorAuth(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Register for SpendWise</CardTitle>
          <CardDescription>Create a personal account to start recording expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            data-testid="register-form"
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            {errorAuth ? (
              <div
                data-testid="error-auth"
                className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm font-medium"
              >
                {errorAuth}
              </div>
            ) : null}

            {formSuccess ? (
              <div
                data-testid="form-success"
                className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm font-medium"
              >
                {formSuccess}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="register-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {errorEmail ? (
                <p data-testid="error-email" className="text-sm text-red-500 font-medium">
                  {errorEmail}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                data-testid="register-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {errorPassword ? (
                <p data-testid="error-password" className="text-sm text-red-500 font-medium">
                  {errorPassword}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                data-testid="register-confirm-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              />
              {errorConfirmPassword ? (
                <p
                  data-testid="error-confirm-password"
                  className="text-sm text-red-500 font-medium"
                >
                  {errorConfirmPassword}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              data-testid="register-submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
