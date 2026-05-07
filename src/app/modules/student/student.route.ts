import express from 'express';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../../../generated/enums';
import { StudentController } from './student.controller';

const router = express.Router();


router.get(
    "/",
    checkAuth(Role.ADMIN, Role.TUTOR),
    StudentController.getStudents
);

router.get("/profile", checkAuth(Role.STUDENT), StudentController.getMyProfile);
router.patch("/profile", checkAuth(Role.STUDENT), StudentController.updateMyProfile);

export const studentRouter = router;
