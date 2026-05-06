import { Request, Response } from "express";
import catchAsync from "../../sharedfile/catchAsync";
import sendResponse from "../../sharedfile/sendResponse";
import status from "http-status";
import { categoryService } from "./category.service";
import { paginationHelper } from "../../sharedfile";

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await categoryService.createCategory(req.body);
    sendResponse(res, {
        statusCode: Number(status.CREATED),
        success: true,
        message: "Category Created Successfully",
        data: result,
    });
});

const getCategory = catchAsync(async (req: Request, res: Response) => {
    const paginationOptions = paginationHelper.calculatePagination(req.query);
    const result = await categoryService.getCategory(paginationOptions);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Category fetched successfully",
        data: result,
    });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await categoryService.getCategoryById(categoryId as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Category fetched successfully by id",
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await categoryService.updateCategory(categoryId as string, req.body);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Category updated successfully",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const result = await categoryService.deleteCategory(categoryId as string);
    sendResponse(res, {
        statusCode: Number(status.OK),
        success: true,
        message: "Category deleted successfully",
        data: result,
    });
});

export const categoryController = {
    createCategory,
    getCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
