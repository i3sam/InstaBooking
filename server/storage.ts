// Load environment variables first
import 'dotenv/config';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { profiles, pages, services, appointments, paymentsDemo, reviews, subscriptions, demoPages } from '@shared/schema';

// Lazy initialize database connection
let db: ReturnType<typeof drizzle> | null = null;

// Supabase client for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseServiceKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Storage Supabase client initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize Supabase client in storage:", error);
  }
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
    // Use the proper DATABASE_URL which contains the correct PostgreSQL connection string
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    
    console.log("Server storage initialized with Supabase PostgreSQL successfully");
    const client = postgres(connectionString);
    db = drizzle(client);
    
    // Test database connection
    testConnection();
  }
  return db;
}

// Ensure database schema is up to date
async function ensureSchema() {
  try {
    // Add location_link column if it doesn't exist
    await getDb().execute(sql`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "location_link" text;`);
    console.log("✅ Schema migration: location_link column ensured");
    
    // Add email column to profiles if it doesn't exist
    await getDb().execute(sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "email" text;`);
    console.log("✅ Schema migration: profiles.email column ensured");
    
    // Add owner_id column to demo_pages if it doesn't exist
    await getDb().execute(sql`ALTER TABLE "demo_pages" ADD COLUMN IF NOT EXISTS "owner_id" uuid;`);
    console.log("✅ Schema migration: demo_pages.owner_id column ensured");
  } catch (error) {
    console.error("⚠️  Schema migration error:", error);
  }
}

// Test database connection
async function testConnection() {
  try {
    // First ensure schema is up to date
    await ensureSchema();
    
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
      // Get regular booking pages
      const regularPages = await getDb()
        .select()
        .from(pages)
        .where(eq(pages.ownerId, ownerId))
        .orderBy(desc(pages.createdAt));

      // Get demo pages
      const demoPageResults = await getDb()
        .select()
        .from(demoPages)
        .where(eq(demoPages.ownerId, ownerId))
        .orderBy(desc(demoPages.createdAt));

      // Transform demo pages to match the regular pages structure
      const transformedDemoPages = demoPageResults.map(demoPage => {
        const demoData = demoPage.data || {};
        const now = new Date();
        const isExpired = demoPage.expiresAt && new Date(demoPage.expiresAt) <= now;
        
        return {
          id: demoPage.id,
          slug: demoPage.id, // Use demo ID as slug for now
          title: demoData.businessName || 'Demo Page',
          tagline: demoData.businessDescription || 'Demo booking page',
          businessName: demoData.businessName,
          businessDescription: demoData.businessDescription,
          logoUrl: demoData.logoUrl,
          primaryColor: demoData.primaryColor,
          ownerId: demoPage.ownerId,
          published: false, // Demo pages are never published
          createdAt: demoPage.createdAt,
          updatedAt: demoPage.updatedAt,
          isDemoPage: true, // Flag to identify demo pages
          isExpired: isExpired, // Flag for expired demos
          expiresAt: demoPage.expiresAt,
          convertToken: demoPage.convertToken
        };
      });

      // Combine and sort by creation date
      const allPages = [...regularPages, ...transformedDemoPages];
      allPages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allPages;
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

  async createSubscription(subscription: any): Promise<any> {
    try {
      const [result] = await getDb().insert(subscriptions).values(subscription).returning();
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
      return results;
    } catch (error) {
      console.error("Get subscriptions by user error:", error);
      throw error;
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
      await this.updateSubscription(id, { status: 'CANCELLED' });
      return true;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return false;
    }
  }

  async createDemoPage(demoData: any, ownerId?: string): Promise<any> {
    try {
      // Generate secure convert token
      const convertToken = crypto.randomUUID();
      
      // Set server-side expiry (7 days for demo users, 24 hours for anonymous)
      const expiryHours = ownerId ? 7 * 24 : 24; // 7 days for demo users, 24 hours for anonymous
      const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
      
      const demoPageData = {
        ownerId: ownerId || null,
        data: demoData,
        convertToken: convertToken,
        createdAt: new Date(),
        expiresAt: expiresAt
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

  async deleteDemoPage(id: string): Promise<boolean> {
    try {
      await getDb().delete(demoPages).where(eq(demoPages.id, id));
      return true;
    } catch (error) {
      console.error("Delete demo page error:", error);
      return false;
    }
  }

  async getDemoPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const results = await getDb().select().from(demoPages).where(eq(demoPages.ownerId, ownerId)).orderBy(desc(demoPages.createdAt));
      return results;
    } catch (error) {
      console.error("Get demo pages by owner error:", error);
      return [];
    }
  }

  async atomicConvertDemo(demoId: string, convertToken: string): Promise<any | null> {
    try {
      // Atomically validate and invalidate the demo in a single operation
      const [result] = await getDb()
        .update(demoPages)
        .set({ convertToken: null }) // Invalidate token
        .where(
          sql`${demoPages.id} = ${demoId} 
              AND ${demoPages.convertToken} = ${convertToken} 
              AND ${demoPages.expiresAt} > NOW()`
        )
        .returning();
      
      return result || null;
    } catch (error) {
      console.error("Atomic convert demo error:", error);
      return null;
    }
  }

  async createDemoUser(email: string, fullName?: string): Promise<any> {
    try {
      if (!supabase) {
        throw new Error("Supabase not configured - cannot create demo user");
      }
      
      // Check if user already exists first
      const { data: existingUsers } = await supabase.auth.admin.listUsers({
        filter: `email:${email}`
      });
      
      let authUser;
      let magicLink;
      
      if (existingUsers?.users && existingUsers.users.length > 0) {
        // User already exists, use existing user
        authUser = existingUsers.users[0];
        console.log("Demo user already exists, using existing user:", email);
        
        // Generate magic link for existing user
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email
        });
        
        if (!linkError && linkData) {
          magicLink = linkData.properties?.action_link;
        }
      } else {
        // Create new Supabase user with admin API
        const { data: newUserData, error: authError } = await supabase.auth.admin.createUser({
          email: email,
          email_confirm: true, // Auto-confirm email for demo users
          user_metadata: {
            full_name: fullName || email.split('@')[0]
          }
        });
        
        if (authError || !newUserData.user) {
          console.error("Failed to create Supabase user:", authError);
          throw new Error(authError?.message || "Failed to create demo user");
        }
        
        authUser = newUserData.user;
        
        // Generate magic link for new user
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email
        });
        
        if (!linkError && linkData) {
          magicLink = linkData.properties?.action_link;
        }
      }
      
      // Create or update profile in our database
      const profileData = {
        id: authUser.id,
        email: email,
        fullName: fullName || authUser.user_metadata?.full_name || email.split('@')[0],
        membershipStatus: 'demo'
      };
      
      // Use upsert pattern to handle both new and existing users
      const [result] = await getDb()
        .insert(profiles)
        .values(profileData)
        .onConflictDoUpdate({
          target: [profiles.id],
          set: {
            email: profileData.email,
            fullName: profileData.fullName,
            membershipStatus: 'demo'
          }
        })
        .returning();
      
      // Cache the profile
      const now = Date.now();
      profileCache.set(result.id, {
        data: result,
        expiresAt: now + PROFILE_CACHE_TTL
      });
      
      return {
        ...result,
        supabaseUser: authUser,
        magicLink: magicLink
      };
    } catch (error) {
      console.error("Create demo user error:", error);
      throw error;
    }
  }
}

export const storage = new DrizzleStorage();