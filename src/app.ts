import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { IndexRoutes } from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { PaymentController } from "./app/modules/payment/payment.controller";


const app: Application = express();

app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.post(
  "/api/v1/payments/webhook/stripe",
  express.raw({ type: "*/*" }),
  PaymentController.handleStripeWebhook
);

app.use(express.json());

app.use("/api/v1", IndexRoutes);

app.get("/", (req, res) => {
  res.status(201).json({ success: true, message: "API is working" });
});

app.use(notFound);
app.use(globalErrorHandler);

export default app;