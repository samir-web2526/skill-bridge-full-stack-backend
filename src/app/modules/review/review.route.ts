import { Router } from "express";
import { reviewController } from "./review.controller";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.post("/", checkAuth("STUDENT"), reviewController.createReview);
router.get("/", reviewController.getAllReviews);
router.get(
  "/my-given-reviews",
  checkAuth("STUDENT"),
  reviewController.getMyGivenReview
);

router.get(
  "/my-received-reviews",
  checkAuth("TUTOR"),
  reviewController.getMyReceivedReview
);
router.get("/tutor/:tutorId", reviewController.getReviewByTutorId);
router.get("/:id", reviewController.getReviewById);
router.patch("/:id", checkAuth("STUDENT"), reviewController.updateReview);
router.delete("/:id", checkAuth("STUDENT", "ADMIN"), reviewController.deleteReview);

export const reviewRouter = router;
