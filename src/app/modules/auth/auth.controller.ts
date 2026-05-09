import { Request, Response } from 'express';
import { envVars } from '../../../config/env';
import { AuthService } from './auth.service';
import catchAsync from '../../sharedfile/catchAsync';
import sendResponse from '../../sharedfile/sendResponse';
import status from 'http-status';
import { tokenUtils } from '../../utils/token';

const register = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body);
    console.log("BODY:", req.body);
    console.log("FROM:", req.body.availableFrom);
    console.log("TO:", req.body.availableTo);

    sendResponse(res, {
        statusCode: Number(status.CREATED),
        success: true,
        message: 'User registered successfully',
        data: result,
    });
});

const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    const { refreshToken, accessToken } = result;

    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: 'User logged in successfully',
        data: {
            accessToken, refreshToken
        },
    });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const result = await AuthService.refreshToken(refreshToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Access token generated successfully!',
        data: result,
    });
});

// const verifyEmail = catchAsync(async (req: Request, res: Response) => {
//     const { token } = req.body;
//     const result = await AuthService.verifyEmail(token);

//     sendResponse(res, {
//         statusCode: status.OK,
//         success: true,
//         message: 'Email verified successfully!',
//         data: result,
//     });
// });

const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const { idToken } = req.body;
    const result = await AuthService.googleLogin(idToken);

    const { refreshToken, accessToken } = result;

    res.cookie('refreshToken', refreshToken, {
        secure: envVars.NODE_ENV === 'production',
        httpOnly: true,
    });

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'User logged in successfully!',
        data: {
            accessToken,
        },
    });
});

export const AuthController = {
    register,
    login,
    refreshToken,
    // verifyEmail,
    googleLogin,
};
