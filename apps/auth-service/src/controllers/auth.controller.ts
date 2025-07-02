import { NextFunction, Request, Response } from 'express';

import { ValidationError } from '../../../../packages/error-handler';
import prisma from '../../../../packages/libs/prisma';
import {
  checkOtpRestriction,
  trackOtpRequest,
  validationRegistrationData,
} from '../utils/auth.helper';
import { sendOtp } from './../utils/auth.helper';

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
