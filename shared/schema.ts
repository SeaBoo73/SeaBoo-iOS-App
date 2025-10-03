import { pgTable, serial, text, varchar, integer, timestamp, boolean, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 255 }).unique(),
  role: varchar("role", { length: 50 }).default("user"),
  businessName: varchar("business_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Boats table
export const boats = pgTable("boats", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  maxPersons: integer("max_persons"),
  pricePerDay: real("price_per_day").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  port: varchar("port", { length: 255 }),
  length: real("length"),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  ownerId: integer("owner_id"),
  hostId: integer("host_id"),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
  amenities: jsonb("amenities").$type<string[]>().default([]).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  pickupTime: varchar("pickup_time", { length: 50 }),
  returnTime: varchar("return_time", { length: 50 }),
  dailyReturnRequired: boolean("daily_return_required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  customerId: varchar("customer_id", { length: 255 }),
  boatId: integer("boat_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: real("total_price").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  guestCount: integer("guest_count"),
  specialRequests: text("special_requests"),
  paymentTransactionId: varchar("payment_transaction_id", { length: 255 }), // Apple transaction ID for IAP
  paymentProvider: varchar("payment_provider", { length: 50 }), // 'apple' or 'stripe'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Unique index to prevent receipt replay - ensures each Apple transaction can only be used once
  uniquePaymentTransaction: uniqueIndex("unique_payment_transaction").on(table.paymentTransactionId),
}));

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  boatId: integer("boat_id").notNull(),
  bookingId: integer("booking_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics table
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull(),
  views: integer("views").default(0).notNull(),
  bookings: integer("bookings").default(0).notNull(),
  revenue: varchar("revenue", { length: 50 }).default("0"),
  conversionRate: varchar("conversion_rate", { length: 50 }).default("0"),
  date: timestamp("date").defaultNow().notNull(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Boat = typeof boats.$inferSelect;
export type InsertBoat = typeof boats.$inferInsert;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserOnlySchema = insertUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  name: true,
  username: true,
  role: true,
});

export const insertOwnerSchema = insertUserSchema.extend({
  businessName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertBoatSchema = createInsertSchema(boats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface HealthResponse {
  status: string
  message: string
  timestamp?: string
}
