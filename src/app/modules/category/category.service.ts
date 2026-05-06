import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const createCategory = async (payload: any) => {
    const result = await prisma.category.create({
        data: payload,
    });
    return result;
};

const getCategory = async (paginationOptions: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationOptions;

    const result = await prisma.category.findMany({
        skip,
        take: limit,
        orderBy: sortBy
            ? { [sortBy]: sortOrder }
            : { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    tutor: true,
                },
            },
            tutor: {
                select: {
                    _count: {
                        select: {
                            booking: true,
                        },
                    },
                },
            },
        },
    });

    const total = await prisma.category.count();

    const data = result.map((cat) => ({
        ...cat,
        totalBookings: cat.tutor.reduce(
            (sum, t) => sum + (t._count?.booking ?? 0),
            0
        ),
    }));

    return {
        meta: {
            page,
            limit,
            total,
        },
        data,
    };
};

const getCategoryById = async (categoryId: string) => {
    const result = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
            _count: {
                select: {
                    tutor: true,
                },
            },
            tutor: {
                select: {
                    _count: {
                        select: {
                            booking: true,
                        },
                    },
                },
            },
        },
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "Category not found");
    }
    return result;
};

const updateCategory = async (categoryId: string, payload: any) => {
    const result = await prisma.category.update({
        where: { id: categoryId },
        data: payload,
    });
    return result;
};

const deleteCategory = async (categoryId: string) => {
    const result = await prisma.category.delete({
        where: { id: categoryId },
    });
    return result;
};

export const categoryService = {
    createCategory,
    getCategory,
    getCategoryById,
    updateCategory,
    deleteCategory,
};
