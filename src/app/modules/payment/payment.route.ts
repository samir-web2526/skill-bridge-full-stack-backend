import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { validateRequest } from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { checkAuth } from '../../middlewares/checkAuth';

const router = Router();

router.post(
  '/init',
  checkAuth('STUDENT'),
  validateRequest(PaymentValidation.initializePaymentValidationSchema),
  PaymentController.initializePayment
);

router.get(
  '/',
  checkAuth('ADMIN'),
  PaymentController.getAllPayments
);

router.get(
  '/:bookingId',
  checkAuth('STUDENT', 'TUTOR', 'ADMIN'),
  PaymentController.getPaymentByBookingId
);

export const paymentRoutes = router;
