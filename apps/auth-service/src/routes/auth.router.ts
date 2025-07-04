import { Router } from 'express';
import {
  loginUser,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPasswordOtp,
} from '../controllers/auth.controller';

const router: Router = Router();

router.post('/registration-user', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/forgot-password-user', userForgotPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPasswordOtp);
router.post('/reset-password-user', resetUserPassword);

export default router;
