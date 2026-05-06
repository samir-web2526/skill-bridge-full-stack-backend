import { UserStatus } from "../../../generated/enums";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";


const getTutors = async (paginationOptions: any, filters: any) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationOptions;
    const { searchTerm, categoryId, minPrice, maxPrice, category } = filters;

    const andConditions: any[] = [{ isDeleted: false }];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { user: { name: { contains: searchTerm, mode: "insensitive" } } },
                { bio: { contains: searchTerm, mode: "insensitive" } },
            ],
        });
    }

    if (categoryId) {
        andConditions.push({ categoryId });
    }

    if (category && category.trim() !== "") {
        andConditions.push({
            category: {
                name: {
                    contains: category,
                    mode: "insensitive",
                },
            },
        });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        andConditions.push({
            hourlyRate: {
                ...(minPrice !== undefined && { gte: Number(minPrice) }),
                ...(maxPrice !== undefined && { lte: Number(maxPrice) }),
            },
        });
    }

    const whereConditions = { AND: andConditions };

    const result = await prisma.tutorProfile.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
        include: { user: true, category: true, _count: { select: { booking: true, review: true, } } },
    });

    const total = await prisma.tutorProfile.count({
        where: whereConditions,
    });

    return {
        meta: { page, limit, total, totalPage: Math.ceil(total / limit || 1) },
        data: result,
    };
};

const getTutorById = async (id: string) => {
    const result = await prisma.tutorProfile.findUnique({
        where: { id, isDeleted: false },
        include: {
            user: true,
            category: true,
            _count: {
                select: {
                    booking: true,
                    review: true,
                }
            },
            review: {
                include: {
                    user: true,
                },
            },
        },
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "Tutor not found");
    }
    return result;
};

const getMyProfile = async (userId: string) => {
    const result = await prisma.tutorProfile.findUnique({
        where: { userId, isDeleted: false },
        include: {
            user: true,
            category: true,
            _count: {
                select: {
                    booking: true,
                    review: true,
                }
            }
        },
    });
    if (!result) {
        throw new AppError(status.NOT_FOUND, "Tutor profile not found");
    }
    return result;
};

const getStats = async () => {
    const totalTutors = await prisma.tutorProfile.count({ where: { isDeleted: false } });
    const totalBookings = await prisma.booking.count();
    const totalStudents = await prisma.studentProfile.count({ where: { isDeleted: false } });
    const totalCategories = await prisma.category.count();

    return {
        totalTutors,
        totalBookings,
        totalStudents,
        totalCategories
    };
};

const updateTutor = async (id: string, payload: any) => {
    const result = await prisma.tutorProfile.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteTutor = async (id: string) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { id },
    });

    if (!tutor) {
        throw new AppError(status.NOT_FOUND, "Tutor not found");
    }

    if (tutor.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Tutor is already deleted");
    }

    const result = await prisma.tutorProfile.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
        },
    });
    return result;
};
const restoreTutor = async (id: string) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { id },
    });

    if (!tutor) {
        throw new AppError(status.NOT_FOUND, "Tutor not found");
    }

    if (!tutor.isDeleted) {
        throw new AppError(status.BAD_REQUEST, "Tutor is not deleted");
    }

    const result = await prisma.tutorProfile.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
        },
    });
    return result;
};

const getDeletedTutors = async () => {
    const result = await prisma.tutorProfile.findMany({
        where: { isDeleted: true },
        include: {
            user: true,
            category: true,
        },
    });
    return result;
};

const updateTutorStatus = async (id: string, payload: { status: UserStatus }) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { id },
        select: { userId: true }
    });

    if (!tutor) {
        throw new AppError(status.NOT_FOUND, "Tutor not found");
    }

    const result = await prisma.user.update({
        where: { id: tutor.userId },
        data: { status: payload.status },
    });

    return result;
};

export const tutorService = {
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
