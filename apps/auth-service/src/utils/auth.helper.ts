import { NextFunction } from 'express';
import crypto from 'node:crypto';

import { ValidationError } from '../../../../packages/error-handler';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendmail';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validationRegistrationData = (
  data: any,
  userType: 'user' | 'seller'
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === 'seller' && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid email format`);
  }
};

export const checkOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        'Account is locked. Please try again after 30 minutes.'
      )
    );
  }
  if (await redis.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError('Too many requests. Please try again after 1 hours.')
    );
  }
  if (await redis.get(`otp_cooldown:${email}`)) {
    return next(new ValidationError('Please try again after 1 minute.'));
  }
};

export const trackOtpRequest = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  let otpRequest = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequest >= 2) {
    await redis.set(`otp_spam_lock:${email}`, 'true', 'EX', 3600);
    return next(
      new ValidationError('Too many requests. Please try again later.')
    );
  }

  await redis.set(otpRequestKey, ++otpRequest, 'EX', 60);
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  await sendEmail(email, 'Verify your email', template, { name, otp });
  await redis.set(`otp:${email}`, otp, 'EX', 300);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60);
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    return next(new ValidationError('Invalid OTP'));
  }
  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || '0');
  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redis.set(`otp_lock:${email}`, 'locked', 'EX', 1800);
      await redis.del(`otp:${email}`, failedAttemptsKey);
      return next(
        new ValidationError(
          'Too many incorrect attempts. Your account has been locked.'
        )
      );
    }
    await redis.set(failedAttemptsKey, failedAttempts + 1, 'EX', 300);
    return next(
      new ValidationError(`Incorrect OTP. ${2 - failedAttempts} tries left.`)
    );
  }

  await redis.del(`otp:${email}`, failedAttemptsKey);
};
