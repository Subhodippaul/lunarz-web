"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { InlineLoader } from "@/components/ui/loader";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { LOGIN, NAV_LINKS } from "@/lib/constants";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { login, loginWithGoogle, state } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const validateWithDelay = () => {
        const urlUid = searchParams.get("uid");
        const localStorageUid = localStorage.getItem("uniqueId");
        if (!urlUid) {
          addToast({ title: "Access Denied", description: "Please login again", type: "error" });
          router.push(NAV_LINKS.home);
          return;
        }
        if (!localStorageUid || urlUid !== localStorageUid) {
          addToast({ title: "Session Invalid", description: "Please login again", type: "error" });
          router.push(NAV_LINKS.home);
          return;
        }
        setIsValidating(false);
      };
      const localStorageUid = localStorage.getItem("uniqueId");
      if (localStorageUid) { validateWithDelay(); }
      else { setTimeout(validateWithDelay, 500); }
    }
  }, [searchParams, router, addToast]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="flex items-center justify-center py-8">
              <InlineLoader text="Validating session..." size="md" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      formData.email !== "123456" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!formData.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login(formData.email, formData.password);
    if (success) {
      addToast({ title: LOGIN.loginSuccess, description: "You have been logged in successfully.", type: "success" });
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) { localStorage.removeItem("redirectAfterLogin"); router.push(redirectUrl); }
      else { router.push(NAV_LINKS.home); }
    } else {
      setErrors({ email: " ", password: LOGIN.invalidCredentials });
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) {
      addToast({ title: LOGIN.loginSuccess, description: "You have been logged in with Google.", type: "success" });
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) { localStorage.removeItem("redirectAfterLogin"); router.push(redirectUrl); }
      else { router.push(NAV_LINKS.home); }
    } else {
      addToast({ title: "Login failed", description: "Google login failed. Please try again.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-4">
        {/* Announcement */}
        <Card className="rounded-2xl shadow-lg bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="pr-4 pl-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-blue-100 p-2 rounded-full shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                New to Lunarz or already with us? Sign up to unlock a seamless shopping experience.
              </p>
            </div>
            <Link href={(() => {
              const uniqueId = typeof window !== "undefined" ? localStorage.getItem("uniqueId") : null;
              return uniqueId ? `${NAV_LINKS.signup}?uid=${uniqueId}` : NAV_LINKS.signup;
            })()}>
              <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 font-medium">
                Sign Up Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">{LOGIN.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.email && errors.email.trim() && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">{LOGIN.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={LOGIN.passwordPlaceholder}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <Link
                  href={(() => {
                    const uniqueId = typeof window !== "undefined" ? localStorage.getItem("uniqueId") : null;
                    return uniqueId ? `/forgot-password?uid=${uniqueId}` : "/forgot-password";
                  })()}
                  className="text-blue-600 hover:underline"
                >
                  {LOGIN.forgotPassword}
                </Link>
              </div>

              <Button type="submit" className="w-full" loading={state.isLoading}>
                {LOGIN.loginButton}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={handleGoogleLogin} loading={state.isLoading}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {LOGIN.loginWithGoogle}
            </Button>

            <p className="text-center text-sm text-gray-500">
              {LOGIN.noAccount}{" "}
              <Link
                href={(() => {
                  const uniqueId = typeof window !== "undefined" ? localStorage.getItem("uniqueId") : null;
                  return uniqueId ? `${NAV_LINKS.signup}?uid=${uniqueId}` : NAV_LINKS.signup;
                })()}
                className="text-blue-600 hover:underline"
              >
                {LOGIN.signUp}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md">
          <Card className="rounded-2xl shadow-lg">
            <CardContent className="flex items-center justify-center py-8">
              <InlineLoader text="Loading..." size="md" />
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
