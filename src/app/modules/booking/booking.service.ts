import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { IBookingPayload } from "./booking.interface";
import { BookingStatus, Role } from "../../../generated/enums";

const createBooking = async (payload: IBookingPayload, userId: string) => {
  const { tutorId, date, startTime, endTime } = payload;

  console.log("BOOKING PAYLOAD:", payload);

  // 1. convert to date (normalize)
  const bookingDate = new Date(date);
  bookingDate.setHours(0, 0, 0, 0);

  const startDateTime = new Date(`${date}T${startTime}:00`);
  const endDateTime = new Date(`${date}T${endTime}:00`);

  // 2. basic validation
  if (!tutorId || !date || !startTime || !endTime) {
    throw new AppError(400, "Missing required booking fields");
  }

  if (startDateTime >= endDateTime) {
    throw new AppError(400, "Invalid time range");
  }

  const startHour = startDateTime.getHours();
  const endHour = endDateTime.getHours();

  if (startHour < 6 || endHour > 23) {
    throw new AppError(400, "Booking allowed between 6 AM - 11 PM");
  }


  // 4. OPTIONAL (BEST PRACTICE) → check tutor working hours
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: {
       userId: true,
      availableFrom: true,
      availableTo: true,
    },
  });

  if (!tutor) {
  throw new AppError(404, "Tutor not found");
}

if (!tutor.userId) {
  throw new AppError(404, "Tutor userId not found");
}
  if (!tutor.availableFrom || !tutor.availableTo) {
  throw new AppError(400, "Tutor working hours not set");
}


  const tutorUser = await prisma.user.findUnique({
  where: { id: tutor?.userId },
  select: {
    status: true,
  },
});

if (!tutorUser) {
  throw new AppError(404, "Tutor user not found");
}

if (tutorUser.status === "PENDING") {
  throw new AppError(
    400,
    "Tutor is not approved yet"
  );
}

  const tutorStart = new Date(`${date}T${tutor.availableFrom}:00`);
  const tutorEnd = new Date(`${date}T${tutor.availableTo}:00`);

  if (tutorStart >= tutorEnd) {
  throw new AppError(400, "Invalid tutor working hours configuration");
}

  if (startDateTime < tutorStart || endDateTime > tutorEnd) {
    throw new AppError(
      400,
      "Time is outside tutor working hours"
    );
  }
  

  // 5. conflict check (IMPORTANT FIXED)
  const conflict = await prisma.booking.findFirst({
    where: {
      tutorId,
      isDeleted: false,
      date: {
        gte: bookingDate,
        lt: new Date(bookingDate.getTime() + 86400000),
      },
      AND: [
        { startTime: { lt: endDateTime } },
        { endTime: { gt: startDateTime } },
      ],
    },
  });

  if (conflict) {
    throw new AppError(409, "Time slot already booked");
  }

  // 6. create booking
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
        include:{
          user:true
        }
      },
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
        },
      },
    },
  });

  if (!result) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  // Permission check
  if (role === Role.STUDENT && result.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Unauthorized access");
  }

  if (role === Role.TUTOR && result.tutor.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Unauthorized access");
  }

  // ADMIN can see all bookings

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
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
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

  if (booking.status !== BookingStatus.PENDING) {
    throw new AppError(
      status.BAD_REQUEST,
      "Only pending bookings can be cancelled"
    );
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
    },
  });

  return result;
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
