import { Request, Response } from "express";
import catchAsync from "../../sharedfile/catchAsync";
import sendResponse from "../../sharedfile/sendResponse";
import status from "http-status";
import { reviewService } from "./review.service";
import { paginationHelper } from "../../sharedfile";

const createReview = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await reviewService.createReview(req.body, user?.id as string);
    sendResponse(res, {
        statusCode: Number(status.CREATED),
        success: true,
        message: "Review Created Successfully",
        data: result,
    });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = paginationHelper.calculatePagination(req.query);

    const result = await reviewService.getReviews(paginationOptions);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Reviews fetched successfully",
        data: result,
    });
});

const getMyGivenReview = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = paginationHelper.calculatePagination(req.query);
    const user = req.user;
    const result = await reviewService.getMyGivenReview(user?.id as string, paginationOptions);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "My given reviews fetched successfully",
        data: result,
    });
});

const getMyReceivedReview = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = paginationHelper.calculatePagination(req.query);
    const user = req.user;
    const result = await reviewService.getMyReceivedReview(user?.id as string, paginationOptions);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "My received reviews fetched successfully",
        data: result,
    });
});

const getReviewByTutorId = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = paginationHelper.calculatePagination(req.query);
    const { tutorId } = req.params;
    const result = await reviewService.getReviewByTutorId(tutorId as string, paginationOptions);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Reviews fetched successfully by tutor id",
        data: result,
    });
});

const getReviewById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await reviewService.getReviewById(id as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Review fetched successfully by id",
        data: result,
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await reviewService.updateReview(id as string, req.body, user?.id as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Review updated successfully",
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await reviewService.deleteReview(id as string, user?.id as string, user?.role as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Review deleted successfully",
        data: result,
    });
});

export const reviewController = {
    createReview,
    getAllReviews,
    getMyGivenReview,
    getMyReceivedReview,
    getReviewByTutorId,
    getReviewById,
    updateReview,
    deleteReview,
};
