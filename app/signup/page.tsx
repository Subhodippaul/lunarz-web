"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { SIGNUP, NAV_LINKS } from "@/lib/constants";

export default function SignupPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { register, loginWithGoogle, state } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      addToast({
        title: "Missing information",
        description: "Please fill in all fields.",
        type: "error",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({
        title: "Password mismatch",
        description: SIGNUP.passwordMismatch,
        type: "error",
      });
      return;
    }

    if (formData.password.length < 6) {
      addToast({
        title: "Weak password",
        description: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    const success = await register(formData.email, formData.password, formData.name);
    
    if (success) {
      addToast({
        title: SIGNUP.signupSuccess,
        description: "Welcome to Lunarz! You can now start shopping.",
        type: "success",
      });
      router.push(NAV_LINKS.home);
    } else {
      addToast({
        title: "Signup failed",
        description: SIGNUP.emailExists,
        type: "error",
      });
    }
  };

  const handleGoogleSignup = async () => {
    const success = await loginWithGoogle();
    
    if (success) {
      addToast({
        title: SIGNUP.signupSuccess,
        description: "Welcome to Lunarz! You can now start shopping.",
        type: "success",
      });
      router.push(NAV_LINKS.home);
    } else {
      addToast({
        title: "Signup failed",
        description: "Google signup failed. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            {SIGNUP.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{SIGNUP.nameLabel}</Label>
              <Input
                id="name"
                type="text"
                placeholder={SIGNUP.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{SIGNUP.emailLabel}</Label>
              <Input
                id="email"
                type="email"
                placeholder={SIGNUP.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{SIGNUP.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                placeholder={SIGNUP.passwordPlaceholder}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{SIGNUP.confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={SIGNUP.confirmPasswordPlaceholder}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div className="text-xs text-gray-500">
              {SIGNUP.termsText}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={state.isLoading}
            >
              {state.isLoading ? "Creating account..." : SIGNUP.signupButton}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
            disabled={state.isLoading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {SIGNUP.signupWithGoogle}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {SIGNUP.haveAccount}{' '}
            <Link href={NAV_LINKS.login} className="text-blue-600 hover:underline">
              {SIGNUP.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}