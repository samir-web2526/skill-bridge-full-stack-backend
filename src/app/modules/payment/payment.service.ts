// import Stripe from "stripe";
// import status from "http-status";
// import { prisma } from "../../../lib/prisma";
// import AppError from "../../errorHelpers/AppError";
// import { envVars } from "../../../config/env";
// import { paginationHelper } from "../../sharedfile";
// import { BookingStatus, PaymentMethod, PaymentStatus } from "../../../generated/enums";
// import stripe from "../../../lib/stripe";

// const initializePayment = async (bookingId: string, userId: string) => {
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: {
//       user: true,
//       tutor: {
//         include: { user: true },
//       },
//       payment: true,
//     },
//   });

//   if (!booking) throw new AppError(status.NOT_FOUND, "Booking not found.");

//   if (booking.userId !== userId) {
//     throw new AppError(status.FORBIDDEN, "Unauthorized");
//   }

//   if (booking.status !== BookingStatus.PENDING) {
//     throw new AppError(status.BAD_REQUEST, "Only pending bookings allowed");
//   }

//   if (!booking.user?.email) {
//     throw new AppError(status.BAD_REQUEST, "User email required");
//   }

//   if (
//     booking.payment &&
//     booking.payment.status === PaymentStatus.UNPAID &&
//     booking.payment.stripeSessionId
//   ) {
//     try {
//       const existingSession = await stripe.checkout.sessions.retrieve(
//         booking.payment.stripeSessionId
//       );

//       if (existingSession.status === "open" && existingSession.url) {
//         return {
//           checkoutUrl: existingSession.url,
//           sessionId: existingSession.id,
//         };
//       }
//     } catch { }

//     await prisma.payment.delete({
//       where: { id: booking.payment.id },
//     });
//   }

//   // 👉 price calculation
//   const duration =
//     (booking.endTime.getTime() - booking.startTime.getTime()) / 3600000;

//   const totalAmount = Number(
//     (Number(booking.tutor.hourlyRate) * duration).toFixed(2)
//   );

//   const session = await stripe.checkout.sessions.create({
//     mode: "payment",
//     success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${envVars.FRONTEND_URL}/payment/cancel?booking_id=${bookingId}`,
//     customer_email: booking.user.email,
//     metadata: {
//       bookingId: booking.id,
//     },
//     line_items: [
//       {
//         price_data: {
//           currency: "bdt",
//           product_data: {
//             name: `Tutoring with ${booking.tutor.user.name}`,
//           },
//           unit_amount: Math.round(totalAmount * 100),
//         },
//         quantity: 1,
//       },
//     ],
//   });

//   const transactionId =
//     typeof session.payment_intent === "string"
//       ? session.payment_intent
//       : session.payment_intent?.id ?? session.id;

//   await prisma.payment.create({
//     data: {
//       bookingId: booking.id,
//       userId: booking.userId,
//       transactionId,
//       stripeSessionId: session.id,
//       amount: totalAmount,
//       currency: "BDT",
//       status: PaymentStatus.UNPAID,
//     },
//   });

//   return {
//     checkoutUrl: session.url,
//     sessionId: session.id,
//   };
// };

// const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
//   let event: any;

//   try {
//     event = stripe.webhooks.constructEvent(
//       rawBody,
//       signature,
//       envVars.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err: any) {
//     throw new AppError(status.BAD_REQUEST, err.message);
//   }

//   switch (event.type) {
//     case "checkout.session.completed": {
//       const session = event.data.object;
//       const bookingId = session.metadata?.bookingId;

//       if (!bookingId) break;

//       await prisma.$transaction(async (tx) => {
//         await tx.payment.update({
//           where: { stripeSessionId: session.id },
//           data: {
//             status: PaymentStatus.PAID,
//             paidAt: new Date(),
//           },
//         });

//         // await tx.booking.update({
//         //   where: { id: bookingId },
//         //   data: { status: BookingStatus.CONFIRMED },
//         // });
//       });

//       console.log("✅ Payment success:", bookingId);
//       break;
//     }

//     default:
//       console.log("Unhandled:", event.type);
//   }

//   return { received: true };
// };

// const getPaymentByBookingId = async (bookingId: string, userId: string) => {
//   const payment = await prisma.payment.findUnique({
//     where: { bookingId },
//     include: {
//       booking: {
//         include: {
//           user: true,
//           tutor: {
//             include: {
//               user: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!payment) {
//     throw new AppError(status.NOT_FOUND, "Payment not found for this booking.");
//   }

//   if (payment.booking.userId !== userId) {
//     throw new AppError(status.FORBIDDEN, "You are not authorized to view this payment.");
//   }

//   return payment;
// };

// const getAllPayments = async (query: any) => {
//   const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(query);

//   const result = await prisma.payment.findMany({
//     skip,
//     take: limit,
//     orderBy: {
//       [sortBy || "createdAt"]: sortOrder || "desc",
//     },
//     include: {
//       booking: {
//         include: {
//           user: true,
//           tutor: {
//             include: {
//               user: true,
//             },
//           },
//         },
//       },
//     },
//   });

//   const total = await prisma.payment.count();

//   return {
//     data: result,
//     meta: {
//       page,
//       limit,
//       total,
//     },
//   };
// };

// export const PaymentService = {
//   initializePayment,
//   handleStripeWebhook,
//   getPaymentByBookingId,
//   getAllPayments,
// };

import status from "http-status";
import { prisma } from "../../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { envVars } from "../../../config/env";
import { paginationHelper } from "../../sharedfile";
import { BookingStatus, PaymentStatus } from "../../../generated/enums";
import stripe from "../../../lib/stripe";

const initializePayment = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      tutor: {
        include: { user: true },
      },
      payment: true,
    },
  });

  if (!booking) throw new AppError(status.NOT_FOUND, "Booking not found.");

  if (booking.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Unauthorized");
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new AppError(status.BAD_REQUEST, "Only pending bookings allowed");
  }

  if (!booking.user?.email) {
    throw new AppError(status.BAD_REQUEST, "User email required");
  }

  if (
    booking.payment &&
    booking.payment.status === PaymentStatus.UNPAID &&
    booking.payment.stripeSessionId
  ) {
    try {
      const existingSession = await stripe.checkout.sessions.retrieve(
        booking.payment.stripeSessionId
      );

      if (existingSession.status === "open" && existingSession.url) {
        return {
          checkoutUrl: existingSession.url,
          sessionId: existingSession.id,
        };
      }
    } catch { }

    await prisma.payment.delete({
      where: { id: booking.payment.id },
    });
  }

  const duration =
    (booking.endTime.getTime() - booking.startTime.getTime()) / 3600000;

  const totalAmount = Number(
    (Number(booking.tutor.hourlyRate) * duration).toFixed(2)
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${envVars.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${envVars.FRONTEND_URL}/payment/cancel?booking_id=${bookingId}`,
    customer_email: booking.user.email,
    metadata: {
      bookingId: booking.id,
    },
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Tutoring with ${booking.tutor.user.name}`,
          },
          unit_amount: Math.round(totalAmount * 100),
        },
        quantity: 1,
      },
    ],
  });

  const transactionId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? session.id;

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: booking.userId,
      transactionId,
      stripeSessionId: session.id,
      amount: totalAmount,
      currency: "BDT",
      status: PaymentStatus.UNPAID,
    },
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
  };
};

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      envVars.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    throw new AppError(status.BAD_REQUEST, err.message);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) break;

      // Idempotency check — Stripe can send same event multiple times
      const existing = await prisma.payment.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (existing?.status === PaymentStatus.PAID) {
        console.log("⚠️ Already processed:", session.id);
        break;
      }

      await prisma.payment.update({
        where: { stripeSessionId: session.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      console.log("✅ Payment success:", bookingId);
      break;
    }

    default:
      console.log("Unhandled:", event.type);
  }

  return { received: true };
};

const getPaymentByBookingId = async (bookingId: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          user: true,
          tutor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(status.NOT_FOUND, "Payment not found for this booking.");
  }

  if (payment.booking.userId !== userId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to view this payment."
    );
  }

  return payment;
};

const getAllPayments = async (query: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(query);

  const result = await prisma.payment.findMany({
    skip,
    take: limit,
    orderBy: {
      [sortBy || "createdAt"]: sortOrder || "desc",
    },
    include: {
      booking: {
        include: {
          user: true,
          tutor: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.payment.count();

  return {
    data: result,
    meta: {
      page,
      limit,
      total,
    },
  };
};

export const PaymentService = {
  initializePayment,
  handleStripeWebhook,
  getPaymentByBookingId,
  getAllPayments,
};
