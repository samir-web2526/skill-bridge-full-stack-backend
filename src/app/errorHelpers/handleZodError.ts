import status from "http-status";
import { ZodError } from "zod";
import { TErrorSources } from "../interfaces/error.interface";

export const handleZodError = (err: ZodError) => {
  const statusCode = status.BAD_REQUEST;
  const errorSources: TErrorSources[] = err.issues.map((issue) => ({
    path: issue.path.join("--->"),
    message: issue.message,
  }));

  return {
    success: false,
    statusCode,
    message: "Zod Validation Error",
    errorSources,
  };
};
