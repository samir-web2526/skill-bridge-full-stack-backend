import { z } from 'zod';

const initializePaymentValidationSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, 'Booking ID is required').uuid(),
  }),
});

export const PaymentValidation = {
  initializePaymentValidationSchema,
};
