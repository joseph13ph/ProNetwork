import { Op } from "sequelize";
import { Connection } from "../models/index.js";

const pairKey = (a, b) => {
  const first = Number(a);
  const second = Number(b);
  return first < second ? `${first}:${second}` : `${second}:${first}`;
};

export const createConnectionRequest = async ({ fromUserId, toUserId }) => {
  if (Number(fromUserId) === Number(toUserId)) {
    return { ok: false, reason: "SELF_REQUEST" };
  }

  const existing = await Connection.findOne({
    where: {
      pairKey: pairKey(fromUserId, toUserId),
      status: { [Op.in]: ["pending", "accepted"] }
    }
  });

  if (existing) {
    return {
      ok: false,
      reason: existing.status === "accepted" ? "ALREADY_CONNECTED" : "ALREADY_PENDING",
      request: existing
    };
  }

  const request = await Connection.create({
    fromUserId: Number(fromUserId),
    toUserId: Number(toUserId),
    pairKey: pairKey(fromUserId, toUserId),
    status: "pending"
  });

  return { ok: true, request };
};

export const respondConnectionRequest = async ({ requestId, userId, action }) => {
  const request = await Connection.findByPk(Number(requestId));
  if (!request) return { ok: false, reason: "NOT_FOUND" };
  if (Number(request.toUserId) !== Number(userId)) return { ok: false, reason: "FORBIDDEN" };
  if (request.status !== "pending") return { ok: false, reason: "ALREADY_RESOLVED", request };

  request.status = action === "accept" ? "accepted" : "rejected";
  await request.save();

  return { ok: true, request };
};

export const listConnectionsForUser = async (userId) => {
  const id = Number(userId);
  const requests = await Connection.findAll({
    where: {
      [Op.or]: [{ fromUserId: id }, { toUserId: id }],
      status: { [Op.in]: ["pending", "accepted"] }
    },
    order: [["createdAt", "DESC"]]
  });

  const sent = [];
  const received = [];
  const accepted = [];

  requests.forEach((request) => {
    const isSender = Number(request.fromUserId) === id;
    if (request.status === "pending" && isSender) sent.push(request);
    if (request.status === "pending" && !isSender) received.push(request);
    if (request.status === "accepted") accepted.push(request);
  });

  return { sent, received, accepted };
};
