'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import {
  ArrowLeft,
  Eye,
  EyeClosed,
  Lock,
  Mail,
  ShoppingBag,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [userData, setUserData] = useState<FormData | null>(null);
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const signUpMutation = useMutation({
    mutationKey: ['signUp'],
    mutationFn: async (data: FormData) => {
      const response = await axios.post(`/api/registration-user`, data);
      return response.data;
    },
    onSuccess: (_, formdata) => {
      setUserData(formdata);
      setStep('verify');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Registration failed');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ['verifyOtp'],
    mutationFn: async () => {
      if (!userData || !otp) throw new Error('Missing data');
      const response = await axios.post(`/api/verify-user`, {
        ...userData,
        otp,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('User registered successfully!');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'OTP verification failed');
    },
  });

  const resendOtp = () => {
    if (userData) {
      signUpMutation.mutate(userData);
    }
  };

  const onSubmit = (data: FormData) => {
    signUpMutation.mutate(data);
  };

  if (step === 'verify') {
    return (
      <OtpVerification
        email={userData?.email ?? ''}
        onBack={() => setStep('register')}
        onSubmit={() => verifyOtpMutation.mutate()}
        onResendOtp={resendOtp}
        onVerifyOtp={(otpValue) => setOtp(otpValue)}
      />
    );
  }

  return (
    <div className="min-h-[84vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <ShoppingBag className="h-12 w-12 text-blue-600" />
            <h1 className="ml-3 text-3xl font-bold text-gray-900">X-Store</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join X-Store and start shopping today
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                  })}
                  className="pl-10"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name?.message && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className="pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email?.message && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type={isPasswordVisible ? 'text' : 'password'}
                  className="pl-10 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {isPasswordVisible ? (
                    <Eye size={18} />
                  ) : (
                    <EyeClosed size={18} />
                  )}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-lime-600 hover:bg-lime-700"
              disabled={signUpMutation.isPending}
            >
              <span className="flex items-center justify-center">
                {signUpMutation.isPending && (
                  <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sign Up
              </span>
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-lime-600 hover:text-lime-500"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// OTP Component
function OtpVerification({
  email,
  onBack,
  onSubmit,
  onResendOtp,
  onVerifyOtp,
}: {
  email: string;
  onBack: () => void;
  onSubmit: () => void;
  onResendOtp: () => void;
  onVerifyOtp: (otp: string) => void;
}) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }

    setCanResend(false);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    onVerifyOtp(newOtp.join(''));

    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').trim();

    if (!/^\d{6}$/.test(pasteData)) return;
    const newOtp = pasteData.split('');
    setOtp(newOtp);
    onVerifyOtp(newOtp.join(''));

    const lastInput = document.getElementById(`otp-5`);
    lastInput?.focus();
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    onResendOtp();
    setTimer(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    onVerifyOtp('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((digit) => !digit)) {
      toast.error('Please enter all 6 digits');
      return;
    }
    onSubmit();
  };

  const formatTime = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
      seconds % 60
    ).padStart(2, '0')}`;

  return (
    <div className="min-h-[84vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <ShoppingBag className="h-12 w-12 text-blue-600" />
            <h1 className="ml-3 text-3xl font-bold text-gray-900">X-Store</h1>
          </div>
          <h2 className="text-2xl font-semibold">Verify your email</h2>
          <p className="text-sm text-gray-600">We sent a 6-digit code to</p>
          <p className="text-sm font-medium">{email}</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Enter verification code</Label>
              <div className="flex justify-center space-x-3 mt-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-semibold"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-lime-600 hover:bg-lime-700"
              disabled={otp.some((digit) => !digit)}
            >
              Verify Email
            </Button>
          </form>

          <div className="mt-6 space-y-4 text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-600">
                Resend code in{' '}
                <span className="font-mono font-semibold text-blue-600">
                  {formatTime(timer)}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResendOtp}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
                disabled={!canResend}
              >
                Resend OTP
              </button>
            )}

            <div>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to registration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
