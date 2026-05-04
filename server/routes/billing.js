import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/errors.js";
import { db } from "../services/db.js";
import {
  createRazorpayOrder,
  getPlan,
  listPlans,
  verifyPaymentSignature,
  verifyWebhookSignature,
} from "../services/razorpay.js";

export const billingRouter = Router();

const createOrderSchema = z.object({
  planId: z.enum(["premium_monthly", "premium_yearly"]),
});

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

billingRouter.get("/plans", (_req, res) => {
  res.json({
    plans: listPlans().map((plan) => ({
      id: plan.id,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      role: plan.role,
      billingInterval: plan.billingInterval,
    })),
  });
});

billingRouter.post("/orders", requireAuth, async (req, res, next) => {
  try {
    const { planId } = createOrderSchema.parse(req.body);
    const plan = getPlan(planId);

    if (!plan) {
      throw new HttpError(400, "Unknown plan.");
    }

    const localOrder = await db.createOrder({
      userId: req.user.id,
      planId,
      amount: plan.amount,
      currency: plan.currency,
      role: plan.role,
      billingInterval: plan.billingInterval,
    });
    const razorpayOrder = await createRazorpayOrder({
      plan,
      user: req.user,
      receipt: localOrder.id,
    });

    await db.updateOrder(localOrder.id, {
      razorpayOrderId: razorpayOrder.id,
      status: razorpayOrder.status,
    });

    res.status(201).json({
      keyId: env.RAZORPAY_KEY_ID,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
      },
    });
  } catch (err) {
    next(formatZodError(err));
  }
});

billingRouter.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const input = verifyPaymentSchema.parse(req.body);
    const valid = verifyPaymentSignature({
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
    });

    if (!valid) {
      throw new HttpError(400, "Invalid Razorpay payment signature.");
    }

    const order = await db.findOrderByRazorpayOrderId(input.razorpay_order_id);
    if (!order || order.userId !== req.user.id) {
      throw new HttpError(404, "Order not found.");
    }

    await db.updateOrder(order.id, { status: "paid" });
    await db.createPayment({
      userId: req.user.id,
      orderId: order.id,
      razorpayOrderId: input.razorpay_order_id,
      razorpayPaymentId: input.razorpay_payment_id,
      status: "verified",
    });
    const user = await db.updateUser(req.user.id, {
      plan: order.role || "premium",
      subscriptionStatus: "active",
      billingInterval: order.billingInterval,
      premiumActivatedAt: new Date().toISOString(),
    });

    res.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
      },
    });
  } catch (err) {
    next(formatZodError(err));
  }
});

billingRouter.post("/webhook", async (req, res, next) => {
  try {
    const signature = req.get("x-razorpay-signature");

    if (!verifyWebhookSignature(req.body, signature)) {
      throw new HttpError(400, "Invalid Razorpay webhook signature.");
    }

    const event = JSON.parse(req.body.toString("utf8"));

    if (await db.hasWebhookEvent(event.id)) {
      res.json({ ok: true, duplicate: true });
      return;
    }

    await db.createWebhookEvent({
      eventId: event.id,
      type: event.event,
      payload: event,
    });

    if (event.event === "order.paid") {
      const orderEntity = event.payload?.order?.entity;
      const paymentEntity = event.payload?.payment?.entity;
      const order = await db.findOrderByRazorpayOrderId(orderEntity?.id);

      if (order) {
        await db.updateOrder(order.id, { status: "paid" });
        await db.createPayment({
          userId: order.userId,
          orderId: order.id,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: paymentEntity?.id,
          status: paymentEntity?.status || "captured",
        });
        await db.updateUser(order.userId, {
          plan: order.role || "premium",
          subscriptionStatus: "active",
          billingInterval: order.billingInterval,
          premiumActivatedAt: new Date().toISOString(),
        });
      }
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

function formatZodError(err) {
  if (err instanceof z.ZodError) {
    return new HttpError(400, "Invalid request body.", err.flatten().fieldErrors);
  }

  return err;
}
