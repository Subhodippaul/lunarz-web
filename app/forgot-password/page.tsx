"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { InlineLoader } from "@/components/ui/loader";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

// Separate component that uses useSearchParams
function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [isValidating, setIsValidating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  // Validate unique ID on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const validateWithDelay = () => {
        const urlUid = searchParams.get('uid');
        const localStorageUid = localStorage.getItem('uniqueId');
        
        if (!urlUid) {
          addToast({
            title: "Access Denied",
            description: "Please access forgot password from login page",
            type: "error",
          });
          router.push(NAV_LINKS.home);
          return;
        }
        
        if (!localStorageUid || urlUid !== localStorageUid) {
          addToast({
            title: "Session Invalid",
            description: "Please try again from login page",
            type: "error",
          });
          router.push(NAV_LINKS.home);
          return;
        }
        
        setIsValidating(false);
      };

      const localStorageUid = localStorage.getItem('uniqueId');
      if (localStorageUid) {
        validateWithDelay();
      } else {
        setTimeout(validateWithDelay, 500);
      }
    }
  }, [searchParams, router, addToast]);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Show loading while validating
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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      addToast({
        title: "Email Required",
        description: "Please enter your email address.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        addToast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
          type: "success",
        });
        setStep('otp');
        setOtpTimer(300); // 5 minutes
      } else {
        addToast({
          title: "Error",
          description: result.message || "Failed to send OTP. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      addToast({
        title: "OTP Required",
        description: "Please enter the verification code.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (response.ok) {
        addToast({
          title: "OTP Verified",
          description: "Please set your new password.",
          type: "success",
        });
        setStep('reset');
      } else {
        addToast({
          title: "Invalid OTP",
          description: result.message || "Please check your verification code.",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      addToast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        type: "error",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        type: "error",
      });
      return;
    }

    if (newPassword.length < 6) {
      addToast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        addToast({
          title: "Password Reset Successful",
          description: "Your password has been updated. Please login with your new password.",
          type: "success",
        });
        
        // Redirect to login page with uid
        const uniqueId = localStorage.getItem('uniqueId');
        router.push(uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login);
      } else {
        addToast({
          title: "Reset Failed",
          description: result.message || "Failed to reset password. Please try again.",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/send-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        addToast({
          title: "OTP Resent",
          description: "A new verification code has been sent to your email.",
          type: "success",
        });
        setOtpTimer(300); // 5 minutes
      } else {
        addToast({
          title: "Error",
          description: result.message || "Failed to resend OTP.",
          type: "error",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: "Network error. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-semibold">
              {step === 'email' && 'Forgot Password'}
              {step === 'otp' && 'Verify Email'}
              {step === 'reset' && 'Reset Password'}
            </CardTitle>
            <p className="text-center text-sm text-gray-600">
              {step === 'email' && 'Enter your email to receive a verification code'}
              {step === 'otp' && 'Enter the 6-digit code sent to your email'}
              {step === 'reset' && 'Create a new password for your account'}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={isLoading}
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500">
                    Code sent to: {email}
                  </p>
                </div>

                {otpTimer > 0 && (
                  <div className="text-center text-sm text-gray-600">
                    Resend code in {formatTime(otpTimer)}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify Code"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendOTP}
                  disabled={isLoading || otpTimer > 0}
                >
                  Resend Code
                </Button>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="text-xs text-gray-500">
                  Password must be at least 6 characters long
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            <div className="text-center">
              <Link 
                href={(() => {
                  const uniqueId = typeof window !== 'undefined' ? localStorage.getItem('uniqueId') : null;
                  return uniqueId ? `${NAV_LINKS.login}?uid=${uniqueId}` : NAV_LINKS.login;
                })()} 
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main ForgotPasswordPage component with Suspense boundary
export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  );
}