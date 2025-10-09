// Load environment variables first
import 'dotenv/config';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { IStorage } from './storage';

// Supabase client for server-side operations (admin)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// In-memory profile cache to reduce database queries
interface CachedProfile {
  data: any;
  expiresAt: number;
}

const profileCache = new Map<string, CachedProfile>();
const PROFILE_CACHE_TTL = 15000; // 15 seconds

export class SupabaseStorage implements IStorage {
  // Helper function to convert snake_case to camelCase for consistency with existing code
  private toCamelCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }

    const camelObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = this.toCamelCase(value);
    }
    return camelObj;
  }

  // Helper function to convert camelCase to snake_case for database operations
  private toSnakeCase(obj: any): any {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.toSnakeCase(item));
    }

    // JSONB fields that should preserve their nested structure without key conversion
    const jsonbFields = ['data', 'faqs', 'businessHours', 'gallery', 'theme', 'services', 'contact', 'meta'];

    const snakeObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      
      // If this is a JSONB field, preserve its value as-is without recursive conversion
      if (jsonbFields.includes(key)) {
        snakeObj[snakeKey] = value;
      } else {
        snakeObj[snakeKey] = this.toSnakeCase(value);
      }
    }
    return snakeObj;
  }

  // Profiles
  async createProfile(profile: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert(this.toSnakeCase(profile))
        .select()
        .single();

      if (error) throw error;

      const result = this.toCamelCase(data);
      
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      
      const result = data ? this.toCamelCase(data) : undefined;
      
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
      const { data, error } = await supabase
        .from('profiles')
        .update(this.toSnakeCase(updates))
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      
      const result = this.toCamelCase(data);
      
      // Invalidate cache on update
      profileCache.delete(userId);
      
      return result;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  // Pages
  async createPage(page: any): Promise<any> {
    try {
      const pageData = this.toSnakeCase({ 
        ...page, 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('pages')
        .insert(pageData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create page error:", error);
      throw error;
    }
  }

  async getPage(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error("Get page error:", error);
      return undefined;
    }
  }

  async getPageBySlug(slug: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error("Get page by slug error:", error);
      return undefined;
    }
  }

  async getPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('owner_id', ownerId);

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get pages error:", error);
      return [];
    }
  }

  async updatePage(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = this.toSnakeCase({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('pages')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Update page error:", error);
      throw error;
    }
  }

  async deletePage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete page error:", error);
      return false;
    }
  }

  // Services
  async createService(service: any): Promise<any> {
    try {
      const serviceData = this.toSnakeCase({ 
        ...service, 
        created_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create service error:", error);
      throw error;
    }
  }

  async getServicesByPageId(pageId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('page_id', pageId);

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get services by page ID error:", error);
      return [];
    }
  }

  async updateService(id: string, updates: any): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(this.toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Update service error:", error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete service error:", error);
      return false;
    }
  }

  // Staff methods
  async createStaff(staff: any): Promise<any> {
    try {
      const staffData = this.toSnakeCase({ 
        ...staff, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('staff')
        .insert(staffData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create staff error:", error);
      throw error;
    }
  }

  async getStaffById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error("Get staff by ID error:", error);
      return undefined;
    }
  }

  async getStaffByPageId(pageId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get staff by page ID error:", error);
      return [];
    }
  }

  async updateStaff(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = this.toSnakeCase({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('staff')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Update staff error:", error);
      throw error;
    }
  }

  async deleteStaff(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete staff error:", error);
      return false;
    }
  }

  // Appointments
  async createAppointment(appointment: any): Promise<any> {
    try {
      const appointmentData = this.toSnakeCase({ 
        ...appointment, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create appointment error:", error);
      throw error;
    }
  }

  async getAppointmentById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error("Get appointment by ID error:", error);
      return undefined;
    }
  }

  async getAppointmentsByOwner(ownerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get appointments by owner error:", error);
      return [];
    }
  }

  async updateAppointment(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = this.toSnakeCase({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Update appointment error:", error);
      throw error;
    }
  }

  // Payments
  async createPayment(payment: any): Promise<any> {
    try {
      const paymentData = this.toSnakeCase({ 
        ...payment, 
        created_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('payments_demo')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create payment error:", error);
      throw error;
    }
  }

  async getPaymentsByUser(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payments_demo')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get payments by user error:", error);
      return [];
    }
  }

  async getAllRecentPayments(limit: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('payments_demo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get all recent payments error:", error);
      return [];
    }
  }

  // Reviews
  async createReview(review: any): Promise<any> {
    try {
      const reviewData = this.toSnakeCase({ 
        ...review, 
        created_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create review error:", error);
      throw error;
    }
  }

  async getReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('page_id', pageId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get reviews by page ID error:", error);
      return [];
    }
  }

  async getApprovedReviewsByPageId(pageId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_approved', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get approved reviews by page ID error:", error);
      return [];
    }
  }

  async updateReview(id: string, updates: any): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(this.toSnakeCase(updates))
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Update review error:", error);
      throw error;
    }
  }

  // Subscriptions
  async createSubscription(subscription: any): Promise<any> {
    try {
      const subscriptionData = this.toSnakeCase({ 
        ...subscription, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create subscription error:", error);
      throw error;
    }
  }

  async getSubscription(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error("Get subscription error:", error);
      return undefined;
    }
  }

  async getSubscriptionsByUser(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get subscriptions by user error:", error);
      return [];
    }
  }

  async updateSubscription(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData = this.toSnakeCase({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      });
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Update subscription error:", error);
      throw error;
    }
  }

  async cancelSubscription(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'CANCELLED', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      return false;
    }
  }

  // Demo Pages
  async createDemoPage(demoData: any, ownerId?: string): Promise<any> {
    try {
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
      
      const { data, error } = await supabase
        .from('demo_pages')
        .insert(demoPageData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create demo page error:", error);
      throw error;
    }
  }

  async getDemoPage(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('demo_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error("Get demo page error:", error);
      return undefined;
    }
  }

  async getDemoPagesByOwner(ownerId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('demo_pages')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => this.toCamelCase(item));
    } catch (error) {
      console.error("Get demo pages by owner error:", error);
      return [];
    }
  }

  async deleteDemoPage(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('demo_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Delete demo page error:", error);
      return false;
    }
  }

  async atomicConvertDemo(demoId: string, convertToken: string): Promise<any | null> {
    try {
      // First check if token is valid and not already used
      const { data: demoPage, error: fetchError } = await supabase
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
      if (demoPage.expires_at && now > new Date(demoPage.expires_at)) {
        return null; // Expired
      }
      
      // Mark token as used by setting it to null
      const { data: updatedDemo, error: updateError } = await supabase
        .from('demo_pages')
        .update({ convert_token: null })
        .eq('id', demoId)
        .eq('convert_token', convertToken)
        .select()
        .single();
      
      if (updateError) throw updateError;
      
      return updatedDemo ? this.toCamelCase(updatedDemo) : null;
    } catch (error) {
      console.error("Atomic convert demo error:", error);
      return null;
    }
  }

  async associateDemoWithUser(demoId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('demo_pages')
        .update({ owner_id: userId })
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
      // Generate a UUID for demo user
      const demoUserId = crypto.randomUUID();
      
      const profileData = {
        id: demoUserId,
        email,
        full_name: fullName || 'Demo User',
        membership_status: 'demo',
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error("Create demo user error:", error);
      throw error;
    }
  }

  // Orders (for Razorpay payment verification)
  // Store order data temporarily in memory with database backup for persistence
  private orderCache = new Map<string, any>();

  async createOrder(order: any): Promise<any> {
    try {
      const orderData = {
        ...order,
        createdAt: new Date().toISOString()
      };
      
      // Store in memory cache for quick verification
      this.orderCache.set(order.orderId, orderData);
      
      // Also store as backup in payments table for persistence
      await this.createPayment({
        userId: order.userId,
        plan: order.plan,
        amount: order.amount.toString(),
        status: "pending_verification",
        paymentId: order.orderId,
        paymentMethod: "razorpay_order",
        meta: {
          orderId: order.orderId,
          isOrderVerification: true,
          used: false,
          currency: order.currency,
          createdAt: orderData.createdAt
        }
      });
      
      return orderData;
    } catch (error) {
      console.error("Create order error:", error);
      throw error;
    }
  }

  async getOrder(id: string): Promise<any | undefined> {
    try {
      // First try memory cache
      const cached = this.orderCache.get(id);
      if (cached) return cached;
      
      // Fallback to database backup
      const { data, error } = await supabase
        .from('payments_demo')
        .select('*')
        .eq('payment_id', id)
        .eq('status', 'pending_verification')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data && data.meta && data.meta.isOrderVerification) {
        const orderData = {
          orderId: data.payment_id,
          userId: data.user_id,
          plan: data.plan,
          amount: parseFloat(data.amount),
          currency: data.meta.currency || 'USD',
          createdAt: data.meta.createdAt,
          used: data.status === 'used' || data.meta.used || false
        };
        
        // Only cache non-used orders to avoid replay
        if (!orderData.used) {
          this.orderCache.set(id, orderData);
        }
        return orderData;
      }
      
      return undefined;
    } catch (error) {
      console.error("Get order error:", error);
      return undefined;
    }
  }

  async updateOrder(id: string, updates: any): Promise<any | undefined> {
    try {
      // Update memory cache
      const cached = this.orderCache.get(id);
      if (cached) {
        const updated = { ...cached, ...updates };
        this.orderCache.set(id, updated);
        
        // CRITICAL: Also persist to database to prevent replay attacks after restart
        if (updates.used) {
          // Fetch existing record to merge meta data
          const { data: existingRecord } = await supabase
            .from('payments_demo')
            .select('meta')
            .eq('payment_id', id)
            .eq('status', 'pending_verification')
            .single();
          
          // Merge existing meta with used flag
          const updatedMeta = {
            ...(existingRecord?.meta || {}),
            used: true,
            usedAt: new Date().toISOString()
          };
          
          // Mark order as used in database backup
          const { data, error } = await supabase
            .from('payments_demo')
            .update({
              status: 'used',
              meta: updatedMeta
            })
            .eq('payment_id', id)
            .eq('status', 'pending_verification')
            .select('id');
          
          if (error || !data || data.length !== 1) {
            console.error('Failed to persist order used flag:', error || 'No rows affected');
            throw new Error('Failed to prevent payment replay - security risk');
          }
          
          // Clean up cache after successful DB update
          setTimeout(() => this.orderCache.delete(id), 2000);
        }
        
        return updated;
      }
      
      return undefined;
    } catch (error) {
      console.error("Update order error:", error);
      return undefined;
    }
  }

  // ============= NOTES =============
  
  async createNote(note: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: note.userId,
          title: note.title,
          content: note.content || '',
        }])
        .select()
        .single();

      if (error) throw error;
      return this.toCamelCase(data);
    } catch (error) {
      console.error('Create note error:', error);
      throw error;
    }
  }

  async getNoteById(id: string): Promise<any | undefined> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error('Get note by ID error:', error);
      return undefined;
    }
  }

  async getNotesByUser(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data ? data.map(note => this.toCamelCase(note)) : [];
    } catch (error) {
      console.error('Get notes by user error:', error);
      return [];
    }
  }

  async updateNote(id: string, updates: any): Promise<any | undefined> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.content !== undefined) updateData.content = updates.content;

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? this.toCamelCase(data) : undefined;
    } catch (error) {
      console.error('Update note error:', error);
      return undefined;
    }
  }

  async deleteNote(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Delete note error:', error);
      return false;
    }
  }
}

console.log("✅ SupabaseStorage class ready");