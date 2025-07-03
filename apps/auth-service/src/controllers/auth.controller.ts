import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../../../../packages/error-handler';
import prisma from '../../../../packages/libs/prisma';
import {
  checkOtpRestriction,
  trackOtpRequest,
  validationRegistrationData,
} from '../utils/auth.helper';
import { setCookie } from '../utils/cookies/setCookie';
import { sendOtp, verifyOtp } from './../utils/auth.helper';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validationRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    // If email is not a unique field, use findFirst instead of findUnique
    const exitingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (exitingUser) {
      return next(new ValidationError(`User already exists`));
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequest(email, next);
    await sendOtp(name, email, 'user-activation-email');
    return res
      .status(200)
      .json({ message: 'OTP sent. Please check your email and verify' });
  } catch (error) {
    return next(error);
  }
};

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !name || !password) {
      return next(new ValidationError(`All fields are required`));
    }
    const exitingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (exitingUser) {
      return next(new ValidationError(`User already exist with this email`));
    }

    await verifyOtp(email, otp, next);
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ValidationError(`Email and password are required`));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return next(new ValidationError(`User not found`));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');

    if (!isPasswordValid) {
      return next(new ValidationError(`Invalid email or password`));
    }

    // Generate access token and refresh token and send them to the client
    const accessToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: 'user' },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '7d' }
    );
    // store the refresh and access token in an httpOnly cookie
    setCookie(res, 'access_token', accessToken);
    setCookie(res, 'refresh_token', refreshToken);

    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
