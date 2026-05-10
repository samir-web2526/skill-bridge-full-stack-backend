import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";
import { prisma } from "../../lib/prisma";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { UserStatus } from "../../generated/enums";

export const checkAuth =
  (...authRoles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
          throw new AppError(status.UNAUTHORIZED, "Unauthorized! No token provided.");
        }

        const verifyResponse = jwtUtils.verifyToken(
          token,
          envVars.ACCESS_TOKEN_SECRET
        );

        if (!verifyResponse.success) {
          throw new AppError(status.UNAUTHORIZED, "Invalid or expired token.");
        }

        const { id, name, email, role } = verifyResponse.data!;

        const user = await prisma.user.findUnique({
          where: { id, isDeleted: false },
        });

        if (!user) {
          throw new AppError(status.NOT_FOUND, "User not found.");
        }

        if (user.status === UserStatus.BANNED) {
          throw new AppError(status.FORBIDDEN, "User is blocked.");
        }

        if (authRoles.length && !authRoles.includes(role)) {
          throw new AppError(status.FORBIDDEN, "Forbidden! You don't have permission.");
        }

        req.user = { id, name, email, role };

        next();
      } catch (error: any) {
        next(error);
      }
    };
