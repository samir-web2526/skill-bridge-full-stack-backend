import { catchAsync, sendResponse } from "../../sharedfile";
import { StudentService } from "./student.service";

const getStudents = catchAsync(async (req, res) => {
    const result = await StudentService.getStudents(req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Students retrieved successfully",
        data: result,
    });
});

const getMyProfile = catchAsync(async (req, res) => {
    const result = await StudentService.getMyProfile(req.user);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "My profile retrieved successfully",
        data: result,
    });
});

const updateMyProfile = catchAsync(async (req, res) => {
    const result = await StudentService.updateMyProfile(req.user, req.body);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "My profile updated successfully",
        data: result,
    });
});

export const StudentController = {
    getStudents,
    getMyProfile,
    updateMyProfile
};