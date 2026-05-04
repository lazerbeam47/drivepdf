import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env, hasRazorpayConfig } from "../config/env.js";
import { HttpError } from "../middleware/errors.js";

const plans = {
  premium_monthly: {
    id: "premium_monthly",
    name: "DrivePDF Premium Monthly",
    amount: 29900,
    currency: "INR",
    role: "premium",
    billingInterval: "monthly",
  },
  premium_yearly: {
    id: "premium_yearly",
    name: "DrivePDF Premium Yearly",
    amount: 249900,
    currency: "INR",
    role: "premium",
    billingInterval: "yearly",
  },
};

export function listPlans() {
  return Object.values(plans);
}

let razorpay;

export function getPlan(planId) {
  return plans[planId] || null;
}

export function getRazorpayClient() {
  if (!hasRazorpayConfig()) {
    throw new HttpError(503, "Razorpay is not configured.");
  }

  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpay;
}

export async function createRazorpayOrder({ plan, user, receipt }) {
  const client = getRazorpayClient();
  return client.orders.create({
    amount: plan.amount,
    currency: plan.currency,
    receipt,
    notes: {
      userId: user.id,
      email: user.email,
      planId: plan.id,
    },
  });
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new HttpError(503, "Razorpay webhook secret is not configured.");
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a, b) {
  if (!a || !b) return false;
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}
