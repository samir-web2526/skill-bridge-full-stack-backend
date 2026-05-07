import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { IReviewPayload, IReviewUpdatePayload } from "./review.interface";
import { BookingStatus } from "../../../generated/enums";

const createReview = async (payload: IReviewPayload, userId: string) => {
  const { bookingId, rating, comment, tutorId } = payload;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "Only the student who booked can review"
    );
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review completed sessions"
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { bookingId },
  });

  if (existingReview) {
    throw new AppError(400, "You already reviewed this booking");
  }

  const result = await prisma.review.create({
    data: {
      rating,
      comment: comment || null,
      tutorId: booking.tutorId,
      userId,
      bookingId,
    },
  });

  const tutorReviews = await prisma.review.findMany({
    where: { tutorId },
  });

  const averageRating =
    tutorReviews.reduce((sum, r) => sum + r.rating, 0) /
    tutorReviews.length;

  await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: { averageRating },
  });

  return result;
};

const getReviews = async (paginationOptions: any) => {
  const { page = 1, limit = 10, skip = 0, sortBy, sortOrder } = paginationOptions;

  const result = await prisma.review.findMany({
    skip,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    include: {
      user: true,
      tutor: true,
    },
  });

  const total = await prisma.review.count();

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit || 1),
    },
    data: result,
  };
};

const getReviewByTutorId = async (tutorId: string, paginationOptions: any) => {
  const { page = 1, limit = 10, skip = 0, sortBy, sortOrder } = paginationOptions;
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: { id: true },
  });

  if (!tutor) {
    throw new AppError(status.NOT_FOUND, "Tutor profile not found");
  }

  const result = await prisma.review.findMany({
    skip,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    where: { tutorId: tutor.id },
    include: {
      user: true,
      tutor: true,
    },
  });
  const total = await prisma.review.count();

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit || 1),
    },
    data: result,
  };
};

const getMyGivenReview = async (userId: string, paginationOptions: any) => {
  const { page = 1, limit = 10, skip = 0, sortBy, sortOrder } = paginationOptions;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User profile not found");
  }
  const result = await prisma.review.findMany({
    skip,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    where: { userId: user.id },
    include: {
      tutor: {
        include: {
          user: true
        }
      },
      user: true,
    },
  });
  return result;
};

const getMyReceivedReview = async (userId: string, paginationOptions: any) => {
  const { page = 1, limit = 10, skip = 0, sortBy, sortOrder } = paginationOptions;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User profile not found");
  }
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!tutor) {
    throw new AppError(status.NOT_FOUND, "Tutor profile not found");
  }

  const result = await prisma.review.findMany({
    skip,
    take: limit,
    orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
    where: { tutorId: tutor.id },
    include: {
      user: true,
      tutor: {
        include: {
          user: true
        }
      }
    },
  });
  return result;
};

const getReviewById = async (id: string) => {
  const result = await prisma.review.findUnique({
    where: { id },
    include: {
      user: true,
      tutor: true,
    },
  });
  if (!result) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }
  return result;
};

const updateReview = async (
  id: string,
  payload: IReviewUpdatePayload,
  userId: string
) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You are not allowed to delete this review");
  }

  const updated = await prisma.review.update({
    where: { id },
    data: payload,
  });

  const tutorReviews = await prisma.review.findMany({
    where: { tutorId: review.tutorId },
  });

  const avg =
    tutorReviews.reduce((sum, r) => sum + r.rating, 0) /
    tutorReviews.length;

  await prisma.tutorProfile.update({
    where: { id: review.tutorId },
    data: { averageRating: avg },
  });

  return updated;
};

const deleteReview = async (id: string, userId: string, role: string) => {
  const review = await prisma.review.findUnique({
    where: { id },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (role !== "ADMIN" && review.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "You are not allowed to delete this review");
  }

  const result = await prisma.review.delete({
    where: { id },
  });
  return result;
};

export const reviewService = {
  createReview,
  getReviews,
  getReviewByTutorId,
  getMyGivenReview,
  getMyReceivedReview,
  getReviewById,
  updateReview,
  deleteReview,
};
