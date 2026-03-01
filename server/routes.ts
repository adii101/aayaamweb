import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import crypto from "crypto";
import { z } from "zod";
import {
  connectDb,
  getUsersCollection,
  getEventsCollection,
  getRegistrationsCollection,
} from "./db";
import multer from "multer";
import path from "path";
import fs from "fs";

// make sure poster upload folder exists
const uploadDir = path.resolve(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// in-memory OTP store; each entry is removed or marked used/expired
interface OtpEntry {
  phone: string;
  codeHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}
const otpStore: OtpEntry[] = [];

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

const phoneSchema = z
  .string()
  .refine((val) => {
    const digits = String(val).replace(/\D/g, "");
    return /^\d{10}$/.test(digits) && digits.length === 10;
  }, {
    message: "Phone must be exactly 10 digits (no +91, spaces, or letters)",
  });

function normalizePhone(phone: string): string {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
    throw new Error("Phone must be exactly 10 digits (no +91, spaces, or letters)");
  }
  return digits;
}

function generateOtpCode() {
  const n = crypto.randomInt(0, 1_000_000);
  return String(n).padStart(6, "0");
}

function getOtpPepper() {
  return process.env.OTP_SECRET || "";
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

/** Normalize admin phone from env (e.g. 70007799744 → 7007799744 for 10-digit match). */
function getAdminPhoneNormalized(): string | null {
  const raw = process.env.ADMIN_PHONE?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11) return digits.slice(-10);
  return null;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.admin) return next();
  res.status(401).json({ message: "Admin login required." });
}

// Previously the project could send OTPs via email using nodemailer, but
// the current authentication flow is based on phone numbers and SMS/console
// delivery.  Keep the helper around commented in case we ever want to re‑add
// email support.
/*
async function sendOtpEmail(toEmail: string, code: string) {
  // ... implementation removed ...
}
*/

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Connect to MongoDB
  try {
    await connectDb();
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Admin auth (single user: password from ADMIN_PASSWORD env)
  app.post("/api/admin/login", (req, res, next) => {
    try {
      const bodySchema = z.object({ password: z.string().min(1) });
      const { password } = bodySchema.parse(req.body);
      if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({ message: "Invalid admin password." });
      }
      req.session!.admin = true;
      return res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/admin/me", (req, res) => {
    if (req.session?.admin) return res.json({ ok: true, admin: true });
    res.status(401).json({ ok: false });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ ok: true });
    });
  });

  // Admin login with phone OTP (only the designated admin phone can use this)
  app.post("/api/admin/login-with-phone", async (req, res, next) => {
    try {
      const bodySchema = z.object({
        phone: z.string().min(1),
        code: z.string().min(4).max(8),
      });
      const { phone, code } = bodySchema.parse(req.body);
      const digitsOnly = String(phone).replace(/\D/g, "");
      const normalizedPhone =
        digitsOnly.length === 10
          ? digitsOnly
          : digitsOnly.length === 11
            ? digitsOnly.slice(-10)
            : null;
      if (!normalizedPhone || !/^\d{10}$/.test(normalizedPhone)) {
        return res.status(400).json({ message: "Phone must be 10 or 11 digits." });
      }

      const adminPhone = getAdminPhoneNormalized();
      if (!adminPhone || normalizedPhone !== adminPhone) {
        return res.status(403).json({ message: "This phone number is not authorized for admin access." });
      }

      // verify OTP from in-memory store
      const pepper = getOtpPepper();
      const normalizedCode = code.replace(/\s+/g, "");
      const codeHash = sha256Hex(`${normalizedPhone}:${normalizedCode}:${pepper}`);

      // cleanup expired entries
      const now = new Date();
      for (const entry of otpStore) {
        if (entry.expiresAt <= now) entry.usedAt = entry.usedAt || new Date();
      }

      const otpEntry = otpStore.find(
        (e) =>
          e.phone === normalizedPhone &&
          e.codeHash === codeHash &&
          !e.usedAt &&
          e.expiresAt > now,
      );
      if (!otpEntry) {
        return res.status(401).json({ message: "Invalid or expired OTP." });
      }
      otpEntry.usedAt = new Date();

      // find or create user via MongoDB
      const usersCollection = getUsersCollection();
      let user = await usersCollection.findOne({ phone: normalizedPhone });

      if (!user) {
        const result = await usersCollection.insertOne({
          name: "Adi",
          college: "Unknown",
          phone: normalizedPhone,
          createdAt: new Date(),
        });
        user = await usersCollection.findOne({ _id: result.insertedId });
      }

      req.session!.admin = true;
      return res.json({ ok: true, name: user?.name });
    } catch (err) {
      next(err);
    }
  });

  // OTP auth
  app.post("/api/auth/request-otp", async (req, res, next) => {
    try {
      const bodySchema = z.object({ phone: phoneSchema });
      const { phone } = bodySchema.parse(req.body);
      const normalized = normalizePhone(phone);

      // rate limit: check recent entry in otpStore
      const lastEntry = otpStore
        .filter((e) => e.phone === normalized)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      if (lastEntry && Date.now() - lastEntry.createdAt.getTime() < 60_000) {
        return res.status(429).json({ message: "Please wait before requesting another OTP." });
      }

      const code = generateOtpCode();
      const pepper = getOtpPepper();
      const codeHash = sha256Hex(`${normalized}:${code}:${pepper}`);
      const expiresAt = new Date(Date.now() + 10 * 60_000);

      otpStore.push({ phone: normalized, codeHash, expiresAt, createdAt: new Date() });

      // In a real system you would send this via SMS.
      // For now, log it in dev so you can see it.
      console.log(`[otp] OTP for phone ${normalized}: ${code}`);
      return res.json({ ok: true, delivery: "console" as const });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/auth/verify-otp", async (req, res, next) => {
    try {
      const bodySchema = z.object({
        name: z.string().min(1).optional(),
        phone: phoneSchema,
        code: z.string().min(4).max(8),
      });
      const { name, phone, code } = bodySchema.parse(req.body);
      const normalizedPhone = normalizePhone(phone);
      const normalizedCode = code.replace(/\s+/g, "");

      // verify OTP using otpStore
      const pepper = getOtpPepper();
      const codeHash = sha256Hex(`${normalizedPhone}:${normalizedCode}:${pepper}`);
      const now = new Date();
      const otpEntry = otpStore.find(
        (e) =>
          e.phone === normalizedPhone &&
          e.codeHash === codeHash &&
          !e.usedAt &&
          e.expiresAt > now,
      );
      if (!otpEntry) {
        return res.status(401).json({ message: "Invalid or expired OTP." });
      }
      otpEntry.usedAt = new Date();

      // upsert user in MongoDB
      const usersCollection = getUsersCollection();
      let user = await usersCollection.findOne({ phone: normalizedPhone });

      if (user) {
        const updates: any = {};
        if (name && !user.name) updates.name = name;
        if (Object.keys(updates).length > 0) {
          await usersCollection.updateOne(
            { phone: normalizedPhone },
            { $set: updates },
          );
          user = await usersCollection.findOne({ phone: normalizedPhone });
        }
      } else {
        const derivedName = name || "User";
        const result = await usersCollection.insertOne({
          name: derivedName,
          college: "Unknown",
          phone: normalizedPhone,
          createdAt: new Date(),
        });
        user = await usersCollection.findOne({ _id: result.insertedId });
      }
      return res.json({ ok: true, user });
    } catch (err) {
      next(err);
    }
  });

  // Registrations
  app.post("/api/registrations", async (req, res, next) => {
    try {
      const bodySchema = z.object({
        phone: phoneSchema,
        eventId: z.string().min(1),
        eventName: z.string().min(1),
        mode: z.enum(["attend", "participate"]),
      });
      const { phone, eventId, eventName, mode } = bodySchema.parse(req.body);
      const normalizedPhone = normalizePhone(phone);

      let reg;
      const registrationsCollection = getRegistrationsCollection();
      
      if (mode === "attend") {
        reg = await registrationsCollection.findOne({
          userPhone: normalizedPhone,
          eventId,
          mode: "attend",
        });
        
        if (!reg) {
          const result = await registrationsCollection.insertOne({
            userPhone: normalizedPhone,
            eventId,
            eventName,
            mode: "attend",
            qrCode: crypto.randomUUID(),
            createdAt: new Date(),
          });
          reg = await registrationsCollection.findOne({
            _id: result.insertedId,
          });
        }
      } else {
        const result = await registrationsCollection.insertOne({
          userPhone: normalizedPhone,
          eventId,
          eventName,
          mode,
          createdAt: new Date(),
        });
        reg = await registrationsCollection.findOne({
          _id: result.insertedId,
        });
      }

      return res.status(201).json(reg);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/registrations", async (req, res, next) => {
    try {
      const raw = typeof req.query.phone === "string" ? req.query.phone : "";
      if (!raw) {
        return res.status(400).json({ message: "phone query param is required" });
      }
      const parsed = phoneSchema.safeParse(raw);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.errors[0]?.message || "Phone must be exactly 10 digits (no +91, spaces, or letters)",
        });
      }
      const normalizedPhone = normalizePhone(raw);

      const registrationsCollection = getRegistrationsCollection();
      const regs = await registrationsCollection
        .find({ userPhone: normalizedPhone })
        .sort({ createdAt: -1 })
        .toArray();
      
      return res.json(regs);
    } catch (err) {
      next(err);
    }
  });

  // Validate QR (for gate/scan systems)
  app.post("/api/registrations/validate-qr", async (req, res, next) => {
    try {
      const bodySchema = z.object({
        qr: z.string().min(1),
        markUsed: z.boolean().optional().default(true),
      });
      const { qr, markUsed } = bodySchema.parse(req.body);

      const registrationsCollection = getRegistrationsCollection();
      const reg = await registrationsCollection.findOne({
        qrCode: qr,
        mode: "attend",
      });

      if (!reg) {
        return res.status(404).json({ valid: false, reason: "NOT_FOUND" });
      }
      if (reg.qrUsedAt) {
        return res.status(410).json({ valid: false, reason: "ALREADY_USED" });
      }
      if (markUsed) {
        await registrationsCollection.updateOne(
          { qrCode: qr },
          { $set: { qrUsedAt: new Date() } },
        );
      }
      return res.json({
        valid: true,
        eventId: reg.eventId,
        eventName: reg.eventName,
        userPhone: reg.userPhone,
      });
    } catch (err) {
      next(err);
    }
  });

  // Users
  app.post("/api/users", async (req, res, next) => {
    try {
      const usersCollection = getUsersCollection();
      const result = await usersCollection.insertOne({
        ...req.body,
        createdAt: new Date(),
      });
      const user = await usersCollection.findOne({ _id: result.insertedId });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/users", async (_req, res, next) => {
    try {
      const usersCollection = getUsersCollection();
      const users = await usersCollection.find({}).toArray();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // Events (public read; create/update/delete require admin)
  app.get("/api/events", async (_req, res, next) => {
    try {
      const eventsCollection = getEventsCollection();
      const events = await eventsCollection.find({}).toArray();
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/events", requireAdmin, async (req, res, next) => {
    try {
      const eventsCollection = getEventsCollection();
      const result = await eventsCollection.insertOne({
        ...req.body,
        createdAt: new Date(),
      });
      const event = await eventsCollection.findOne({ _id: result.insertedId });
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  });

  const eventUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    date: z.string().optional(),
    description: z.string().optional(),
    fullDescription: z.string().optional(),
    type: z.enum(["Solo", "Team"]).optional(),
    prize: z.string().optional(),
    rules: z.array(z.string()).optional(),
    rounds: z.number().optional(),
    unstopUrl: z.string().optional(),
    ruleBookUrl: z.string().url().optional(),
    posterUrl: z.string().optional(), // path to uploaded poster image
  });

  app.put("/api/events/:id", requireAdmin, async (req, res, next) => {
    try {
      const updates = eventUpdateSchema.parse(req.body);
      const eventsCollection = getEventsCollection();
      const { ObjectId } = await import("mongodb");
      
      let objectId;
      try {
        objectId = new ObjectId(req.params.id);
      } catch {
        return res.status(400).json({ message: "Invalid event ID." });
      }

      const result = await eventsCollection.updateOne(
        { _id: objectId },
        { $set: updates },
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Event not found." });
      }

      const event = await eventsCollection.findOne({ _id: objectId });
      res.json(event);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req, res, next) => {
    try {
      const eventsCollection = getEventsCollection();
      const { ObjectId } = await import("mongodb");
      
      let objectId;
      try {
        objectId = new ObjectId(req.params.id);
      } catch {
        return res.status(400).json({ message: "Invalid event ID." });
      }

      const result = await eventsCollection.deleteOne({ _id: objectId });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Event not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  // upload a poster image for an event, requires admin
  app.post("/api/events/:id/poster", requireAdmin, upload.single("poster"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const { ObjectId } = await import("mongodb");
      let objectId;
      try {
        objectId = new ObjectId(req.params.id);
      } catch {
        return res.status(400).json({ message: "Invalid event ID." });
      }
      const posterPath = `/uploads/${req.file.filename}`;
      const eventsCollection = getEventsCollection();
      const result = await eventsCollection.updateOne(
        { _id: objectId },
        { $set: { posterUrl: posterPath } },
      );
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Event not found." });
      }
      const event = await eventsCollection.findOne({ _id: objectId });
      res.json(event);
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
