import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Removed PostgreSQL schema imports - using Supabase directly
import crypto from "crypto";
import { createClient } from '@supabase/supabase-js';
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import multer from 'multer';
import { Resend } from 'resend';
import { insertReviewSchema, insertPageSchema } from '@shared/schema';

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
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

// PayPal setup is handled in ./paypal.ts module

// Resend setup for email notifications
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log("Resend email service initialized successfully");
} else {
  console.warn("RESEND_API_KEY not found. Email notifications will be disabled");
}

// Email notification functions
async function sendNewAppointmentNotification(ownerEmail: string, customerName: string, date: string, time: string, serviceName: string) {
  if (!resend) {
    console.warn("Email service not available - skipping email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Using Resend's onboarding domain for testing
      to: ownerEmail,
      subject: 'You have a new appointment!',
      html: `
        <h2>New Appointment Request</h2>
        <p>You have received a new appointment request from <strong>${customerName}</strong>.</p>
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>Please log in to your dashboard to review and approve this appointment.</p>
      `,
    });
    console.log(`New appointment notification sent to ${ownerEmail}`);
  } catch (error) {
    console.error("Failed to send new appointment notification:", error);
  }
}

async function sendAppointmentApprovalEmail(customerEmail: string, customerName: string, date: string, time: string) {
  if (!resend) {
    console.warn("Email service not available - skipping email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Using Resend's onboarding domain for testing
      to: customerEmail,
      subject: 'Your appointment has been approved!',
      html: `
        <h2>Great news, ${customerName}!</h2>
        <p>Your appointment request has been approved.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p>We look forward to seeing you!</p>
      `,
    });
    console.log(`Approval email sent to ${customerEmail}`);
  } catch (error) {
    console.error("Failed to send approval email:", error);
  }
}

async function sendAppointmentRejectionEmail(customerEmail: string, customerName: string) {
  if (!resend) {
    console.warn("Email service not available - skipping email notification");
    return;
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // Using Resend's onboarding domain for testing
      to: customerEmail,
      subject: 'Your appointment request has been declined',
      html: `
        <h2>Hello ${customerName},</h2>
        <p>We regret to inform you that your appointment request has been declined.</p>
        <p>Please feel free to submit another request for a different date and time.</p>
        <p>Thank you for your understanding.</p>
      `,
    });
    console.log(`Rejection email sent to ${customerEmail}`);
  } catch (error) {
    console.error("Failed to send rejection email:", error);
  }
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
      const allowedBuckets = ['logos', 'gallery-banners', 'gallery-logos', 'gallery-images'];
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
      const allowedBuckets = ['logos', 'gallery-banners', 'gallery-logos', 'gallery-images'];
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
      // Check if user has Pro membership and it hasn't expired
      const userProfile = await storage.getProfile(req.user.userId);
      const now = new Date();
      const membershipExpired = userProfile?.membershipExpires && new Date(userProfile.membershipExpires) <= now;
      
      if (!userProfile || userProfile.membershipStatus !== 'pro' || membershipExpired) {
        return res.status(403).json({ 
          message: "Active Pro membership required", 
          details: membershipExpired ? "Your Pro membership has expired. Please renew to continue creating pages." : "Upgrade to Pro to create booking pages"
        });
      }

      // Validate request body
      const validation = insertPageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validation.error.errors 
        });
      }

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

  // Get page by ID with services (for editing)
  app.get("/api/pages/:id/edit", verifyToken, async (req: any, res) => {
    try {
      const page = await storage.getPage(req.params.id);
      if (!page || page.ownerId !== req.user.userId) {
        return res.status(404).json({ message: "Page not found" });
      }

      const services = await storage.getServicesByPageId(page.id);
      res.json({ ...page, services });
    } catch (error) {
      console.error("Get page for edit error:", error);
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

      // Extract services from request body
      const { services, ...pageData } = req.body;

      // Update page data
      const updated = await storage.updatePage(req.params.id, pageData);

      // Handle services update if provided
      if (services && Array.isArray(services)) {
        const existingServices = await storage.getServicesByPageId(req.params.id);
        const existingServiceIds = existingServices.map(s => s.id);
        const submittedServiceIds = services.filter(s => s.id).map(s => s.id);
        
        // Update existing services and create new ones
        for (const service of services) {
          if (service.id) {
            // Security check: Only allow updates to services that belong to this page
            if (!existingServiceIds.includes(service.id)) {
              return res.status(400).json({ 
                message: "Invalid service ID", 
                details: "One or more service IDs do not belong to this page" 
              });
            }
            // Update existing service - only allow specific fields to be updated
            const { id, name, description, durationMinutes, price } = service;
            await storage.updateService(id, {
              name,
              description, 
              durationMinutes,
              price
            });
          } else {
            // Create new service
            await storage.createService({
              ...service,
              pageId: req.params.id
            });
          }
        }
        
        // Handle removed services
        const servicesToRemove = existingServiceIds.filter(id => !submittedServiceIds.includes(id));
        const servicesNotDeleted = [];
        
        for (const serviceId of servicesToRemove) {
          try {
            await storage.deleteService(serviceId);
          } catch (error: any) {
            // If deletion fails due to foreign key constraint (appointments exist),
            // we'll skip the deletion but track it
            if (error.code === '23503') {
              const service = existingServices.find(s => s.id === serviceId);
              servicesNotDeleted.push({
                id: serviceId,
                name: service?.name || 'Unknown Service',
                reason: 'Service has existing appointments and cannot be deleted'
              });
              console.warn(`Cannot delete service ${serviceId} - it has associated appointments`);
            } else {
              throw error;
            }
          }
        }
        
        // Include information about services that couldn't be deleted in the response
        const response = { ...updated };
        if (servicesNotDeleted.length > 0) {
          response.warnings = {
            servicesNotDeleted,
            message: `${servicesNotDeleted.length} service(s) could not be deleted because they have existing appointments`
          };
        }
        
        res.json(response);
      } else {
        res.json(updated);
      }
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

  // Reviews routes
  app.post("/api/reviews", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = insertReviewSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          errors: validationResult.error.flatten().fieldErrors 
        });
      }
      
      const reviewData = validationResult.data;
      
      // Server-side rating validation (redundant but safe)
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      const review = await storage.createReview({
        ...reviewData,
        isApproved: 'pending' // Reviews start as pending approval
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reviews/:pageId", async (req, res) => {
    try {
      const reviews = await storage.getApprovedReviewsByPageId(req.params.pageId);
      res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Appointments routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = req.body;
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send email notification to business owner about new appointment
      try {
        // Get the page owner's profile and service details for the notification
        const page = await storage.getPage(appointmentData.pageId);
        if (page) {
          const profile = await storage.getProfile(page.ownerId);
          if (profile && profile.email) {
            await sendNewAppointmentNotification(
              profile.email,
              appointmentData.customerName,
              appointmentData.date,
              appointmentData.time,
              appointmentData.serviceName || 'Service'
            );
          }
        }
      } catch (emailError) {
        console.error("Failed to send new appointment notification:", emailError);
        // Don't fail the appointment creation if email fails
      }
      
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
      
      // Send email notification if status changed to approved or rejected
      if (req.body.status && appointment.customerEmail) {
        if (req.body.status === 'accepted') {
          await sendAppointmentApprovalEmail(
            appointment.customerEmail,
            appointment.customerName,
            appointment.date,
            appointment.time
          );
        } else if (req.body.status === 'declined') {
          await sendAppointmentRejectionEmail(
            appointment.customerEmail,
            appointment.customerName
          );
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Update appointment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard statistics route
  app.get("/api/dashboard/stats", verifyToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Get all pages for this user
      const pages = await storage.getPagesByOwner(userId);
      const pagesCount = Math.max(0, pages?.length || 0);
      
      // Get all appointments for this user
      const appointments = await storage.getAppointmentsByOwner(userId);
      const totalAppointments = Math.max(0, appointments?.length || 0);
      
      // Count pending appointments
      const pendingAppointments = Math.max(0, appointments?.filter(apt => apt.status === 'pending')?.length || 0);
      
      // Calculate total revenue (from accepted appointments)
      const acceptedAppointments = appointments?.filter(apt => apt.status === 'accepted') || [];
      const totalRevenue = Math.max(0, acceptedAppointments.reduce((sum, apt) => sum + (Number(apt.price) || 0), 0));
      
      // Calculate conversion rate (safe division)
      const conversionRate = totalAppointments > 0 && acceptedAppointments.length >= 0
        ? Math.round((acceptedAppointments.length / totalAppointments * 100) * 10) / 10
        : 0;
      
      // Average booking value (safe division)
      const avgBookingValue = acceptedAppointments.length > 0 && totalRevenue > 0
        ? Math.round((totalRevenue / acceptedAppointments.length) * 100) / 100
        : 0;
      
      // Ensure all values are valid numbers
      const response = {
        pagesCount: Number(pagesCount) || 0,
        totalAppointments: Number(totalAppointments) || 0,
        pendingAppointments: Number(pendingAppointments) || 0,
        totalRevenue: Number(totalRevenue) || 0,
        conversionRate: Number(conversionRate) || 0,
        avgBookingValue: Number(avgBookingValue) || 0
      };
      
      res.json(response);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        // Return safe defaults on error
        pagesCount: 0,
        totalAppointments: 0,
        pendingAppointments: 0,
        totalRevenue: 0,
        conversionRate: 0,
        avgBookingValue: 0
      });
    }
  });

  // Recent activity route
  app.get("/api/dashboard/recent-activity", verifyToken, async (req: any, res) => {
    try {
      const userId = req.user.userId;
      
      // Get recent appointments (last 10)
      const appointments = await storage.getAppointmentsByOwner(userId);
      
      // Ensure we have a valid array
      const validAppointments = Array.isArray(appointments) ? appointments : [];
      
      // Sort by creation date (most recent first) and take last 10
      const recentAppointments = validAppointments
        .filter(apt => apt && apt.id) // Filter out invalid appointments
        .sort((a, b) => {
          // Use a fallback date if createdAt doesn't exist
          const dateA = new Date(a.createdAt || a.id || Date.now()).getTime();
          const dateB = new Date(b.createdAt || b.id || Date.now()).getTime();
          return dateB - dateA; // Most recent first
        })
        .slice(0, 10) // Limit to 10 items
        .map(apt => ({
          id: String(apt.id || ''),
          type: 'appointment',
          title: `New appointment from ${apt.customerName || 'Unknown Customer'}`,
          description: `${apt.serviceName || 'Service'} on ${apt.date || 'TBD'} at ${apt.time || 'TBD'}`,
          time: apt.createdAt || apt.id || new Date().toISOString(),
          status: apt.status || 'pending'
        }));
      
      res.json(recentAppointments);
    } catch (error) {
      console.error("Get recent activity error:", error);
      res.status(500).json([]); // Return empty array on error instead of error object
    }
  });

  // PayPal setup routes from blueprint
  app.get("/paypal/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/paypal/order", async (req, res) => {
    // Request body should contain: { intent, amount, currency }
    await createPaypalOrder(req, res);
  });

  app.post("/paypal/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Payment routes for subscription management
  app.post("/api/payments/create-order", verifyToken, async (req: any, res) => {
    try {
      const { plan, currency: requestedCurrency } = req.body;
      
      // Currency conversion rates relative to USD
      const CURRENCY_RATES = {
        'USD': 1,
        'EUR': 0.85,
        'GBP': 0.73,
        'INR': 83.25,
        'BHD': 0.376,
        'AED': 3.67,
        'SAR': 3.75,
        'CAD': 1.35,
        'AUD': 1.52
      };
      
      // Server-side canonical pricing - ignore any client-provided amount
      const PLAN_PRICING = {
        'pro': { amount: 14.99, currency: 'USD' }
      };
      
      const planConfig = PLAN_PRICING[plan as keyof typeof PLAN_PRICING];
      if (!planConfig) {
        return res.status(400).json({ message: "Invalid plan selected" });
      }
      
      // Validate and use requested currency
      const currency = requestedCurrency && CURRENCY_RATES[requestedCurrency as keyof typeof CURRENCY_RATES] 
        ? requestedCurrency 
        : 'USD';
        
      // Convert price to requested currency
      const usdAmount = planConfig.amount;
      const conversionRate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES];
      const canonicalAmount = Math.round((usdAmount * conversionRate) * 100) / 100;
      
      // Store payment record for tracking
      await storage.createPayment({
        userId: req.user.userId,
        plan,
        amount: canonicalAmount,
        status: "created",
        paypalOrderId: `pending_${Date.now()}`, // Will be updated with actual PayPal order ID
        meta: { currency, usdAmount, planConfig }
      });

      res.json({ 
        plan,
        amount: canonicalAmount,
        currency: currency,
        displayAmount: canonicalAmount,
        intent: 'CAPTURE'
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payments/verify", verifyToken, async (req: any, res) => {
    try {
      const { paypal_order_id, paypal_payment_id, plan, amount } = req.body;
      
      if (!paypal_order_id) {
        return res.status(400).json({ message: "PayPal order ID is required" });
      }

      // Update payment status
      await storage.createPayment({
        userId: req.user.userId,
        plan: plan || "pro",
        amount: amount || "14.99",
        status: "completed",
        paypalOrderId: paypal_order_id,
        paypalPaymentId: paypal_payment_id,
        meta: { paypal_order_id, paypal_payment_id, completedAt: new Date().toISOString() }
      });

      // Update profile membership
      await storage.updateProfile(req.user.userId, {
        membershipStatus: "pro",
        membershipPlan: "pro",
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
