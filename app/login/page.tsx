"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPassword, setErrorPassword] = useState("");
  const [errorAuth, setErrorAuth] = useState("");
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setErrorAuth("");

    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setErrorEmail(emailErr);
    setErrorPassword(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signIn({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorAuth(error.message);
      } else {
        router.push("/books");
      }
    } catch (err: unknown) {
      setErrorAuth(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Login to ShelfLife</CardTitle>
          <CardDescription>Enter your email and password to open your bookshelf</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            data-testid="login-form"
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

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                data-testid="login-email"
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
                data-testid="login-password"
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

            <Button
              type="submit"
              data-testid="login-submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
