import crypto from "crypto";
import { User } from "../models/index.js";

const passwordResetRequests = new Map();
const passwordResetTokens = new Map();

const premiumPayments = new Map();

const randomDelay = (minMs, maxMs) => Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

export const createPasswordResetRequest = ({ email, userId }) => {
  const requestId = crypto.randomUUID();
  const token = crypto.randomBytes(24).toString("hex");
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + 15 * 60 * 1000);

  const record = {
    requestId,
    email,
    userId,
    token,
    status: "queued",
    createdAt,
    deliveredAt: null,
    expiresAt,
    consumedAt: null
  };

  passwordResetRequests.set(requestId, record);
  passwordResetTokens.set(token, requestId);

  setTimeout(() => {
    const current = passwordResetRequests.get(requestId);
    if (!current || current.status !== "queued") return;
    current.status = "sent";
    current.deliveredAt = new Date();
    passwordResetRequests.set(requestId, current);
  }, randomDelay(900, 2800));

  return {
    requestId,
    token,
    expiresAt,
    status: "queued"
  };
};

export const getPasswordResetStatus = (requestId) => {
  const item = passwordResetRequests.get(requestId);
  if (!item) return null;

  return {
    requestId: item.requestId,
    email: item.email,
    status: item.status,
    createdAt: item.createdAt,
    deliveredAt: item.deliveredAt,
    expiresAt: item.expiresAt,
    consumedAt: item.consumedAt
  };
};

export const consumePasswordResetToken = ({ token }) => {
  const requestId = passwordResetTokens.get(token);
  if (!requestId) {
    return { ok: false, reason: "TOKEN_INVALID" };
  }

  const item = passwordResetRequests.get(requestId);
  if (!item) {
    return { ok: false, reason: "TOKEN_INVALID" };
  }

  const now = Date.now();
  if (item.expiresAt.getTime() <= now) {
    item.status = "expired";
    passwordResetRequests.set(requestId, item);
    passwordResetTokens.delete(token);
    return { ok: false, reason: "TOKEN_EXPIRED" };
  }

  if (item.status === "consumed") {
    return { ok: false, reason: "TOKEN_USED" };
  }

  item.status = "consumed";
  item.consumedAt = new Date();
  passwordResetRequests.set(requestId, item);
  passwordResetTokens.delete(token);

  return {
    ok: true,
    requestId,
    userId: item.userId,
    email: item.email
  };
};

export const createPremiumPayment = ({ userId, plan = "premium_monthly" }) => {
  const paymentId = `pay_${crypto.randomBytes(6).toString("hex")}`;
  const createdAt = new Date();

  const payment = {
    paymentId,
    userId,
    plan,
    status: "processing",
    amount: plan === "premium_yearly" ? 59.99 : 9.99,
    currency: "USD",
    transactionId: null,
    createdAt,
    processedAt: null
  };

  premiumPayments.set(paymentId, payment);

  setTimeout(async () => {
    const current = premiumPayments.get(paymentId);
    if (!current || current.status !== "processing") return;
    current.status = "succeeded";
    current.transactionId = `txn_${crypto.randomBytes(8).toString("hex")}`;
    current.processedAt = new Date();
    premiumPayments.set(paymentId, current);

    try {
      await User.update({ es_premium: true }, { where: { id_usuario: userId } });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error al activar premium", error);
    }
  }, randomDelay(1400, 4200));

  return payment;
};

export const getPremiumPaymentStatus = ({ paymentId, userId }) => {
  const payment = premiumPayments.get(paymentId);
  if (!payment) return null;
  if (Number(payment.userId) !== Number(userId)) return null;
  return payment;
};

export const isPremiumUser = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ["es_premium"] });
  return Boolean(user?.es_premium);
};
