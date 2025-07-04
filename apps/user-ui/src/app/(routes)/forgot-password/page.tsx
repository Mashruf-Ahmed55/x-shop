'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';
type FromData = {
  email: string;
  password: string;
};

export default function page() {
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FromData>();

  const loginMutation = useMutation({
    mutationKey: ['login'],
    mutationFn: async (data: FromData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login-user`,
        data,
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push('/');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Invalid credentials';
    },
  });

  const requestOTPMutation = useMutation({
    mutationKey: ['request-otp'],
    mutationFn: async (email: string) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password-user`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, email) => {
      setUserEmail(email);
      setStep('otp');
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Invalid OTP. Please try again!';
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ['verify-otp'],
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-forgot-password-user`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setStep('password');
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Invalid OTP. Please try again!';
      setServerError(errorMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: async (data: { password: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password-user`,
        {
          email: userEmail,
          newPassword: data.password,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully!');
      setServerError(null);
      router.push('/login');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Invalid OTP. Please try again!';
      setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: FromData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[84dvh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-montserrat font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Forgot Password
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Log in to x-shop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Go back to?{' '}
            <Link href={'/login'} className="text-lime-600">
              Login
            </Link>
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Email</Label>
              <Input
                className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                placeholder="support@gmail.com"
              />
              {errors.email?.message && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>
            <Button
              disabled={loginMutation.isPending}
              size={'lg'}
              type="submit"
              className="w-full"
            >
              {loginMutation.isPending ? (
                <FiLoader className="animate-spin" size={20} />
              ) : (
                'Submit'
              )}
            </Button>
            {serverError && (
              <p className="text-red-500 text-xs">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
