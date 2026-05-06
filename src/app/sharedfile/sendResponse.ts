import { Response } from 'express';

interface IApiResponse<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    meta?: {
        page: number;
        limit: number;
        total: number;
    };
}

const sendResponse = <T>(
    res: Response,
    data: IApiResponse<T>
): void => {
    const { statusCode, success, message, data: responseData, meta } = data;

    const response: IApiResponse<T> = {
        statusCode,
        success,
        message,
        ...(responseData && { data: responseData }),
        ...(meta && { meta }),
    };

    res.status(statusCode).json(response);
};

export default sendResponse;