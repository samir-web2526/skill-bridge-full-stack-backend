import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { catchAsync, sendResponse } from '../../sharedfile';

const initializePayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { bookingId } = req.body;

  const result = await PaymentService.initializePayment(bookingId, user?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment initialized successfully. Redirect to checkout URL.',
    data: result,
  });
});

const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const rawBody = req.body;

  console.log("Is Buffer:", Buffer.isBuffer(rawBody));
  console.log("Sig:", sig);

  try {
    const result = await PaymentService.handleStripeWebhook(rawBody, sig);
    res.json(result);
  } catch (err: any) {
    console.error("Error:", err.message);
    res.status(400).json({ error: err.message });
  }
};

const getPaymentByBookingId = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { bookingId } = req.params;

  const result = await PaymentService.getPaymentByBookingId(bookingId as string, user?.id as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Payment details fetched successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getAllPayments(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All payments fetched successfully',
    data: result.data,
  });
});

export const PaymentController = {
  initializePayment,
  handleStripeWebhook,
  getPaymentByBookingId,
  getAllPayments,
};
