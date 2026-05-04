import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../data/db.json");

const initialState = {
  users: [],
  usageEvents: [],
  orders: [],
  payments: [],
  webhookEvents: [],
};

async function read() {
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return { ...initialState, ...JSON.parse(raw) };
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    await write(initialState);
    return structuredClone(initialState);
  }
}

async function write(data) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, `${JSON.stringify(data, null, 2)}\n`);
}

async function mutate(updater) {
  const data = await read();
  const result = await updater(data);
  await write(data);
  return result;
}

export const db = {
  async createUser(user) {
    return mutate((data) => {
      const now = new Date().toISOString();
      const created = {
        id: randomUUID(),
        plan: "free",
        subscriptionStatus: "inactive",
        createdAt: now,
        updatedAt: now,
        ...user,
      };
      data.users.push(created);
      return created;
    });
  },

  async findUserByEmail(email) {
    const data = await read();
    return data.users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    const data = await read();
    return data.users.find((user) => user.id === id) || null;
  },

  async updateUser(id, patch) {
    return mutate((data) => {
      const user = data.users.find((candidate) => candidate.id === id);
      if (!user) return null;
      Object.assign(user, patch, { updatedAt: new Date().toISOString() });
      return user;
    });
  },

  async createUsageEvent(event) {
    return mutate((data) => {
      const created = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...event,
      };
      data.usageEvents.push(created);
      return created;
    });
  },

  async getUsageEvents(userId) {
    const data = await read();
    return data.usageEvents.filter((event) => event.userId === userId);
  },

  async createOrder(order) {
    return mutate((data) => {
      const created = {
        id: randomUUID(),
        status: "created",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...order,
      };
      data.orders.push(created);
      return created;
    });
  },

  async findOrderByRazorpayOrderId(razorpayOrderId) {
    const data = await read();
    return data.orders.find((order) => order.razorpayOrderId === razorpayOrderId) || null;
  },

  async updateOrder(id, patch) {
    return mutate((data) => {
      const order = data.orders.find((candidate) => candidate.id === id);
      if (!order) return null;
      Object.assign(order, patch, { updatedAt: new Date().toISOString() });
      return order;
    });
  },

  async createPayment(payment) {
    return mutate((data) => {
      const existing = data.payments.find(
        (candidate) => candidate.razorpayPaymentId === payment.razorpayPaymentId,
      );
      if (existing) return existing;

      const created = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...payment,
      };
      data.payments.push(created);
      return created;
    });
  },

  async hasWebhookEvent(eventId) {
    if (!eventId) return false;
    const data = await read();
    return data.webhookEvents.some((event) => event.eventId === eventId);
  },

  async createWebhookEvent(event) {
    return mutate((data) => {
      const created = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        ...event,
      };
      data.webhookEvents.push(created);
      return created;
    });
  },
};
