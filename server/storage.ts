import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables are required");
}

console.log("Server storage initialized with Supabase successfully");
console.log("Supabase URL:", supabaseUrl);
console.log("Using service role key:", supabaseServiceKey ? "✓ Present" : "✗ Missing");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize tables if they don't exist
async function initializeTables() {
  try {
    // Create profiles table
    await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          full_name text,
          membership_status text DEFAULT 'free',
          membership_plan text,
          membership_expires timestamptz,
          created_at timestamptz DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS public.pages (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          owner_id uuid REFERENCES public.profiles(id),
          title text NOT NULL,
          slug text UNIQUE NOT NULL,
          tagline text,
          logo_url text,
          primary_color text DEFAULT '#2563eb',
          calendar_link text,
          data jsonb,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS public.services (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
          name text NOT NULL,
          description text,
          duration_minutes integer NOT NULL,
          price numeric NOT NULL,
          created_at timestamptz DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS public.appointments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
          owner_id uuid REFERENCES public.profiles(id),
          service_id uuid REFERENCES public.services(id),
          customer_name text NOT NULL,
          customer_email text,
          customer_phone text NOT NULL,
          date date NOT NULL,
          time text NOT NULL,
          status text DEFAULT 'pending',
          notes text,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS public.payments_demo (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid REFERENCES public.profiles(id),
          plan text,
          amount numeric,
          status text,
          razorpay_order_id text,
          razorpay_payment_id text,
          meta jsonb,
          created_at timestamptz DEFAULT now()
        );
      `
    });
    console.log("✅ Database tables initialized successfully");
    
    // Refresh PostgREST schema cache
    await supabase.rpc('execute_sql', {
      query: "NOTIFY pgrst, 'reload schema';"
    });
    console.log("✅ PostgREST schema cache refreshed");
  } catch (error) {
    console.error("❌ Failed to initialize tables:", error);
  }
}

// Initialize tables on startup
initializeTables();

// Helper functions to convert between camelCase and snake_case
function camelToSnake(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = camelToSnake(obj[key]);
  });
  return result;
}

function snakeToCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = snakeToCamel(obj[key]);
  });
  return result;
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
}

export class SupabaseStorage implements IStorage {
  async createProfile(profile: any): Promise<any> {
    const snakeProfile = camelToSnake(profile);
    const { data, error } = await supabase
      .from('profiles')
      .insert(snakeProfile)
      .select()
      .single();
    
    if (error) throw error;
    return snakeToCamel(data);
  }

  async getProfile(userId: string): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data ? snakeToCamel(data) : undefined;
  }

  async updateProfile(userId: string, updates: any): Promise<any | undefined> {
    const snakeUpdates = camelToSnake(updates);
    const { data, error } = await supabase
      .from('profiles')
      .update(snakeUpdates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async createPage(page: any): Promise<any> {
    const snakePage = camelToSnake({ ...page, createdAt: new Date(), updatedAt: new Date() });
    const { data, error } = await supabase
      .from('pages')
      .insert(snakePage)
      .select()
      .single();
    
    if (error) throw error;
    return snakeToCamel(data);
  }

  async getPage(id: string): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async getPageBySlug(slug: string): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async getPagesByOwner(ownerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(snakeToCamel) : [];
  }

  async updatePage(id: string, updates: any): Promise<any | undefined> {
    const snakeUpdates = camelToSnake({ ...updates, updatedAt: new Date() });
    const { data, error } = await supabase
      .from('pages')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async deletePage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async createService(service: any): Promise<any> {
    const snakeService = camelToSnake(service);
    const { data, error } = await supabase
      .from('services')
      .insert(snakeService)
      .select()
      .single();
    
    if (error) throw error;
    return snakeToCamel(data);
  }

  async getServicesByPageId(pageId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('page_id', pageId);
    
    if (error) throw error;
    return data ? data.map(snakeToCamel) : [];
  }

  async updateService(id: string, updates: any): Promise<any | undefined> {
    const snakeUpdates = camelToSnake(updates);
    const { data, error } = await supabase
      .from('services')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    return !error;
  }

  async createAppointment(appointment: any): Promise<any> {
    const snakeAppointment = camelToSnake(appointment);
    const { data, error } = await supabase
      .from('appointments')
      .insert(snakeAppointment)
      .select()
      .single();
    
    if (error) throw error;
    return snakeToCamel(data);
  }

  async getAppointmentById(id: string): Promise<any | undefined> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async getAppointmentsByOwner(ownerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (name)
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(item => {
      // Handle the nested services name
      const converted = snakeToCamel(item);
      if (item.services) {
        converted.serviceName = item.services.name;
      }
      return converted;
    }) : [];
  }

  async updateAppointment(id: string, updates: any): Promise<any | undefined> {
    const snakeUpdates = camelToSnake({ ...updates, updatedAt: new Date() });
    const { data, error } = await supabase
      .from('appointments')
      .update(snakeUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data ? snakeToCamel(data) : undefined;
  }

  async createPayment(payment: any): Promise<any> {
    const snakePayment = camelToSnake(payment);
    const { data, error } = await supabase
      .from('payments_demo')
      .insert(snakePayment)
      .select()
      .single();
    
    if (error) throw error;
    return snakeToCamel(data);
  }

  async getPaymentsByUser(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payments_demo')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data ? data.map(snakeToCamel) : [];
  }
}

export const storage = new SupabaseStorage();