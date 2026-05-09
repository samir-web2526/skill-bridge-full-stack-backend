import express from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post('/register', validateRequest(AuthValidation.registerValidationSchema), AuthController.register);
router.post('/login', validateRequest(AuthValidation.loginValidationSchema), AuthController.login);
router.post('/refresh-token', validateRequest(AuthValidation.refreshTokenValidationSchema), AuthController.refreshToken);

router.post(
    '/verify-email',
    AuthController.verifyEmail
);

router.post(
    '/google-login',
    AuthController.googleLogin
);

export const authRouter = router;
