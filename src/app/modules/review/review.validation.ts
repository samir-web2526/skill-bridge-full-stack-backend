import { z } from 'zod';

const createReview = z.object({
    body: z.object({
        rating: z.number({
            message: 'Rating is required',
        }).min(1).max(5),
        comment: z.string().optional(),
        bookingId: z.string({
            message: 'Booking id is required',
        }),
    }),
});

const updateReview = z.object({
    body: z.object({
        rating: z.number().min(1).max(5).optional(),
        comment: z.string().optional(),
    }),
});

export const ReviewValidation = {
    createReview,
    updateReview,
};
