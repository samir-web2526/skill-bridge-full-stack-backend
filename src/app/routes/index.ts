import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route";
import { bookingRouter } from "../modules/booking/booking.route";
import { categoryRouter } from "../modules/category/category.route";
import { tutorRouter } from "../modules/tutor/tutor.route";
import { reviewRouter } from "../modules/review/review.route";
import { paymentRoutes } from "../modules/payment/payment.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/bookings",
    route: bookingRouter,
  },
  {
    path: "/categories",
    route: categoryRouter,
  },
  {
    path: "/tutors",
    route: tutorRouter,
  },
  {
    path: "/reviews",
    route: reviewRouter,
  },
  {
    path: "/payments",
    route: paymentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const IndexRoutes = router;
