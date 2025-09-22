// Load environment variables first
import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase client for admin operations
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

// Test Supabase connection
async function testConnection() {
  try {
    if (!supabase) {
      console.log("⚠️  Supabase client not initialized - cannot test connection");
      return;
    }
    
    // Simple query to test connection
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    if (error) {
      console.log("⚠️  Supabase connection test error:", error.message);
    } else {
      console.log("✅ Supabase connection successful");
    }
  } catch (error) {
    console.log("⚠️  Supabase connection test error (may be normal on startup):", error);
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

export class SupabaseStorage implements IStorage {
  private ensureSupabase() {
    if (!supabase) {
      throw new Error("Supabase client not initialized. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.");
    }
    return supabase;
  }

  async createProfile(profile: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('profiles').insert(profile).select().single();
      
      if (error) throw error;
      
      // Cache the newly created profile
      const now = Date.now();
      profileCache.set(data.id, {
        data,
        expiresAt: now + PROFILE_CACHE_TTL
      });
      
      return data;
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

      const client = this.ensureSupabase();
      const { data, error } = await client.from('profiles').select('*').eq('id', userId).single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return undefined;
        }
        throw error;
      }
      
      // Cache the result
      if (data) {
        profileCache.set(userId, {
          data,
          expiresAt: now + PROFILE_CACHE_TTL
        });
      }
      
      return data;
    } catch (error) {
      console.error("Get profile error:", error);
      return undefined;
    }
  }

  async updateProfile(userId: string, updates: any): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('profiles').update(updates).eq('id', userId).select().single();
      
      if (error) throw error;
      
      // Invalidate cache on update
      profileCache.delete(userId);
      
      return data;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async createPage(page: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const pageData = { 
        ...page, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      };
      const { data, error } = await client.from('pages').insert(pageData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create page error:", error);
      throw error;
    }
  }

  async getPage(id: string): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('pages').select('*').eq('id', id).single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return undefined;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Get page error:", error);
      return undefined;
    }
  }

  async getPageBySlug(slug: string): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('pages').select('*').eq('slug', slug).single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return undefined;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Get page by slug error:", error);
      return undefined;
    }
  }

  async getPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('pages').select('*').eq('owner_id', ownerId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get pages error:", error);
      return [];
    }
  }

  async updatePage(id: string, updates: any): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const updateData = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await client.from('pages').update(updateData).eq('id', id).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Update page error:", error);
      throw error;
    }
  }

  async deletePage(id: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase();
      const { error } = await client.from('pages').delete().eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete page error:", error);
      return false;
    }
  }

  async createService(service: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const serviceData = { ...service, created_at: new Date().toISOString() };
      const { data, error } = await client.from('services').insert(serviceData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create service error:", error);
      throw error;
    }
  }

  async getServicesByPageId(pageId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('services').select('*').eq('page_id', pageId);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get services by page ID error:", error);
      return [];
    }
  }

  async updateService(id: string, updates: any): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('services').update(updates).eq('id', id).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Update service error:", error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase();
      const { error } = await client.from('services').delete().eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete service error:", error);
      return false;
    }
  }

  async createAppointment(appointment: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const appointmentData = { 
        ...appointment, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await client.from('appointments').insert(appointmentData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create appointment error:", error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('appointments').select('*').eq('id', id).single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return undefined;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Get appointment by ID error:", error);
      return undefined;
    }
  }

  async getAppointmentsByOwner(ownerId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('appointments').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get appointments by owner error:", error);
      return [];
    }
  }

  async updateAppointment(id: string, updates: any): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const updateData = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await client.from('appointments').update(updateData).eq('id', id).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Update appointment error:", error);
      throw error;
    }
  }

  async createPayment(payment: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const paymentData = { ...payment, created_at: new Date().toISOString() };
      const { data, error } = await client.from('payments_demo').insert(paymentData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  }

  async getPaymentsByUser(userId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('payments_demo').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get payments by user error:", error);
      return [];
    }
  }

  async createReview(review: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const reviewData = { ...review, created_at: new Date().toISOString() };
      const { data, error } = await client.from('reviews').insert(reviewData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  }

  async getReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('reviews').select('*').eq('page_id', pageId).order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get reviews by page ID error:", error);
      return [];
    }
  }

  async getApprovedReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('reviews').select('*').eq('page_id', pageId).eq('is_approved', 'approved').order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get approved reviews by page ID error:", error);
      return [];
    }
  }

  async updateReview(id: string, updates: any): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('reviews').update(updates).eq('id', id).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  }

  async createSubscription(subscription: any): Promise<any> {
    try {
      const client = this.ensureSupabase();
      const subscriptionData = { 
        ...subscription, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const { data, error } = await client.from('subscriptions').insert(subscriptionData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create subscription error:", error);
      throw error;
    }
  }

  async getSubscription(id: string): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('subscriptions').select('*').eq('id', id).single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return undefined;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Get subscription error:", error);
      return undefined;
    }
  }

  async getSubscriptionsByUser(userId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get subscriptions by user error:", error);
      return [];
    }
  }

  async updateSubscription(id: string, updates: any): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const updateData = { ...updates, updated_at: new Date().toISOString() };
      const { data, error } = await client.from('subscriptions').update(updateData).eq('id', id).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Update subscription error:", error);
      throw error;
    }
  }

  async cancelSubscription(id: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase();
      const { error } = await client.from('subscriptions').update({ status: 'CANCELLED', updated_at: new Date().toISOString() }).eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return false;
    }
  }

  async createDemoPage(demoData: any, ownerId?: string): Promise<any> {
    try {
      const client = this.ensureSupabase();
      
      const convertToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      const demoPageData = {
        owner_id: ownerId || null,
        data: demoData,
        convert_token: convertToken,
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };
      
      const { data, error } = await client.from('demo_pages').insert(demoPageData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create demo page error:", error);
      throw error;
    }
  }

  async getDemoPage(id: string): Promise<any | undefined> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('demo_pages').select('*').eq('id', id).single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return undefined;
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Get demo page error:", error);
      return undefined;
    }
  }

  async getDemoPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const client = this.ensureSupabase();
      const { data, error } = await client.from('demo_pages').select('*').eq('owner_id', ownerId).order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Get demo pages by owner error:", error);
      return [];
    }
  }

  async deleteDemoPage(id: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase();
      const { error } = await client.from('demo_pages').delete().eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete demo page error:", error);
      return false;
    }
  }

  async atomicConvertDemo(demoId: string, convertToken: string): Promise<any | null> {
    try {
      const client = this.ensureSupabase();
      
      // First check if token is valid and not already used
      const { data: demoPage, error: fetchError } = await client
        .from('demo_pages')
        .select('*')
        .eq('id', demoId)
        .eq('convert_token', convertToken)
        .single();
      
      if (fetchError || !demoPage) {
        return null; // Invalid token or already used
      }
      
      // Check if not expired
      const now = new Date();
      const expiresAt = new Date(demoPage.expires_at);
      if (now > expiresAt) {
        return null; // Expired
      }
      
      // Mark token as used by setting it to null
      const { data: updatedDemo, error: updateError } = await client
        .from('demo_pages')
        .update({ convert_token: null, updated_at: new Date().toISOString() })
        .eq('id', demoId)
        .eq('convert_token', convertToken)
        .select()
        .single();
      
      if (updateError || !updatedDemo) {
        return null; // Token already used by another request
      }
      
      return updatedDemo;
    } catch (error) {
      console.error("Atomic convert demo error:", error);
      return null;
    }
  }

  async associateDemoWithUser(demoId: string, userId: string): Promise<boolean> {
    try {
      const client = this.ensureSupabase();
      const { error } = await client
        .from('demo_pages')
        .update({ owner_id: userId, updated_at: new Date().toISOString() })
        .eq('id', demoId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Associate demo with user error:", error);
      return false;
    }
  }

  async createDemoUser(email: string, fullName?: string): Promise<any> {
    try {
      const client = this.ensureSupabase();
      
      // Generate a UUID for demo user
      const demoUserId = crypto.randomUUID();
      
      const profileData = {
        id: demoUserId,
        email,
        full_name: fullName || 'Demo User',
        membership_status: 'demo',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await client.from('profiles').insert(profileData).select().single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Create demo user error:", error);
      throw error;
    }
  }
}

// Initialize storage instance
export const storage = new SupabaseStorage();

// Test connection on startup
testConnection();