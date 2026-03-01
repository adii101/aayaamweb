import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import crypto from "crypto";
import mongoose from "mongoose";
// nodemailer was previously used for email OTP delivery, but login now uses phone numbers via SMS or console.
// import nodemailer from "nodemailer"; // kept commented in case future email features are needed
import { z } from "zod";

async function connectMongo() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "[mongo] MONGODB_URI not set - MongoDB features will be disabled.",
    );
    return;
  }

  if (mongoose.connection.readyState === 1) return;

  await mongoose.connect(uri);
  console.log("[mongo] connected");

  // Drop old unique email index (causes E11000 when multiple users have email: null)
  try {
    await mongoose.connection.collection("users").dropIndex("email_1");
    console.log("[mongo] dropped email_1 index");
  } catch {
    // Index may already be dropped or not exist - ignore
  }
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    college: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    entryId: { type: String },
  },
  { timestamps: true },
);

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    description: { type: String, required: true },
    fullDescription: { type: String, required: true },
    type: { type: String, enum: ["Solo", "Team"], required: true },
    prize: { type: String, required: true },
    rules: [{ type: String, required: true }],
    rounds: { type: Number, required: true },
    unstopUrl: { type: String },
    ruleBookUrl: { type: String },
  },
  { timestamps: true },
);

const UserModel =
  mongoose.models.User || mongoose.model("User", userSchema, "users");
const EventModel =
  mongoose.models.Event || mongoose.model("Event", eventSchema, "events");

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false },
);

const OtpModel =
  mongoose.models.OtpLogin || mongoose.model("OtpLogin", otpSchema, "otp_logins");

const registrationSchema = new mongoose.Schema(
  {
    userPhone: { type: String, required: true, index: true },
    eventId: { type: String, required: true },
    eventName: { type: String, required: true },
    mode: {
      type: String,
      enum: ["attend", "participate"],
      required: true,
    },
    qrCode: { type: String },
    qrUsedAt: { type: Date },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: false },
);

const RegistrationModel =
  mongoose.models.Registration ||
  mongoose.model("Registration", registrationSchema, "registrations");

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
  await connectMongo().catch((err) => {
    console.error("[mongo] connection error", err);
  });

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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "MongoDB is not connected." });
      }

      const pepper = getOtpPepper();
      const normalizedCode = code.replace(/\s+/g, "");
      const codeHash = sha256Hex(`${normalizedPhone}:${normalizedCode}:${pepper}`);

      const otp = await OtpModel.findOne({
        phone: normalizedPhone,
        codeHash,
        usedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otp) {
        return res.status(401).json({ message: "Invalid or expired OTP." });
      }

      otp.usedAt = new Date();
      await otp.save();

      let user = await UserModel.findOne({ phone: normalizedPhone });
      if (!user) {
        user = await UserModel.create({
          name: "Adi",
          college: "Unknown",
          phone: normalizedPhone,
        });
      }

      req.session!.admin = true;
      return res.json({ ok: true, name: user.name });
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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "MongoDB is not connected. Set MONGODB_URI and restart the server.",
        });
      }

      // Basic rate limit: 1 OTP per phone number per 60 seconds
      // lean() return type sometimes confuses TS; cast to any so we can read
      // createdAt without a complaint.
      const last: any = await OtpModel.findOne({ phone: normalized })
        .sort({ createdAt: -1 })
        .lean();
      if (last && Date.now() - new Date(last.createdAt).getTime() < 60_000) {
        return res.status(429).json({ message: "Please wait before requesting another OTP." });
      }

      const code = generateOtpCode();
      const pepper = getOtpPepper();
      const codeHash = sha256Hex(`${normalized}:${code}:${pepper}`);
      const expiresAt = new Date(Date.now() + 10 * 60_000);

      await OtpModel.create({
        phone: normalized,
        codeHash,
        expiresAt,
        createdAt: new Date(),
      });

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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "MongoDB is not connected. Set MONGODB_URI and restart the server.",
        });
      }

      const pepper = getOtpPepper();
      const codeHash = sha256Hex(`${normalizedPhone}:${normalizedCode}:${pepper}`);

      const otp = await OtpModel.findOne({
        phone: normalizedPhone,
        codeHash,
        usedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      }).sort({ createdAt: -1 });

      if (!otp) {
        return res.status(401).json({ message: "Invalid or expired OTP." });
      }

      otp.usedAt = new Date();
      await otp.save();

      // Create user if doesn't exist; otherwise update missing fields
      const existing = await UserModel.findOne({ phone: normalizedPhone });
      if (existing) {
        if (name && !existing.name) existing.name = name;
        if (phone && !existing.phone) existing.phone = phone;
        await existing.save();
        return res.json({ ok: true, user: existing.toObject() });
      }

      const derivedName = name || "User";
      const created = await UserModel.create({
        name: derivedName,
        college: "Unknown",
        phone: normalizedPhone,
        entryId: undefined,
      });

      return res.json({ ok: true, user: created.toObject() });
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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "MongoDB is not connected. Set MONGODB_URI and restart the server.",
        });
      }

      let reg: any;

      if (mode === "attend") {
        // Only one active QR per user per event. If they register again, reuse the existing one.
        reg =
          (await RegistrationModel.findOne({
            userPhone: normalizedPhone,
            eventId,
            mode: "attend",
          })) ||
          (await RegistrationModel.create({
            userPhone: normalizedPhone,
            eventId,
            eventName,
            mode: "attend",
            qrCode: crypto.randomUUID(),
          }));
      } else {
        reg = await RegistrationModel.create({
          userPhone: normalizedPhone,
          eventId,
          eventName,
          mode,
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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "MongoDB is not connected. Set MONGODB_URI and restart the server.",
        });
      }

      const regs = await RegistrationModel.find({
        userPhone: normalizedPhone,
      })
        .sort({ createdAt: -1 })
        .lean();

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

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          message:
            "MongoDB is not connected. Set MONGODB_URI and restart the server.",
        });
      }

      const reg = await RegistrationModel.findOne({
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
        reg.qrUsedAt = new Date();
        await reg.save();
      }

      return res.json({
        valid: true,
        eventId: reg.eventId,
        eventName: reg.eventName,
        userPhone: reg.userPhone, // return phone in QR validation instead of legacy email field
      });
    } catch (err) {
      next(err);
    }
  });

  // Users
  app.post("/api/users", async (req, res, next) => {
    try {
      const user = await UserModel.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/users", async (_req, res, next) => {
    try {
      const users = await UserModel.find().lean();
      res.json(users);
    } catch (err) {
      next(err);
    }
  });

  // Events (public read; create/update/delete require admin)
  app.get("/api/events", async (_req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "MongoDB is not connected." });
      }
      const events = await EventModel.find().lean();
      res.json(events);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/events", requireAdmin, async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "MongoDB is not connected." });
      }
      const event = await EventModel.create(req.body);
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
  });

  app.put("/api/events/:id", requireAdmin, async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "MongoDB is not connected." });
      }
      const updates = eventUpdateSchema.parse(req.body);
      const event = await EventModel.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true },
      );
      if (!event) return res.status(404).json({ message: "Event not found." });
      res.json(event);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req, res, next) => {
    try {
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: "MongoDB is not connected." });
      }
      const result = await EventModel.findByIdAndDelete(req.params.id);
      if (!result) return res.status(404).json({ message: "Event not found." });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });

  return httpServer;
}
