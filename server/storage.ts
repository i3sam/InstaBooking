// Storage interface and implementation
import { SupabaseStorage } from './supabase-storage';

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

// Initialize storage instance with SupabaseStorage
export const storage = new SupabaseStorage();