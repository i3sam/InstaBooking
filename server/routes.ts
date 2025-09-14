import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertPageSchema, insertServiceSchema, insertAppointmentSchema } from "@shared/schema";
import Razorpay from "razorpay";
import crypto from "crypto";

// Razorpay setup (optional for MVP testing)
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// Middleware to verify JWT
function verifyToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create user
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, passwordHash });
      
      // Create profile
      await storage.createProfile({ id: user.id, fullName });

      // Generate JWT
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      res.json({ user: { id: user.id, email: user.email, fullName }, token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const profile = await storage.getProfile(user.id);
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
      
      res.json({ 
        user: { id: user.id, email: user.email, fullName: profile?.fullName }, 
        profile,
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile routes
  app.get("/api/profile", verifyToken, async (req: any, res) => {
    try {
      const profile = await storage.getProfile(req.user.userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pages routes
  app.post("/api/pages", verifyToken, async (req: any, res) => {
    try {
      const pageData = insertPageSchema.parse({
        ...req.body,
        ownerId: req.user.userId
      });

      // Check if slug exists
      const existingPage = await storage.getPageBySlug(pageData.slug);
      if (existingPage) {
        return res.status(400).json({ message: "Slug already exists" });
      }

      const page = await storage.createPage(pageData);
      
      // Create services if provided
      if (req.body.services && Array.isArray(req.body.services)) {
        for (const service of req.body.services) {
          await storage.createService({
            ...service,
            pageId: page.id
          });
        }
      }

      res.json(page);
    } catch (error) {
      console.error("Create page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/pages", verifyToken, async (req: any, res) => {
    try {
      const pages = await storage.getPagesByOwner(req.user.userId);
      res.json(pages);
    } catch (error) {
      console.error("Get pages error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getPageBySlug(req.params.slug);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      const services = await storage.getServicesByPageId(page.id);
      res.json({ ...page, services });
    } catch (error) {
      console.error("Get page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/pages/:id", verifyToken, async (req: any, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page || page.ownerId !== req.user.userId) {
        return res.status(404).json({ message: "Page not found" });
      }

      const updated = await storage.updatePage(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Update page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/pages/:id", verifyToken, async (req: any, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page || page.ownerId !== req.user.userId) {
        return res.status(404).json({ message: "Page not found" });
      }

      await storage.deletePage(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete page error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointments routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.json(appointment);
    } catch (error) {
      console.error("Create appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/appointments", verifyToken, async (req: any, res) => {
    try {
      const appointments = await storage.getAppointmentsByOwner(req.user.userId);
      res.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/appointments/:id", verifyToken, async (req: any, res) => {
    try {
      const updated = await storage.updateAppointment(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment routes
  app.post("/api/payments/create-order", verifyToken, async (req: any, res) => {
    try {
      if (!razorpay) {
        return res.status(500).json({ message: "Payment processing not configured" });
      }
      
      const { plan, amount } = req.body;
      
      const order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency: "USD",
        receipt: `receipt_${Date.now()}`,
      });

      await storage.createPayment({
        userId: req.user.userId,
        plan,
        amount,
        status: "created",
        razorpayOrderId: order.id,
        meta: { order }
      });

      res.json({ 
        orderId: order.id, 
        amount: order.amount, 
        currency: order.currency 
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payments/verify", verifyToken, async (req: any, res) => {
    try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
      
      // Verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      // Update payment status
      await storage.createPayment({
        userId: req.user.userId,
        plan: "pro",
        amount: "29",
        status: "completed",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        meta: { razorpay_signature }
      });

      // Update profile membership
      await storage.updateProfile(req.user.userId, {
        membershipStatus: "pro",
        membershipPlan: "professional",
        membershipExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Verify payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
