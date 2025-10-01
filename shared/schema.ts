import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, timestamp, jsonb, numeric, integer, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // This will be the Supabase auth.users.id
  email: text("email"), // Store email for demo users
  fullName: text("full_name"),
  createdAt: timestamp("created_at").default(sql`now()`),
  membershipStatus: text("membership_status").default("free"), // free | demo | pro
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
  gallery: jsonb("gallery").default(sql`'{"logos": [], "banners": [], "images": []}'`), // Gallery object with logos, banners, and images arrays
  data: jsonb("data"),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const demoPages = pgTable("demo_pages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: uuid("owner_id").references(() => profiles.id), // Associate demo with user
  data: jsonb("data").notNull(), // Contains the demo page configuration
  convertToken: text("convert_token"), // Secure token for conversion (null when used)
  createdAt: timestamp("created_at").default(sql`now()`),
  expiresAt: timestamp("expires_at").default(sql`now() + interval '7 days'`),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  durationMinutes: integer("duration_minutes").notNull(),
  price: numeric("price").notNull(),
  currency: text("currency").default("USD").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  pageId: uuid("page_id").references(() => pages.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  position: text("position"),
  email: text("email"),
  phone: text("phone"),
  displayOrder: integer("display_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
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
  reviewerName: text("reviewer_name").notNull(),
  reviewerEmail: text("reviewer_email"),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  status: text("status").default("pending"), // Keep existing status column
  isApproved: text("is_approved").default("pending"), // pending|approved|rejected
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const paymentsDemo = pgTable("payments_demo", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => profiles.id),
  amount: numeric("amount"),
  currency: text("currency"),
  status: text("status"),
  paymentIntentId: text("payment_intent_id"), // Legacy Stripe field
  subscriptionId: text("subscription_id"), // Legacy subscription field
  plan: text("plan"),
  paypalOrderId: text("paypal_order_id"), // Legacy field - PayPal no longer used
  paypalPaymentId: text("paypal_payment_id"), // Legacy field - PayPal no longer used
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(), // Legacy PayPal subscription ID - PayPal no longer used
  userId: uuid("user_id").references(() => profiles.id),
  status: text("status").notNull(), // APPROVAL_PENDING|ACTIVE|CANCELLED|SUSPENDED|EXPIRED
  planId: text("plan_id").notNull(), // Legacy PayPal plan ID - PayPal no longer used
  currentPeriodStart: timestamp("current_period_start"), // Keep existing column
  currentPeriodEnd: timestamp("current_period_end"), // Keep existing column
  planName: text("plan_name"), // "pro", "premium", etc.
  currency: text("currency").default("USD"),
  amount: numeric("amount").notNull(),
  startTime: timestamp("start_time"),
  nextBillingTime: timestamp("next_billing_time"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Legacy tables that exist in the database - keep to prevent data loss
export const memberships = pgTable("memberships", {
  userId: uuid("user_id").primaryKey().references(() => profiles.id),
  active: boolean("active").default(true).notNull(),
  plan: text("plan"),
  purchasedAt: timestamp("purchased_at", { withTimezone: true }).default(sql`now()`).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

export const bookingPages = pgTable("booking_pages", {
  id: text("id").primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => profiles.id),
  slug: text("slug").notNull(),
  businessName: text("business_name").notNull(),
  tagline: text("tagline"),
  logoDataUrl: text("logo_data_url"),
  theme: jsonb("theme"),
  services: jsonb("services"),
  contact: jsonb("contact"),
  calendarUrl: text("calendar_url"),
  buttonText: text("button_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).default(sql`now()`),
  updatedAt: timestamp("updated_at", { withTimezone: true }).default(sql`now()`),
});

// Insert schemas (users are managed by Supabase auth)

export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
});

export const insertPageSchema = createInsertSchema(pages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  locationLink: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, {
    message: "Location link must be a valid URL (e.g., https://maps.google.com/...)"
  })
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertDemoPageSchema = createInsertSchema(demoPages).omit({
  id: true,
  createdAt: true,
  expiresAt: true,
});

// Types (User type managed by Supabase auth)
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Page = typeof pages.$inferSelect;
export type InsertPage = z.infer<typeof insertPageSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Payment = typeof paymentsDemo.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type DemoPage = typeof demoPages.$inferSelect;
export type InsertDemoPage = z.infer<typeof insertDemoPageSchema>;
