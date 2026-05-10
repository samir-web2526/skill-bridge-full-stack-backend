import express, { Application } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { IndexRoutes } from "./app/routes";
import { notFound } from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { PaymentController } from "./app/modules/payment/payment.controller";


const app: Application = express();

// Middleware
app.use(cookieParser());
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL,
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// ⚠️ Stripe Webhook — MUST be before express.json() to receive raw body
// app.post(
//   "/api/v1/payments/webhook/stripe",
//   express.raw({ type: "application/json" }),
//   PaymentController.handleStripeWebhook
// );
// app.post(
//   "/api/v1/payments/webhook/stripe",
//   express.raw({ type: "application/json" }),
//   PaymentController.handleStripeWebhook
// );

app.post(
  "/api/v1/payments/webhook/stripe",
  (req, res, next) => {
    let data = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      (req as any).rawBody = Buffer.from(data);
      next();
    });
  },
  PaymentController.handleStripeWebhook
);

app.use(express.json());

// Routes
app.use("/api/v1", IndexRoutes);

// Basic health check
app.get("/", (req, res) => {
  res.status(201).json({ success: true, message: "API is working" });
});

// Global Error & NotFound handlers
app.use(notFound);
app.use(globalErrorHandler);

export default app;