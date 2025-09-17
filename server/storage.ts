// Load environment variables first
import 'dotenv/config';

import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { eq, desc } from 'drizzle-orm';

// Enable connection caching for better performance
neonConfig.fetchConnectionCache = true;
neonConfig.poolQueryViaFetch = true;
import { profiles, pages, services, appointments, paymentsDemo, reviews } from '@shared/schema';

// Lazy initialize database connection
let db: ReturnType<typeof drizzle> | null = null;

// In-memory profile cache to reduce database queries
interface CachedProfile {
  data: any;
  expiresAt: number;
}

const profileCache = new Map<string, CachedProfile>();
const PROFILE_CACHE_TTL = 15000; // 15 seconds

function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    console.log("Server storage initialized with Drizzle ORM successfully");
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql);
    
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
    console.log("✅ Database connection successful");
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
      const results = await getDb().select().from(pages).where(eq(pages.ownerId, ownerId)).orderBy(desc(pages.createdAt));
      return results;
    } catch (error) {
      console.error("Get pages error:", error);
      throw error;
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
      const [result] = await getDb().insert(services).values(service).returning();
      return result;
    } catch (error) {
      console.error("Create service error:", error);
      throw error;
    }
  }

  async getServicesByPageId(pageId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(services).where(eq(services.pageId, pageId));
      return results;
    } catch (error) {
      console.error("Get services by page ID error:", error);
      throw error;
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
      const [result] = await getDb().insert(appointments).values(appointment).returning();
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
      return results;
    } catch (error) {
      console.error("Get appointments by owner error:", error);
      throw error;
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
      const [result] = await getDb().insert(paymentsDemo).values(payment).returning();
      return result;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  }

  async getPaymentsByUser(userId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(paymentsDemo).where(eq(paymentsDemo.userId, userId)).orderBy(desc(paymentsDemo.createdAt));
      return results;
    } catch (error) {
      console.error("Get payments by user error:", error);
      throw error;
    }
  }

  async createReview(review: any): Promise<any> {
    try {
      const [result] = await getDb().insert(reviews).values(review).returning();
      return result;
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  }

  async getReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(reviews).where(eq(reviews.pageId, pageId)).orderBy(desc(reviews.createdAt));
      return results;
    } catch (error) {
      console.error("Get reviews by page ID error:", error);
      throw error;
    }
  }

  async getApprovedReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(reviews)
        .where(eq(reviews.pageId, pageId) && eq(reviews.isApproved, 'approved'))
        .orderBy(desc(reviews.createdAt));
      return results;
    } catch (error) {
      console.error("Get approved reviews by page ID error:", error);
      throw error;
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
}

export const storage = new DrizzleStorage();