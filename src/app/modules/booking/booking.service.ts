import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { IBookingPayload } from "./booking.interface";
import { BookingStatus, Role } from "../../../generated/enums";

const createBooking = async (payload: IBookingPayload, userId: string) => {
  const { tutorId, date, startTime, endTime } = payload;

  if (!tutorId || !date || !startTime || !endTime) {
    throw new AppError(400, "Missing required booking fields");
  }

  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);

  if (startDateTime >= endDateTime) {
    throw new AppError(400, "Invalid time range");
  }

  const startHour = startDateTime.getHours();
  const endHour = endDateTime.getHours();

  if (startHour < 6 || endHour > 23) {
    throw new AppError(400, "Booking allowed between 6 AM - 11 PM");
  }

  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: {
      userId: true,
      availableFrom: true,
      availableTo: true,
    },
  });

  if (!tutor) throw new AppError(404, "Tutor not found");

  if (!tutor.availableFrom || !tutor.availableTo) {
    throw new AppError(400, "Tutor working hours not set");
  }

  const tutorUser = await prisma.user.findUnique({
    where: { id: tutor.userId },
    select: { status: true },
  });

  if (!tutorUser) throw new AppError(404, "Tutor user not found");

  if (tutorUser.status !== "ACTIVE") {
    throw new AppError(400, "Tutor is not active");
  }

  const tutorStart = new Date(`${date}T${tutor.availableFrom}`);
  const tutorEnd = new Date(`${date}T${tutor.availableTo}`);

  if (startDateTime < tutorStart || endDateTime > tutorEnd) {
    throw new AppError(400, "Time is outside tutor working hours");
  }

  const studentSameDateBooking = await prisma.booking.findFirst({
    where: {
      userId,
      date: bookingDate,
      status: {
        in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      },
      isDeleted: false,
    },
  });

  if (studentSameDateBooking) {
    throw new AppError(
      400,
      "You already have a booking on this date. Please complete or cancel it first."
    );
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      AND: [
        {
          tutorId,
          isDeleted: false,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
        { startTime: { lt: endDateTime } },
        { endTime: { gt: startDateTime } },
      ],
    },
  });

  if (conflict) {
    throw new AppError(409, "Time slot already booked");
  }

  return prisma.booking.create({
    data: {
      tutorId,
      userId,
      date: bookingDate,
      startTime: startDateTime,
      endTime: endDateTime,
      status: BookingStatus.PENDING,
    },
  });
};
const getBooking = async (paginationOptions: any, userId: string, role: Role) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationOptions;

  let whereCondition: any = {
    isDeleted: false,
  };

  if (role === Role.STUDENT) {
    whereCondition.userId = userId;
  } else if (role === Role.TUTOR) {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!tutor) {
      throw new AppError(404, "Tutor profile not found");
    }

    whereCondition.tutorId = tutor.id;
  } else if (role === Role.ADMIN) {
    whereCondition = {
      isDeleted: false,
    };
  }

  const result = await prisma.booking.findMany({
    where: whereCondition,
    include: {
      user: true,
      tutor: {
        include: {
          user: true,
          category: true,
        }
      },
      payment: true,
      review: true,
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.booking.count({
    where: whereCondition,
  });

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getBookingById = async (userId: string, bookingId: string, role: Role) => {
  const result = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      tutor: {
        include: {
          user: true,
          category: true,
        }
      },
      payment: true,
      review: true,
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (role === Role.STUDENT && result.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Unauthorized access");
  }

  if (role === Role.TUTOR && result.tutor.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Unauthorized access");
  }

  return result;
};

const updateBooking = async (payload: any, userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tutor: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.tutor.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Only the assigned tutor can update this booking");
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: payload,
  });

  return result;
};

const cancelBooking = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      isDeleted: false,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "Only the user who booked can cancel it"
    );
  }

  if (booking.status !== "PENDING") {
    throw new AppError(
      status.BAD_REQUEST,
      `Cannot cancel booking in ${booking.status} state`
    );
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
    },
  });
};

const deletePendingBooking = async (bookingId: string) => {
  await prisma.booking.delete({
    where: { id: bookingId },
  });
};

export const bookingService = {
  createBooking,
  getBooking,
  getBookingById,
  updateBooking,
  cancelBooking,
  deletePendingBooking,
};
