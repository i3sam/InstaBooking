import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed PostgreSQL schema imports - using Supabase directly
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

// Supabase setup
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    // Validate URL format before creating client
    new URL(supabaseUrl); // This will throw if URL is invalid
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client initialized successfully");
    console.log("Routes Supabase URL:", supabaseUrl);
  } catch (error) {
    console.warn("Failed to initialize Supabase client:", error instanceof Error ? error.message : error);
    console.warn("Application will continue without Supabase authentication");
  }
} else {
  console.warn("Supabase credentials not found. Application will continue without Supabase authentication");
}

// Razorpay setup (optional for MVP testing)
let razorpay: Razorpay | null = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// Middleware to verify Supabase JWT
async function verifyToken(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (!supabase) {
    console.error("Supabase not configured");
    return res.status(503).json({ message: "Authentication service unavailable" });
  }

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    req.user = { userId: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload route using multer for handling file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req: any, file: any, cb: any) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

  app.post("/api/storage/upload", verifyToken, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }

      if (!supabase) {
        return res.status(503).json({ message: "Storage service unavailable" });
      }

      const bucket = req.body.bucket || 'logos';
      const folder = req.body.folder || '';
      
      // Security: Only allow specific buckets
      const allowedBuckets = ['logos'];
      if (!allowedBuckets.includes(bucket)) {
        return res.status(400).json({ message: "Invalid bucket name" });
      }

      // Generate unique filename
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload using service role (bypasses RLS)
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: "Failed to upload file" });
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      res.json({
        success: true,
        url: publicUrl,
        path: filePath
      });

    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Storage bucket management route
  app.post("/api/storage/ensure-bucket", verifyToken, async (req: any, res) => {
    try {
      const { bucketName } = req.body;
      
      // Security: Only allow specific bucket names
      const allowedBuckets = ['logos'];
      if (!bucketName || !allowedBuckets.includes(bucketName)) {
        return res.status(400).json({ message: "Invalid bucket name" });
      }

      if (!supabase) {
        return res.status(503).json({ message: "Storage service unavailable" });
      }

      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (!listError && buckets) {
        const bucketExists = buckets.some((b: any) => b.name === bucketName);
        if (bucketExists) {
          return res.json({ success: true, message: "Bucket already exists" });
        }
      }

      // Create bucket if it doesn't exist
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB in bytes
      });

      if (error) {
        // Handle "bucket already exists" gracefully
        if (error.message?.includes('already exists')) {
          return res.json({ success: true, message: "Bucket already exists" });
        }
        console.error("Failed to create bucket:", error);
        return res.status(500).json({ message: "Failed to create storage bucket" });
      }

      console.log("Storage bucket created successfully:", bucketName);
      res.json({ success: true, message: "Bucket created successfully" });
    } catch (error) {
      console.error("Storage bucket error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Profile routes
  app.post("/api/profile", verifyToken, async (req: any, res) => {
    try {
      const { fullName } = req.body;
      // Use authenticated user ID, not client-provided userId for security
      const userId = req.user.userId;
      
      // Check if profile already exists
      const existingProfile = await storage.getProfile(userId);
      if (existingProfile) {
        return res.json(existingProfile);
      }

      // Create new profile
      const profileData = { id: userId, fullName };
      const profile = await storage.createProfile(profileData);
      
      res.json(profile);
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/profile", verifyToken, async (req: any, res) => {
    try {
      // Only allow users to access their own profile - ignore userId query parameter
      let profile = await storage.getProfile(req.user.userId);
      
      // If no profile exists, create a default one automatically
      if (!profile) {
        console.log(`Creating default profile for user: ${req.user.userId}`);
        const profileData = { 
          id: req.user.userId, 
          fullName: req.user.email || '' // Use email as fallback if no name
        };
        profile = await storage.createProfile(profileData);
        console.log(`Profile created successfully for user: ${req.user.userId}`);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/profile", verifyToken, async (req: any, res) => {
    try {
      const { fullName, timezone } = req.body;
      
      const updates: any = {};
      if (fullName !== undefined) updates.fullName = fullName;
      // Add other fields as needed
      
      const updatedProfile = await storage.updateProfile(req.user.userId, updates);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Pages routes
  app.post("/api/pages", verifyToken, async (req: any, res) => {
    try {
      const pageData = {
        ...req.body,
        ownerId: req.user.userId
      };

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
      const appointmentData = req.body;
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
      // First get the appointment to verify ownership
      const appointment = await storage.getAppointmentById(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Verify the user owns this appointment
      if (appointment.ownerId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized to update this appointment" });
      }
      
      const updated = await storage.updateAppointment(req.params.id, req.body);
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
