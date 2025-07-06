'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'password' | 'complete';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();

  // --- React Query Mutations ---
  const requestOtpMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await axios.post(`/api/forgot-password-user`, { email });
      return res.data;
    },
    onSuccess: () => {
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      setTimer(120);
      setOtp(['', '', '', '', '', '']);
      toast.success('OTP sent successfully.');
    },
    onError: (error: AxiosError) => {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        'Failed to send OTP.';
      setServerError(msg);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const res = await axios.post(`/api/verify-forgot-password-user`, data);
      return res.data;
    },
    onSuccess: () => {
      setStep('password');
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        'Invalid OTP. Please try again.';
      setServerError(msg);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { email: string; newPassword: string }) => {
      const res = await axios.post(`/api/reset-password-user`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
      setStep('complete');
      setServerError(null);
      router.push('/login');
    },
    onError: (error: AxiosError) => {
      const msg =
        (error.response?.data as { message?: string })?.message ||
        'Failed to reset password.';
      setServerError(msg);
    },
  });

  // --- OTP Timer Effect ---
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // --- Handlers ---
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (!email.trim()) {
      setServerError('Please enter your email.');
      return;
    }
    requestOtpMutation.mutate(email.trim());
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) return; // only 1 digit
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (otp.some((d) => d === '')) {
      setServerError('Please enter the full 6-digit code.');
      return;
    }
    verifyOtpMutation.mutate({ email, otp: otp.join('') });
  };

  const handleResendOtp = () => {
    setServerError(null);
    setCanResend(false);
    setTimer(120);
    setOtp(['', '', '', '', '', '']);
    requestOtpMutation.mutate(email);
  };

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const validatePassword = (pwd: string) => {
    const errs: string[] = [];
    if (pwd.length < 8) errs.push('At least 8 characters');
    if (!/[A-Z]/.test(pwd)) errs.push('One uppercase letter');
    if (!/[a-z]/.test(pwd)) errs.push('One lowercase letter');
    if (!/\d/.test(pwd)) errs.push('One number');
    return errs;
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordErrors(validatePassword(val));
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    if (password !== confirmPassword) {
      setServerError("Passwords don't match");
      return;
    }
    if (passwordErrors.length > 0) {
      setServerError('Password does not meet requirements');
      return;
    }
    resetPasswordMutation.mutate({ email, newPassword: password });
  };

  // --- UI Steps ---

  if (step === 'email') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-6">
            <ShoppingBag className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-2 text-3xl font-bold text-gray-900">X-Store</h1>
            <h2 className="mt-4 text-2xl font-semibold">
              Forgot your password?
            </h2>
            <p className="mt-2 text-gray-600">
              Enter your email and we'll send you a verification code.
            </p>
          </div>

          <form
            onSubmit={handleSendOtp}
            className="bg-white p-8 rounded shadow space-y-6"
          >
            <div>
              <Label
                htmlFor="email"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>
            {serverError && (
              <p className="text-red-600 text-sm">{serverError}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={requestOtpMutation.isPending}
            >
              {requestOtpMutation.isPending
                ? 'Sending...'
                : 'Send Verification Code'}
            </Button>

            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-blue-600 hover:underline inline-flex items-center text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    const formatTime = (sec: number) => {
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-6">
            <ShoppingBag className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-2 text-3xl font-bold text-gray-900">X-Store</h1>
            <h2 className="mt-4 text-2xl font-semibold">Check your email</h2>
            <p className="mt-2 text-gray-600">We sent a 6-digit code to</p>
            <p className="font-medium">{email}</p>
          </div>

          <form
            onSubmit={handleVerifyOtp}
            className="bg-white p-8 rounded shadow space-y-6"
          >
            <div>
              <Label className="block mb-1 text-sm font-medium text-gray-700">
                Enter verification code
              </Label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, i) => (
                  <Input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(i, e.target.value.replace(/\D/, ''))
                    }
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-12 text-center text-xl font-semibold"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
            </div>

            {serverError && (
              <p className="text-red-600 text-sm">{serverError}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={verifyOtpMutation.isPending || otp.some((d) => !d)}
            >
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center mt-4">
              {timer > 0 ? (
                <p className="text-gray-600 text-sm">
                  Resend code in{' '}
                  <span className="font-mono font-semibold text-blue-600">
                    {formatTime(timer)}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:underline text-sm font-medium"
                  disabled={!canResend || requestOtpMutation.isPending}
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setServerError(null);
                }}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Email
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'password') {
    const isPasswordValid = password.length >= 8 && passwordErrors.length === 0;
    const doPasswordsMatch =
      password === confirmPassword && confirmPassword.length > 0;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mb-6">
            <ShoppingBag className="mx-auto h-12 w-12 text-blue-600" />
            <h1 className="mt-2 text-3xl font-bold text-gray-900">X-Store</h1>
            <h2 className="mt-4 text-2xl font-semibold">Create new password</h2>
            <p className="mt-2 text-gray-600">
              Your new password must be different from your previous password.
            </p>
          </div>

          <form
            onSubmit={handleResetPassword}
            className="bg-white p-8 rounded shadow space-y-6"
          >
            <div>
              <Label
                htmlFor="password"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={onPasswordChange}
                  required
                  placeholder="Enter new password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <ul className="mt-1 text-xs text-gray-600 list-disc list-inside space-y-0.5">
                <li
                  className={
                    password.length >= 8 ? 'text-green-600' : 'text-gray-400'
                  }
                >
                  At least 8 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'
                  }
                >
                  One uppercase letter
                </li>
                <li
                  className={
                    /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'
                  }
                >
                  One lowercase letter
                </li>
                <li
                  className={
                    /\d/.test(password) ? 'text-green-600' : 'text-gray-400'
                  }
                >
                  One number
                </li>
              </ul>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="block mb-1 text-sm font-medium text-gray-700"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <p
                  className={`text-xs mt-1 ${
                    doPasswordsMatch ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {doPasswordsMatch
                    ? '✓ Passwords match'
                    : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-red-600 text-sm">{serverError}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={
                !isPasswordValid ||
                !doPasswordsMatch ||
                resetPasswordMutation.isPending
              }
            >
              {resetPasswordMutation.isPending
                ? 'Resetting...'
                : 'Reset Password'}
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setStep('otp');
                  setServerError(null);
                }}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Verification
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step: Complete
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-blue-600" />
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-3xl font-bold text-gray-900">
          Password reset successful!
        </h1>
        <p className="text-gray-600">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>

        <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
          <Link href="/login">Sign In Now</Link>
        </Button>

        <p className="text-sm text-gray-600 mt-4">
          Need help?{' '}
          <Link href="/support" className="text-blue-600 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}
