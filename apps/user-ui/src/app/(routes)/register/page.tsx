'use client';

import { FacebookButton, GoogleButton } from '@/components/social-buttons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLoader } from 'react-icons/fi';
import { RiEye2Line, RiEyeCloseLine } from 'react-icons/ri';

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState<string | null>(null);
  const [isShowOtp, setIsShowOtp] = useState(false);
  const [timer, setTimer] = useState(60);
  const [userData, setUserData] = useState<FormData | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

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

  const signUpMutation = useMutation({
    mutationKey: ['signUp'],
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/registration-user`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formdata) => {
      setUserData(formdata);
      setIsShowOtp(true);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ['verifyOtp'],
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-user`,
        {
          ...userData,
          otp: otp,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push('/login');
    },
  });

  const onSubmit = (data: FormData) => {
    signUpMutation.mutate(data);
  };

  const resendOtp = () => {
    if (userData) {
      signUpMutation.mutate(userData);
      startResendTimer();
    }
  };

  return (
    <div className="w-full py-10 min-h-[84dvh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-montserrat font-semibold text-black text-center">
        Register
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home · Register
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Register to x-shop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?{' '}
            <Link href="/login" className="text-lime-600">
              Log in
            </Link>
          </p>

          <div className="grid grid-cols-2 gap-x-3">
            <GoogleButton />
            <FacebookButton />
          </div>

          <div className="flex text-gray-400 justify-center items-center my-5 text-sm">
            <Separator className="flex-1" />
            <span className="px-3">or continue with Email</span>
            <Separator className="flex-1" />
          </div>

          {!isShowOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label>Name</Label>
                <Input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 3,
                      message: 'Name must be at least 3 characters',
                    },
                  })}
                  placeholder="John Doe"
                  type="text"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  placeholder="support@gmail.com"
                  type="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    placeholder="Min. 8 characters"
                    type={isPasswordVisible ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 text-gray-400"
                    onClick={() => setIsPasswordVisible((prev) => !prev)}
                  >
                    {isPasswordVisible ? (
                      <RiEye2Line size={22} />
                    ) : (
                      <RiEyeCloseLine size={22} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                disabled={signUpMutation.isPending}
                type="submit"
                size="lg"
                className={cn(
                  'w-full',
                  signUpMutation.isPending &&
                    'pointer-events-none cursor-not-allowed opacity-50'
                )}
              >
                {signUpMutation.isPending ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Register'
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-y-4">
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>

              <div className="flex justify-center">
                <InputOTP onChange={(val) => setOtp(val)} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} className="h-12 w-12 text-2xl" />
                    <InputOTPSlot index={1} className="h-12 w-12 text-2xl" />
                    <InputOTPSlot index={2} className="h-12 w-12 text-2xl" />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} className="h-12 w-12 text-2xl" />
                    <InputOTPSlot index={4} className="h-12 w-12 text-2xl" />
                    <InputOTPSlot index={5} className="h-12 w-12 text-2xl" />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                type="button"
                onClick={() => verifyOtpMutation.mutate()}
                size="lg"
                className="h-12 bg-lime-600"
                disabled={
                  !otp || otp.length !== 6 || verifyOtpMutation.isPending
                }
              >
                {verifyOtpMutation.isPending ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Verify OTP'
                )}
              </Button>

              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <button
                    className="text-lime-600 cursor-pointer"
                    onClick={resendOtp}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${timer}s`
                )}
              </p>
              {verifyOtpMutation.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-xs mt-2">
                    {verifyOtpMutation.error.response?.data.message}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
