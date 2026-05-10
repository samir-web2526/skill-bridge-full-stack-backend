import status from "http-status";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

const getStudents = async (user: any) => {

    if (user.role === "ADMIN") {
        return await prisma.studentProfile.findMany({
            where: {
                isDeleted: false,
            },
            include: {
                user: true,
            },
        });
    }

    if (user.role === "TUTOR") {

        const tutor = await prisma.tutorProfile.findUnique({
            where: {
                userId: user.id,
            },
        });

        if (!tutor) {
            throw new AppError(status.NOT_FOUND, "Tutor not found");
        }

        return await prisma.studentProfile.findMany({
            where: {
                isDeleted: false,
                user: {
                    booking: {
                        some: {
                            tutorId: tutor.id,
                        },
                    },
                },
            },
            include: {
                user: true,
            },
        });
    }

    throw new AppError(status.FORBIDDEN, "Unauthorized access");
};
const getMyProfile = async (user: any) => {

    if (!user || !user.id) {
        throw new Error("Unauthorized user");
    }
    const result = await prisma.studentProfile.findUnique({
        where: { userId: user.id, isDeleted: false },
        include: {
            user: true,
        },
    });

    if (!result) {
        throw new AppError(status.NOT_FOUND, "Student profile not found");
    }

    return result;
};

const updateMyProfile = async (user: any, payload: any) => {
    if (!user?.id) {
        throw new Error("Unauthorized user");
    }

    const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: {
                id: user.id,
            },
            data: {
                name: payload.name,
                phone: payload.phone,
                image: payload.image,
            },
        });

        const updatedStudent = await tx.studentProfile.update({
            where: {
                userId: user.id,
            },
            data: {
                gender: payload.gender,
                dateOfBirth: payload.dateOfBirth,
                address: payload.address,
                class: payload.class,
                group: payload.group,
            },
        });

        return {
            user: updatedUser,
            student: updatedStudent,
        };
    });

    return result;
};

export const StudentService = {
    getStudents,
    getMyProfile,
    updateMyProfile
};