import { Router } from 'express';
import { userRegistration } from '../controllers/auth.controller';

const router: Router = Router();

router.post('/user-registration', userRegistration);

export default router;
