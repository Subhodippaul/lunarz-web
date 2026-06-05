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
import { SIGNUP, NAV_LINKS } from "@/lib/constants";
import { Check, X, Eye, EyeOff } from "lucide-react";

// Password strength helpers
function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  barColor: string;
} {
  if (!password) return { score: 0, label: "", color: "", barColor: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "text-red-500", barColor: "bg-red-500" };
  if (score <= 3) return { score, label: "Medium", color: "text-yellow-500", barColor: "bg-yellow-500" };
  return { score, label: "Strong", color: "text-green-500", barColor: "bg-green-500" };
}

function getPasswordCriteria(password: string) {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "One number (0-9)", met: /[0-9]/.test(password) },
    { label: "One special character (@, #, $, etc.)", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

// Separate component that uses useSearchParams
function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { register, loginWithGoogle, state } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isValidating, setIsValidating] = useState(true);
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = getPasswordStrength(formData.password);
  const criteria = getPasswordCriteria(formData.password);
  const allCriteriaMet = criteria.every((c) => c.met);

  // Validate unique ID on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const validateWithDelay = () => {
        const urlUid = searchParams.get("uid");
        const localStorageUid = localStorage.getItem("uniqueId");

        if (!urlUid) {
          addToast({ title: "Access Denied", description: "Please signup again", type: "error" });
          router.push(NAV_LINKS.home);
          return;
        }

        if (!localStorageUid || urlUid !== localStorageUid) {
          addToast({ title: "Session Invalid", description: "Please signup again", type: "error" });
          router.push(NAV_LINKS.home);
          return;
        }

        setIsValidating(false);
      };

      const localStorageUid = localStorage.getItem("uniqueId");
      if (localStorageUid) {
        validateWithDelay();
      } else {
        setTimeout(validateWithDelay, 500);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      addToast({ title: "Missing information", description: "Please fill in all fields.", type: "error" });
      return;
    }

    if (!allCriteriaMet) {
      addToast({ title: "Weak password", description: "Password does not meet all requirements.", type: "error" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addToast({ title: "Password mismatch", description: SIGNUP.passwordMismatch, type: "error" });
      return;
    }

    const success = await register(formData.email, formData.password, formData.name);

    if (success) {
      addToast({ title: SIGNUP.signupSuccess, description: "Welcome to Lunarz! You can now start shopping.", type: "success" });
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        router.push(NAV_LINKS.home);
      }
    } else {
      const lastError = (window as any).__lastAuthError as string | undefined;
      const isRateLimit = lastError?.includes("rate_limit") || lastError?.includes("rate limit");
      addToast({
        title: isRateLimit ? "Too many attempts" : "Signup failed",
        description: isRateLimit
          ? "Email sending limit reached. Please wait a few minutes and try again, or contact support."
          : SIGNUP.emailExists,
        type: "error",
      });
    }
  };

  const handleGoogleSignup = async () => {
    const success = await loginWithGoogle();
    if (success) {
      addToast({ title: SIGNUP.signupSuccess, description: "Welcome to Lunarz!", type: "success" });
      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        router.push(redirectUrl);
      } else {
        router.push(NAV_LINKS.home);
      }
    } else {
      addToast({ title: "Signup failed", description: "Google signup failed. Please try again.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">{SIGNUP.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
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

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">{SIGNUP.passwordLabel}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="e.g. Abcs@6788"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setShowPasswordCriteria(true)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {formData.password.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-semibold ${strength.color}`}>{strength.label}</span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.barColor : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Criteria checklist */}
              {(showPasswordCriteria || formData.password.length > 0) && (
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 border border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2">Password must contain:</p>
                  {criteria.map((c) => (
                    <div key={c.label} className="flex items-center gap-2">
                      {c.met ? (
                        <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      )}
                      <span className={`text-xs ${c.met ? "text-green-700" : "text-gray-500"}`}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{SIGNUP.confirmPasswordLabel}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={SIGNUP.confirmPasswordPlaceholder}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            <div className="text-xs text-gray-500">{SIGNUP.termsText}</div>

            <Button
              type="submit"
              className="w-full"
              disabled={state.isLoading || !allCriteriaMet || formData.password !== formData.confirmPassword}
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

          <Button variant="outline" className="w-full" onClick={handleGoogleSignup} disabled={state.isLoading}>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {SIGNUP.signupWithGoogle}
          </Button>

          <p className="text-center text-sm text-gray-500">
            {SIGNUP.haveAccount}{" "}
            <Link
              href={(() => {
                const uniqueId = typeof window !== "undefined" ? localStorage.getItem("uniqueId") : null;
                return uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login;
              })()}
              className="text-blue-600 hover:underline"
            >
              {SIGNUP.login}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Main SignupPage component with Suspense boundary
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-md">
            <Card className="rounded-2xl shadow-lg">
              <CardContent className="flex items-center justify-center py-8">
                <InlineLoader text="Loading..." size="md" />
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <SignupPageContent />
    </Suspense>
  );
}
