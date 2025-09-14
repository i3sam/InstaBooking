import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";
import { 
  users, profiles, pages, services, appointments, paymentsDemo,
  type User, type InsertUser, type Profile, type InsertProfile, 
  type Page, type InsertPage, type Service, type InsertService,
  type Appointment, type InsertAppointment, type Payment, type InsertPayment
} from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  
  // Profiles
  createProfile(profile: InsertProfile): Promise<Profile>;
  getProfile(userId: string): Promise<Profile | undefined>;
  updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined>;
  
  // Pages
  createPage(page: InsertPage): Promise<Page>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  getPagesByOwner(ownerId: string): Promise<Page[]>;
  updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;
  
  // Services
  createService(service: InsertService): Promise<Service>;
  getServicesByPageId(pageId: string): Promise<Service[]>;
  updateService(id: string, updates: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
  
  // Appointments
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  getAppointmentsByOwner(ownerId: string): Promise<Appointment[]>;
  updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
}

export class DatabaseStorage implements IStorage {
  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const [created] = await db.insert(profiles).values(profile).returning();
    return created;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const [updated] = await db.update(profiles)
      .set(updates)
      .where(eq(profiles.id, userId))
      .returning();
    return updated;
  }

  async createPage(page: InsertPage): Promise<Page> {
    const [created] = await db.insert(pages).values({
      ...page,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return created;
  }

  async getPage(id: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.id, id));
    return page;
  }

  async getPageBySlug(slug: string): Promise<Page | undefined> {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug));
    return page;
  }

  async getPagesByOwner(ownerId: string): Promise<Page[]> {
    return await db.select().from(pages)
      .where(eq(pages.ownerId, ownerId))
      .orderBy(desc(pages.createdAt));
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page | undefined> {
    const [updated] = await db.update(pages)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pages.id, id))
      .returning();
    return updated;
  }

  async deletePage(id: string): Promise<boolean> {
    const result = await db.delete(pages).where(eq(pages.id, id));
    return result.rowCount > 0;
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async getServicesByPageId(pageId: string): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.pageId, pageId));
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service | undefined> {
    const [updated] = await db.update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount > 0;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointmentsByOwner(ownerId: string): Promise<any[]> {
    return await db.select({
      id: appointments.id,
      pageId: appointments.pageId,
      ownerId: appointments.ownerId,
      serviceId: appointments.serviceId,
      customerName: appointments.customerName,
      customerEmail: appointments.customerEmail,
      customerPhone: appointments.customerPhone,
      date: appointments.date,
      time: appointments.time,
      status: appointments.status,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      serviceName: services.name
    }).from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.ownerId, ownerId))
      .orderBy(desc(appointments.createdAt));
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updated] = await db.update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(paymentsDemo).values(payment).returning();
    return created;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db.select().from(paymentsDemo)
      .where(eq(paymentsDemo.userId, userId))
      .orderBy(desc(paymentsDemo.createdAt));
  }
}

export const storage = new DatabaseStorage();
