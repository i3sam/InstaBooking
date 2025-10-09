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
  getAllRecentPayments(limit: number): Promise<any[]>;
  
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
  
  // Orders (for Razorpay payment verification)
  createOrder(order: any): Promise<any>;
  getOrder(id: string): Promise<any | undefined>;
  updateOrder(id: string, updates: any): Promise<any | undefined>;
  
  // Demo Pages
  createDemoPage(demoData: any, ownerId?: string): Promise<any>;
  getDemoPage(id: string): Promise<any | undefined>;
  getDemoPagesByOwner(ownerId: string): Promise<any[]>;
  deleteDemoPage(id: string): Promise<boolean>;
  atomicConvertDemo(demoId: string, convertToken: string): Promise<any | null>;
  associateDemoWithUser(demoId: string, userId: string): Promise<boolean>;
  
  // Demo Users
  createDemoUser(email: string, fullName?: string): Promise<any>;
  
  // Staff
  createStaff(staff: any): Promise<any>;
  getStaffById(id: string): Promise<any | undefined>;
  getStaffByPageId(pageId: string): Promise<any[]>;
  updateStaff(id: string, updates: any): Promise<any | undefined>;
  deleteStaff(id: string): Promise<boolean>;
  
  // Notes
  createNote(note: any): Promise<any>;
  getNoteById(id: string): Promise<any | undefined>;
  getNotesByUser(userId: string): Promise<any[]>;
  updateNote(id: string, updates: any): Promise<any | undefined>;
  deleteNote(id: string): Promise<boolean>;
  
  // Google Tokens
  createGoogleToken(token: any): Promise<any>;
  getGoogleToken(userId: string): Promise<any | undefined>;
  updateGoogleToken(userId: string, updates: any): Promise<any | undefined>;
  deleteGoogleToken(userId: string): Promise<boolean>;
}

// Initialize storage instance with SupabaseStorage
export const storage = new SupabaseStorage();