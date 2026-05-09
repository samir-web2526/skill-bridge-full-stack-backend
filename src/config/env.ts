import dotenv from 'dotenv';
import status from 'http-status';
import AppError from '../app/errorHelpers/AppError';


dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    FRONTEND_URL: string;
    ACCESS_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRES_IN: number;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRES_IN: number;
    BCRYPT_SALT_ROUNDS:number;
    ADMIN_EMAIL: string;
    ADMIN_PASSWORD: string;
    ADMIN_NAME: string;
    ADMIN_PHONE: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
    EMAIL_HOST: string;
    EMAIL_PORT: number;
    EMAIL_USER: string;
    EMAIL_PASS: string;
    EMAIL_FROM: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
}


const loadEnvVariables = (): EnvConfig => {

    const requireEnvVariable = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'FRONTEND_URL',
        'ACCESS_TOKEN_SECRET',
        'ACCESS_TOKEN_EXPIRES_IN',
        'REFRESH_TOKEN_SECRET',
        'REFRESH_TOKEN_EXPIRES_IN',
        'BCRYPT_SALT_ROUNDS',
        'ADMIN_EMAIL',
        'ADMIN_PASSWORD',
        'ADMIN_NAME',
        'ADMIN_PHONE',
        'STRIPE_SECRET_KEY',
        'STRIPE_WEBHOOK_SECRET',
        // 'EMAIL_HOST',
        // 'EMAIL_PORT',
        // 'EMAIL_USER',
        // 'EMAIL_PASS',
        // 'EMAIL_FROM',
        // 'GOOGLE_CLIENT_ID',
        // 'GOOGLE_CLIENT_SECRET'
    ]

    requireEnvVariable.forEach((variable) => {
        if (!process.env[variable]) {
            // throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${variable} is required but not set in .env file.`);
        }
    })

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
        ACCESS_TOKEN_EXPIRES_IN: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN as string),
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
        REFRESH_TOKEN_EXPIRES_IN: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN as string),
        BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS as string),
        ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
        ADMIN_NAME: process.env.ADMIN_NAME as string,
        ADMIN_PHONE: process.env.ADMIN_PHONE as string,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
        EMAIL_HOST: process.env.EMAIL_HOST as string || '',
        EMAIL_PORT: parseInt(process.env.EMAIL_PORT as string || '587'),
        EMAIL_USER: process.env.EMAIL_USER as string || '',
        EMAIL_PASS: process.env.EMAIL_PASS as string || '',
        EMAIL_FROM: process.env.EMAIL_FROM as string || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string || '',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string || '',
    }
}

export const envVars = loadEnvVariables();
