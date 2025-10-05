import { supabase } from './supabase';

/**
 * Direct Supabase client operations for public and user-owned data
 * These operations bypass the API layer and use RLS policies for security
 */

// Public page operations for booking pages
export async function getPublicPageBySlug(slug: string) {
  if (!slug) return null;
  
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error) {
      console.error('Error fetching public page:', error);
      return null;
    }

    // Convert snake_case to camelCase for frontend consistency
    if (!data) return null;
    
    return {
      ...data,
      ownerId: data.owner_id,
      logoUrl: data.logo_url,
      primaryColor: data.primary_color,
      backgroundType: data.background_type,
      backgroundValue: data.background_value,
      fontFamily: data.font_family,
      calendarLink: data.calendar_link,
      locationLink: data.location_link,
      acceptReviews: data.accept_reviews,
      businessHours: data.business_hours,
      contactPhone: data.contact_phone,
      contactEmail: data.contact_email,
      businessAddress: data.business_address,
      cancellationPolicy: data.cancellation_policy,
      showBusinessHours: data.show_business_hours,
      showContactInfo: data.show_contact_info,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in getPublicPageBySlug:', error);
    return null;
  }
}

// Public services for a published page
export async function getPublicServicesByPageId(pageId: string) {
  if (!pageId) return [];
  
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching public services:', error);
      return [];
    }

    // Convert snake_case to camelCase for frontend consistency
    return (data || []).map((service: any) => ({
      id: service.id,
      pageId: service.page_id,
      name: service.name,
      description: service.description,
      imageUrl: service.image_url,
      durationMinutes: service.duration_minutes,
      price: service.price,
      currency: service.currency,
      createdAt: service.created_at
    }));
  } catch (error) {
    console.error('Error in getPublicServicesByPageId:', error);
    return [];
  }
}

// Public approved reviews for a page
export async function getPublicReviewsByPageId(pageId: string) {
  if (!pageId) return [];
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_approved', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching public reviews:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPublicReviewsByPageId:', error);
    return [];
  }
}

// Public staff for a published page
export async function getPublicStaffByPageId(pageId: string) {
  if (!pageId) return [];
  
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('page_id', pageId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching public staff:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPublicStaffByPageId:', error);
    return [];
  }
}

// User's own profile (RLS enforced)
export async function getUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// User's own pages (RLS enforced)
export async function getUserPages() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user pages:', error);
      return [];
    }

    // Convert snake_case to camelCase for frontend consistency
    return (data || []).map((page: any) => ({
      ...page,
      ownerId: page.owner_id,
      logoUrl: page.logo_url,
      primaryColor: page.primary_color,
      backgroundType: page.background_type,
      backgroundValue: page.background_value,
      fontFamily: page.font_family,
      calendarLink: page.calendar_link,
      locationLink: page.location_link,
      acceptReviews: page.accept_reviews,
      businessHours: page.business_hours,
      contactPhone: page.contact_phone,
      contactEmail: page.contact_email,
      businessAddress: page.business_address,
      cancellationPolicy: page.cancellation_policy,
      showBusinessHours: page.show_business_hours,
      showContactInfo: page.show_contact_info,
      createdAt: page.created_at,
      updatedAt: page.updated_at
    }));
  } catch (error) {
    console.error('Error in getUserPages:', error);
    return [];
  }
}

// User's own appointments (RLS enforced)
export async function getUserAppointments() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services(name, price)
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user appointments:', error);
      return [];
    }

    // Convert snake_case to camelCase and add serviceName
    const formattedData = (data || []).map((appointment: any) => ({
      id: appointment.id,
      pageId: appointment.page_id,
      ownerId: appointment.owner_id,
      serviceId: appointment.service_id,
      customerName: appointment.customer_name,
      customerEmail: appointment.customer_email,
      customerPhone: appointment.customer_phone,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at,
      serviceName: appointment.services?.name || 'Service',
      servicePrice: appointment.services?.price || 0
    }));

    return formattedData;
  } catch (error) {
    console.error('Error in getUserAppointments:', error);
    return [];
  }
}

// Get services for a user's page (for page editing)
export async function getUserPageServices(pageId: string) {
  if (!pageId) return [];
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    // First verify the user owns this page
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('id', pageId)
      .eq('owner_id', user.id)
      .single();
      
    if (!page) {
      console.warn('User does not own this page or page not found');
      return [];
    }

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('page_id', pageId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching page services:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPageServices:', error);
    return [];
  }
}