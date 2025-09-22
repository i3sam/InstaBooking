// Load environment variables first
import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { profiles, pages, services, appointments, paymentsDemo, reviews, subscriptions, demoPages } from '@shared/schema';

// Lazy initialize database connection using Supabase PostgreSQL
let db: ReturnType<typeof drizzle> | null = null;

// Supabase client for admin operations (auth, storage)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Storage Supabase client initialized successfully");
  } catch (error) {
    console.warn("❌ Failed to initialize Supabase client in storage:", error);
  }
} else {
  console.warn("❌ Supabase credentials not found - please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
}

// In-memory profile cache to reduce database queries
interface CachedProfile {
  data: any;
  expiresAt: number;
}

const profileCache = new Map<string, CachedProfile>();
const PROFILE_CACHE_TTL = 15000; // 15 seconds

function getDb() {
  if (!db) {
    // Use the Supabase PostgreSQL connection string
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    console.log("✅ Server storage initialized with Drizzle + Supabase PostgreSQL");
    const client = postgres(connectionString);
    db = drizzle(client);
    
    // Test database connection
    testConnection();
  }
  return db;
}

// Test database connection
async function testConnection() {
  try {
    // Simple query to test connection
    const result = await getDb().select().from(profiles).limit(1);
    console.log("✅ Drizzle + Supabase PostgreSQL connection successful");
  } catch (error) {
    console.log("⚠️  Database connection test error (may be normal on startup):", error);
  }
}

export interface IStorage {
  // Profiles
  createProfile(profile: any): Promise<any>;
  getProfile(userId: string): Promise<any | undefined>;
  updateProfile(userId: string, updates: any): Promise<any | undefined>;
  
  // Pages
  createPage(page: any): Promise<any>;
  getPage(id: string): Promise<any | undefined>;
  getPageBySlug(slug: string): Promise<any | undefined>;
  getPagesByOwner(ownerId: string): Promise<any[]>;
  updatePage(id: string, updates: any): Promise<any | undefined>;
  deletePage(id: string): Promise<boolean>;
  
  // Services
  createService(service: any): Promise<any>;
  getServicesByPageId(pageId: string): Promise<any[]>;
  updateService(id: string, updates: any): Promise<any | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Appointments
  createAppointment(appointment: any): Promise<any>;
  getAppointmentById(id: string): Promise<any | undefined>;
  getAppointmentsByOwner(ownerId: string): Promise<any[]>;
  updateAppointment(id: string, updates: any): Promise<any | undefined>;
  
  // Payments
  createPayment(payment: any): Promise<any>;
  getPaymentsByUser(userId: string): Promise<any[]>;
  
  // Reviews
  createReview(review: any): Promise<any>;
  getReviewsByPageId(pageId: string): Promise<any[]>;
  getApprovedReviewsByPageId(pageId: string): Promise<any[]>;
  updateReview(id: string, updates: any): Promise<any | undefined>;
  
  // Subscriptions
  createSubscription(subscription: any): Promise<any>;
  getSubscription(id: string): Promise<any | undefined>;
  getSubscriptionsByUser(userId: string): Promise<any[]>;
  updateSubscription(id: string, updates: any): Promise<any | undefined>;
  cancelSubscription(id: string): Promise<boolean>;
  
  // Demo Pages
  createDemoPage(demoData: any, ownerId?: string): Promise<any>;
  getDemoPage(id: string): Promise<any | undefined>;
  getDemoPagesByOwner(ownerId: string): Promise<any[]>;
  deleteDemoPage(id: string): Promise<boolean>;
  atomicConvertDemo(demoId: string, convertToken: string): Promise<any | null>;
  associateDemoWithUser(demoId: string, userId: string): Promise<boolean>;
  
  // Demo Users
  createDemoUser(email: string, fullName?: string): Promise<any>;
}

export class DrizzleStorage implements IStorage {
  async createProfile(profile: any): Promise<any> {
    try {
      const [result] = await getDb().insert(profiles).values(profile).returning();
      
      // Cache the newly created profile
      const now = Date.now();
      profileCache.set(result.id, {
        data: result,
        expiresAt: now + PROFILE_CACHE_TTL
      });
      
      return result;
    } catch (error) {
      console.error("Create profile error:", error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<any | undefined> {
    try {
      // Check cache first
      const cached = profileCache.get(userId);
      const now = Date.now();
      
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }

      const [result] = await getDb().select().from(profiles).where(eq(profiles.id, userId));
      
      // Cache the result
      if (result) {
        profileCache.set(userId, {
          data: result,
          expiresAt: now + PROFILE_CACHE_TTL
        });
      }
      
      return result;
    } catch (error) {
      console.error("Get profile error:", error);
      return undefined;
    }
  }

  async updateProfile(userId: string, updates: any): Promise<any | undefined> {
    try {
      const [result] = await getDb().update(profiles).set(updates).where(eq(profiles.id, userId)).returning();
      
      // Invalidate cache on update
      profileCache.delete(userId);
      
      return result;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async createPage(page: any): Promise<any> {
    try {
      const pageData = { ...page, createdAt: new Date(), updatedAt: new Date() };
      const [result] = await getDb().insert(pages).values(pageData).returning();
      return result;
    } catch (error) {
      console.error("Create page error:", error);
      throw error;
    }
  }

  async getPage(id: string): Promise<any | undefined> {
    try {
      const [result] = await getDb().select().from(pages).where(eq(pages.id, id));
      return result;
    } catch (error) {
      console.error("Get page error:", error);
      return undefined;
    }
  }

  async getPageBySlug(slug: string): Promise<any | undefined> {
    try {
      const [result] = await getDb().select().from(pages).where(eq(pages.slug, slug));
      return result;
    } catch (error) {
      console.error("Get page by slug error:", error);
      return undefined;
    }
  }

  async getPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(pages).where(eq(pages.ownerId, ownerId));
      return results || [];
    } catch (error) {
      console.error("Get pages error:", error);
      return [];
    }
  }

  async updatePage(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = { ...updates, updatedAt: new Date() };
      const [result] = await getDb().update(pages).set(updateData).where(eq(pages.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Update page error:", error);
      throw error;
    }
  }

  async deletePage(id: string): Promise<boolean> {
    try {
      await getDb().delete(pages).where(eq(pages.id, id));
      return true;
    } catch (error) {
      console.error("Delete page error:", error);
      return false;
    }
  }

  async createService(service: any): Promise<any> {
    try {
      const serviceData = { ...service, createdAt: new Date() };
      const [result] = await getDb().insert(services).values(serviceData).returning();
      return result;
    } catch (error) {
      console.error("Create service error:", error);
      throw error;
    }
  }

  async getServicesByPageId(pageId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(services).where(eq(services.pageId, pageId));
      return results || [];
    } catch (error) {
      console.error("Get services by page ID error:", error);
      return [];
    }
  }

  async updateService(id: string, updates: any): Promise<any | undefined> {
    try {
      const [result] = await getDb().update(services).set(updates).where(eq(services.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Update service error:", error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<boolean> {
    try {
      await getDb().delete(services).where(eq(services.id, id));
      return true;
    } catch (error) {
      console.error("Delete service error:", error);
      return false;
    }
  }

  async createAppointment(appointment: any): Promise<any> {
    try {
      const appointmentData = { 
        ...appointment, 
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const [result] = await getDb().insert(appointments).values(appointmentData).returning();
      return result;
    } catch (error) {
      console.error("Create appointment error:", error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<any | undefined> {
    try {
      const [result] = await getDb().select().from(appointments).where(eq(appointments.id, id));
      return result;
    } catch (error) {
      console.error("Get appointment by ID error:", error);
      return undefined;
    }
  }

  async getAppointmentsByOwner(ownerId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(appointments).where(eq(appointments.ownerId, ownerId)).orderBy(desc(appointments.createdAt));
      return results || [];
    } catch (error) {
      console.error("Get appointments by owner error:", error);
      return [];
    }
  }

  async updateAppointment(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = { ...updates, updatedAt: new Date() };
      const [result] = await getDb().update(appointments).set(updateData).where(eq(appointments.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Update appointment error:", error);
      throw error;
    }
  }

  async createPayment(payment: any): Promise<any> {
    try {
      const paymentData = { ...payment, createdAt: new Date() };
      const [result] = await getDb().insert(paymentsDemo).values(paymentData).returning();
      return result;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  }

  async getPaymentsByUser(userId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(paymentsDemo).where(eq(paymentsDemo.userId, userId)).orderBy(desc(paymentsDemo.createdAt));
      return results || [];
    } catch (error) {
      console.error("Get payments by user error:", error);
      return [];
    }
  }

  async createReview(review: any): Promise<any> {
    try {
      const reviewData = { ...review, createdAt: new Date() };
      const [result] = await getDb().insert(reviews).values(reviewData).returning();
      return result;
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  }

  async getReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(reviews).where(eq(reviews.pageId, pageId)).orderBy(desc(reviews.createdAt));
      return results || [];
    } catch (error) {
      console.error("Get reviews by page ID error:", error);
      return [];
    }
  }

  async getApprovedReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(reviews).where(sql`${reviews.pageId} = ${pageId} AND ${reviews.isApproved} = 'approved'`).orderBy(desc(reviews.createdAt));
      return results || [];
    } catch (error) {
      console.error("Get approved reviews by page ID error:", error);
      return [];
    }
  }

  async updateReview(id: string, updates: any): Promise<any | undefined> {
    try {
      const [result] = await getDb().update(reviews).set(updates).where(eq(reviews.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  }

  async createSubscription(subscription: any): Promise<any> {
    try {
      const subscriptionData = { 
        ...subscription, 
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const [result] = await getDb().insert(subscriptions).values(subscriptionData).returning();
      return result;
    } catch (error) {
      console.error("Create subscription error:", error);
      throw error;
    }
  }

  async getSubscription(id: string): Promise<any | undefined> {
    try {
      const [result] = await getDb().select().from(subscriptions).where(eq(subscriptions.id, id));
      return result;
    } catch (error) {
      console.error("Get subscription error:", error);
      return undefined;
    }
  }

  async getSubscriptionsByUser(userId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt));
      return results || [];
    } catch (error) {
      console.error("Get subscriptions by user error:", error);
      return [];
    }
  }

  async updateSubscription(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = { ...updates, updatedAt: new Date() };
      const [result] = await getDb().update(subscriptions).set(updateData).where(eq(subscriptions.id, id)).returning();
      return result;
    } catch (error) {
      console.error("Update subscription error:", error);
      throw error;
    }
  }

  async cancelSubscription(id: string): Promise<boolean> {
    try {
      await getDb().update(subscriptions).set({ status: 'CANCELLED', updatedAt: new Date() }).where(eq(subscriptions.id, id));
      return true;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return false;
    }
  }

  async createDemoPage(demoData: any, ownerId?: string): Promise<any> {
    try {
      const convertToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      const demoPageData = {
        ownerId: ownerId || null,
        data: demoData,
        convertToken,
        createdAt: new Date(),
        expiresAt
      };
      
      const [result] = await getDb().insert(demoPages).values(demoPageData).returning();
      return result;
    } catch (error) {
      console.error("Create demo page error:", error);
      throw error;
    }
  }

  async getDemoPage(id: string): Promise<any | undefined> {
    try {
      const [result] = await getDb().select().from(demoPages).where(eq(demoPages.id, id));
      return result;
    } catch (error) {
      console.error("Get demo page error:", error);
      return undefined;
    }
  }

  async getDemoPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(demoPages).where(eq(demoPages.ownerId, ownerId)).orderBy(desc(demoPages.createdAt));
      return results || [];
    } catch (error) {
      console.error("Get demo pages by owner error:", error);
      return [];
    }
  }

  async deleteDemoPage(id: string): Promise<boolean> {
    try {
      await getDb().delete(demoPages).where(eq(demoPages.id, id));
      return true;
    } catch (error) {
      console.error("Delete demo page error:", error);
      return false;
    }
  }

  async atomicConvertDemo(demoId: string, convertToken: string): Promise<any | null> {
    try {
      // First check if token is valid and not already used
      const [demoPage] = await getDb()
        .select()
        .from(demoPages)
        .where(sql`${demoPages.id} = ${demoId} AND ${demoPages.convertToken} = ${convertToken}`);
      
      if (!demoPage) {
        return null; // Invalid token or already used
      }
      
      // Check if not expired
      const now = new Date();
      if (demoPage.expiresAt && now > new Date(demoPage.expiresAt)) {
        return null; // Expired
      }
      
      // Mark token as used by setting it to null
      const [updatedDemo] = await getDb()
        .update(demoPages)
        .set({ convertToken: null })
        .where(sql`${demoPages.id} = ${demoId} AND ${demoPages.convertToken} = ${convertToken}`)
        .returning();
      
      return updatedDemo || null;
    } catch (error) {
      console.error("Atomic convert demo error:", error);
      return null;
    }
  }

  async associateDemoWithUser(demoId: string, userId: string): Promise<boolean> {
    try {
      await getDb()
        .update(demoPages)
        .set({ ownerId: userId })
        .where(eq(demoPages.id, demoId));
      return true;
    } catch (error) {
      console.error("Associate demo with user error:", error);
      return false;
    }
  }

  async createDemoUser(email: string, fullName?: string): Promise<any> {
    try {
      // Generate a UUID for demo user
      const demoUserId = crypto.randomUUID();
      
      const profileData = {
        id: demoUserId,
        email,
        fullName: fullName || 'Demo User',
        membershipStatus: 'demo',
        createdAt: new Date()
      };
      
      const [result] = await getDb().insert(profiles).values(profileData).returning();
      return result;
    } catch (error) {
      console.error("Create demo user error:", error);
      throw error;
    }
  }
}

// Initialize storage instance
export const storage = new DrizzleStorage();