import crypto from "crypto";

const passwordResetRequests = new Map();
const passwordResetTokens = new Map();

const premiumPayments = new Map();
const premiumUsers = new Set();

const connectionRequests = new Map();
let connectionRequestSeq = 1;

const randomDelay = (minMs, maxMs) => Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
const pairKey = (a, b) => {
  const first = Number(a);
  const second = Number(b);
  return first < second ? `${first}:${second}` : `${second}:${first}`;
};

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

  setTimeout(() => {
    const current = premiumPayments.get(paymentId);
    if (!current || current.status !== "processing") return;
    current.status = "succeeded";
    current.transactionId = `txn_${crypto.randomBytes(8).toString("hex")}`;
    current.processedAt = new Date();
    premiumPayments.set(paymentId, current);
    premiumUsers.add(String(userId));
  }, randomDelay(1400, 4200));

  return payment;
};

export const getPremiumPaymentStatus = ({ paymentId, userId }) => {
  const payment = premiumPayments.get(paymentId);
  if (!payment) return null;
  if (Number(payment.userId) !== Number(userId)) return null;
  return payment;
};

export const isPremiumUser = (userId) => premiumUsers.has(String(userId));

export const createConnectionRequest = ({ fromUserId, toUserId }) => {
  if (Number(fromUserId) === Number(toUserId)) {
    return { ok: false, reason: "SELF_REQUEST" };
  }

  for (const item of connectionRequests.values()) {
    const sameDirection = Number(item.fromUserId) === Number(fromUserId) && Number(item.toUserId) === Number(toUserId);
    const oppositeDirection = Number(item.fromUserId) === Number(toUserId) && Number(item.toUserId) === Number(fromUserId);

    if ((sameDirection || oppositeDirection) && item.status === "pending") {
      return { ok: false, reason: "ALREADY_PENDING", request: item };
    }

    if ((sameDirection || oppositeDirection) && item.status === "accepted") {
      return { ok: false, reason: "ALREADY_CONNECTED", request: item };
    }
  }

  const request = {
    id: connectionRequestSeq++,
    fromUserId: Number(fromUserId),
    toUserId: Number(toUserId),
    pairKey: pairKey(fromUserId, toUserId),
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  connectionRequests.set(request.id, request);
  return { ok: true, request };
};

export const respondConnectionRequest = ({ requestId, userId, action }) => {
  const request = connectionRequests.get(Number(requestId));
  if (!request) return { ok: false, reason: "NOT_FOUND" };
  if (Number(request.toUserId) !== Number(userId)) return { ok: false, reason: "FORBIDDEN" };
  if (request.status !== "pending") return { ok: false, reason: "ALREADY_RESOLVED", request };

  request.status = action === "accept" ? "accepted" : "rejected";
  request.updatedAt = new Date();
  connectionRequests.set(request.id, request);
  return { ok: true, request };
};

export const listConnectionsForUser = (userId) => {
  const id = Number(userId);
  const sent = [];
  const received = [];
  const accepted = [];

  for (const request of connectionRequests.values()) {
    if (request.status === "pending" && request.fromUserId === id) sent.push(request);
    if (request.status === "pending" && request.toUserId === id) received.push(request);
    if (request.status === "accepted" && (request.fromUserId === id || request.toUserId === id)) accepted.push(request);
  }

  return { sent, received, accepted };
};
