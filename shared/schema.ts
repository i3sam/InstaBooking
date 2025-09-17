import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, jsonb, numeric, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // This will be the Supabase auth.users.id
  fullName: text("full_name"),
  createdAt: timestamp("created_at").default(sql`now()`),
  membershipStatus: text("membership_status").default("free"), // free | pro
  membershipPlan: text("membership_plan"),
  membershipExpires: timestamp("membership_expires"),
});

export const pages = pgTable("pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: uuid("owner_id").references(() => profiles.id),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#2563eb"),
  theme: text("theme").default("Ocean Blue"),
  backgroundType: text("background_type").default("gradient"),
  backgroundValue: text("background_value").default("blue"),
  fontFamily: text("font_family").default("inter"),
  calendarLink: text("calendar_link"),
  locationLink: text("location_link"),
  faqs: jsonb("faqs").default(sql`'[]'`), // Array of {question: string, answer: string}
  acceptReviews: text("accept_reviews").default("true"), // "true" or "false" 
  businessHours: jsonb("business_hours").default(sql`'{"monday":"9:00-17:00","tuesday":"9:00-17:00","wednesday":"9:00-17:00","thursday":"9:00-17:00","friday":"9:00-17:00","saturday":"Closed","sunday":"Closed"}'`),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  businessAddress: text("business_address"),
  cancellationPolicy: text("cancellation_policy"),
  showBusinessHours: text("show_business_hours").default("true"),
  showContactInfo: text("show_contact_info").default("true"),
  data: jsonb("data"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").notNull(),
  price: numeric("price").notNull(),
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").references(() => profiles.id),
  serviceId: uuid("service_id").references(() => services.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  status: text("status").default("pending"), // pending|accepted|declined|rescheduled
  notes: text("notes"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  isApproved: text("is_approved").default("pending"), // pending|approved|rejected
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const paymentsDemo = pgTable("payments_demo", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => profiles.id),
  plan: text("plan"),
  amount: numeric("amount"),
  status: text("status"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas (users are managed by Supabase auth)

export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(paymentsDemo).omit({
  id: true,
  createdAt: true,
});

// Types (User type managed by Supabase auth)
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Payment = typeof paymentsDemo.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
