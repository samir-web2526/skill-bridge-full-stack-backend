import { Router } from "express";
import { tutorController } from "./tutor.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { TutorValidation } from "./tutor.validation";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router();

router.get("/", tutorController.getTutors);
router.get("/stats", tutorController.getStats);

router.get("/profile", checkAuth("TUTOR"), tutorController.getMyProfile);

router.get(
    "/deleted",
    checkAuth("ADMIN"),
    tutorController.getDeletedTutors
);

router.patch(
    "/restore/:id",
    checkAuth("ADMIN"),
    tutorController.restoreTutor
);

router.patch(
    "/update-status/:id",
    checkAuth("ADMIN"),
    validateRequest(TutorValidation.updateTutorStatus),
    tutorController.updateTutorStatus
);

router.delete(
    "/:id",
    checkAuth("ADMIN"),
    tutorController.deleteTutor
);

router.patch(
    "/:id",
    checkAuth("TUTOR"),
    tutorController.updateTutor
);

router.get("/:id", tutorController.getTutorById);

export const tutorRouter = router;