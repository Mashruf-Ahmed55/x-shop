'use client';

import { FacebookButton, GoogleButton } from '@/components/social-buttons';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiLoader } from 'react-icons/fi';
import { RiEye2Line, RiEyeCloseLine } from 'react-icons/ri';
type FromData = {
  email: string;
  password: string;
};

export default function page() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const router = useRouter();
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
      setServerError(null);
      router.push('/');
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message: string })?.message ||
        'Invalid credentials';
      setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: FromData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[84dvh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-montserrat font-semibold text-black text-center">
        Log In
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#00000099]">
        Home . Login
      </p>
      <div className="w-full flex justify-center">
        <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Log in to x-shop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Don't have an account?{' '}
            <Link href={'/register'} className="text-lime-600">
              Register
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
            <div className="flex flex-col gap-2">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  className="rounded-sm focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                />
                <button
                  className="absolute inset-y-0 right-0 flex items-center pr-3 focus:outline-none text-gray-400 cursor-pointer"
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <RiEye2Line size={22} />
                  ) : (
                    <RiEyeCloseLine size={22} />
                  )}
                </button>
              </div>
              {errors.password?.message && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="flex justify-between items-center my-4">
              <Label htmlFor="remember">
                <Checkbox
                  onChange={() => setIsRememberMe(!isRememberMe)}
                  id="remember"
                />
                Remember me
              </Label>
              <Link
                href={'/forgot-password'}
                className="text-lime-600 text-sm hover:underline"
              >
                Forgot Password?
              </Link>
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
                'Log In'
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
