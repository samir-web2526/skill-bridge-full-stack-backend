import { Request, Response } from "express";
import catchAsync from "../../sharedfile/catchAsync";
import sendResponse from "../../sharedfile/sendResponse";
import status from "http-status";
import { tutorService } from "./tutor.service";
import { paginationHelper } from "../../sharedfile/paginationHelper";

const getTutors = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = paginationHelper.calculatePagination(req.query);
    const filters = req.query;
    const result = await tutorService.getTutors(paginationOptions, filters);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutors fetched successfully",
        data: result,
    });
});

const getTutorById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tutorService.getTutorById(id as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutor fetched successfully by id",
        data: result,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await tutorService.getMyProfile(user?.id as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutor profile fetched successfully",
        data: result,
    });
});

const getStats = catchAsync(async (req: Request, res: Response) => {
    const result = await tutorService.getStats();
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Stats fetched successfully",
        data: result,
    });
});

const updateTutor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tutorService.updateTutor(id as string, req.body);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutor updated successfully",
        data: result,
    });
});

const deleteTutor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tutorService.deleteTutor(id as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutor deleted successfully",
        data: result,
    });
});

const restoreTutor = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tutorService.restoreTutor(id as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutor restored successfully",
        data: result,
    });
});

const getDeletedTutors = catchAsync(async (req: Request, res: Response) => {
    const result = await tutorService.getDeletedTutors();
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Deleted tutors fetched successfully",
        data: result,
    });
});

const updateTutorStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await tutorService.updateTutorStatus(id as string, req.body);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Tutor status updated successfully",
        data: result,
    });
});

export const tutorController = {
    getTutors,
    getTutorById,
    getMyProfile,
    getStats,
    updateTutor,
    updateTutorStatus,
    deleteTutor,
    restoreTutor,
    getDeletedTutors,
};
