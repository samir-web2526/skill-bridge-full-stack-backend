import { Router } from "express";
import { bookingController } from "./booking.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();
router.post("/", checkAuth("STUDENT"), bookingController.createBooking);
router.get(
  "/",
  checkAuth("STUDENT", "TUTOR", "ADMIN"),
  bookingController.getBooking,
);
router.get(
  "/:bookingId",
  checkAuth("STUDENT", "TUTOR", "ADMIN"),
  bookingController.getBookingById,
);
router.patch(
  "/:bookingId/cancel",
  checkAuth("STUDENT"),
  bookingController.cancelBooking,
);
router.patch(
  "/:bookingId/status",
  checkAuth("TUTOR"),
  bookingController.updateBooking,
);

export const bookingRouter = router;
