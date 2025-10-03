var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import Stripe2 from "stripe";
import cors from "cors";
import express3 from "express";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analytics: () => analytics,
  boats: () => boats,
  bookings: () => bookings,
  insertBoatSchema: () => insertBoatSchema,
  insertBookingSchema: () => insertBookingSchema,
  insertOwnerSchema: () => insertOwnerSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertUserOnlySchema: () => insertUserOnlySchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  reviews: () => reviews,
  users: () => users
});
import { pgTable, serial, text, varchar, integer, timestamp, boolean, real, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var boats = pgTable("boats", {
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
  images: jsonb("images").$type().default([]).notNull(),
  ownerId: integer("owner_id"),
  hostId: integer("host_id"),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
  amenities: jsonb("amenities").$type().default([]).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  active: boolean("active").default(true).notNull(),
  pickupTime: varchar("pickup_time", { length: 50 }),
  returnTime: varchar("return_time", { length: 50 }),
  dailyReturnRequired: boolean("daily_return_required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var bookings = pgTable("bookings", {
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
  paymentTransactionId: varchar("payment_transaction_id", { length: 255 }),
  // Apple transaction ID for IAP
  paymentProvider: varchar("payment_provider", { length: 50 }),
  // 'apple' or 'stripe'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
}, (table) => ({
  // Unique index to prevent receipt replay - ensures each Apple transaction can only be used once
  uniquePaymentTransaction: uniqueIndex("unique_payment_transaction").on(table.paymentTransactionId)
}));
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  boatId: integer("boat_id").notNull(),
  bookingId: integer("booking_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  boatId: integer("boat_id").notNull(),
  views: integer("views").default(0).notNull(),
  bookings: integer("bookings").default(0).notNull(),
  revenue: varchar("revenue", { length: 50 }).default("0"),
  conversionRate: varchar("conversion_rate", { length: 50 }).default("0"),
  date: timestamp("date").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserOnlySchema = insertUserSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  name: true,
  username: true,
  role: true
});
var insertOwnerSchema = insertUserSchema.extend({
  businessName: z.string().optional()
});
var loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
var insertBoatSchema = createInsertSchema(boats).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    const PgStore = connectPg(session);
    this.sessionStore = new PgStore({
      pool,
      tableName: "sessions"
    });
  }
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(userData) {
    const isAlreadyHashed = /^\$2[aby]\$/.test(userData.password);
    const hashedPassword = isAlreadyHashed ? userData.password : await bcrypt.hash(userData.password, 12);
    const username = userData.username || userData.email.split("@")[0];
    const [user] = await db.insert(users).values({
      ...userData,
      username,
      password: hashedPassword
    }).returning();
    return user;
  }
  async verifyPassword(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }
  // Boat operations
  async getBoats() {
    return await db.select().from(boats).where(eq(boats.active, true));
  }
  async getBoatsByOwner(ownerId) {
    return await db.select().from(boats).where(eq(boats.hostId, ownerId));
  }
  async getBoat(id) {
    const [boat] = await db.select().from(boats).where(eq(boats.id, id));
    return boat;
  }
  async createBoat(boatData) {
    const [boat] = await db.insert(boats).values(boatData).returning();
    return boat;
  }
  async updateBoat(id, boatData) {
    const [boat] = await db.update(boats).set(boatData).where(eq(boats.id, id)).returning();
    return boat;
  }
  async deleteBoat(id) {
    const result = await db.delete(boats).where(eq(boats.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // Booking operations
  async getBookingsByOwner(ownerId) {
    const results = await db.select({
      id: bookings.id,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      userId: bookings.userId,
      customerId: bookings.customerId,
      boatId: bookings.boatId,
      startDate: bookings.startDate,
      endDate: bookings.endDate,
      totalPrice: bookings.totalPrice,
      status: bookings.status,
      guestCount: bookings.guestCount,
      specialRequests: bookings.specialRequests
    }).from(bookings).innerJoin(boats, eq(bookings.boatId, boats.id)).where(eq(boats.hostId, ownerId));
    return results;
  }
  async getBookingsByCustomer(customerId) {
    return await db.select().from(bookings).where(eq(bookings.customerId, customerId.toString()));
  }
  async createBooking(bookingData) {
    const [booking] = await db.insert(bookings).values(bookingData).returning();
    return booking;
  }
  async updateBookingStatus(id, status) {
    const [booking] = await db.update(bookings).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(bookings.id, id)).returning();
    return booking;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import session2 from "express-session";
import connectPg2 from "connect-pg-simple";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import bcrypt2 from "bcryptjs";
import appleSignin from "apple-signin-auth";
import { eq as eq2 } from "drizzle-orm";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil"
}) : null;
async function registerRoutes(app2) {
  const pgStore = connectPg2(session2);
  app2.use(session2({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || "seaboo-secret-key-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const requireAuth = (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Non autenticato" });
    }
    next();
  };
  app2.post("/api/register", async (req, res) => {
    try {
      const role = req.body.role || "user";
      let userData;
      if (role === "owner") {
        userData = insertOwnerSchema.parse(req.body);
      } else {
        userData = insertUserOnlySchema.parse(req.body);
      }
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email gi\xE0 registrata" });
      }
      const user = await storage.createUser(userData);
      req.session.user = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || void 0,
        lastName: user.lastName || void 0,
        role: user.role || "user",
        userType: user.role === "owner" ? "owner" : "customer",
        businessName: user.businessName || void 0
      };
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          userType: user.role === "owner" ? "owner" : "customer",
          businessName: user.businessName
        },
        redirectTo: role === "owner" ? "/owner/dashboard" : "/home"
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        error: error.message || "Errore durante la registrazione"
      });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      const user = await storage.verifyPassword(loginData.email, loginData.password);
      if (!user) {
        return res.status(401).json({ error: "Email o password non validi" });
      }
      req.session.user = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || void 0,
        lastName: user.lastName || void 0,
        role: user.role || "user",
        userType: user.role === "owner" ? "owner" : "customer",
        businessName: user.businessName || void 0
      };
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.role === "owner" ? "owner" : "customer"
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        error: error.message || "Errore durante il login"
      });
    }
  });
  app2.get("/api/user", (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Non autenticato" });
    }
  });
  app2.post("/api/auth/apple", async (req, res) => {
    try {
      const { identityToken, user: appleUser, nonce } = req.body;
      if (!identityToken) {
        return res.status(400).json({ error: "Token Apple mancante" });
      }
      const appleIdTokenPayload = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID || "it.seaboo.app",
        // Your app's bundle ID
        nonce,
        // Nonce for replay attack prevention
        ignoreExpiration: false
        // Enforce token expiration
      });
      const appleEmail = appleIdTokenPayload.email || appleUser?.email;
      const appleSub = appleIdTokenPayload.sub;
      if (!appleEmail) {
        return res.status(400).json({ error: "Email Apple non disponibile" });
      }
      let user = await storage.getUserByEmail(appleEmail);
      if (!user) {
        user = await storage.createUser({
          email: appleEmail,
          password: await bcrypt2.hash(Math.random().toString(36), 12),
          // Random password for Apple users
          firstName: appleUser?.name?.firstName || appleUser?.givenName,
          lastName: appleUser?.name?.lastName || appleUser?.familyName,
          role: "user",
          username: `apple_${appleSub.substring(0, 10)}`
          // Unique username from Apple ID
        });
      }
      req.session.user = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || void 0,
        lastName: user.lastName || void 0,
        role: user.role || "user",
        userType: "customer",
        businessName: user.businessName || void 0
      };
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: "customer"
        }
      });
    } catch (error) {
      console.error("Apple Sign In error:", error);
      res.status(401).json({
        error: "Token Apple non valido"
      });
    }
  });
  app2.post("/api/verify-purchase", async (req, res) => {
    try {
      const { receiptData, productId, transactionId, bookingId } = req.body;
      if (!receiptData) {
        return res.status(400).json({ error: "Receipt mancante" });
      }
      const verifyReceipt = async (receipt, sandbox = false) => {
        const url = sandbox ? "https://sandbox.itunes.apple.com/verifyReceipt" : "https://buy.itunes.apple.com/verifyReceipt";
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "receipt-data": receipt,
            "password": process.env.APP_STORE_SHARED_SECRET || ""
          })
        });
        return await response.json();
      };
      let result = await verifyReceipt(receiptData);
      if (result.status === 21007) {
        result = await verifyReceipt(receiptData, true);
      }
      if (result.status === 0) {
        const receiptInfo = result.receipt;
        const inAppPurchases = receiptInfo.in_app || [];
        if (!productId || !transactionId) {
          return res.status(400).json({
            error: "productId e transactionId sono obbligatori"
          });
        }
        const matchingTransaction = inAppPurchases.find(
          (purchase) => purchase.transaction_id === transactionId && purchase.product_id === productId
        );
        if (!matchingTransaction) {
          return res.status(400).json({
            error: "Transaction non corrispondente nel receipt"
          });
        }
        if (bookingId && req.session?.user) {
          try {
            const bookingIdNum = parseInt(bookingId);
            const appleTransactionId = matchingTransaction.original_transaction_id || transactionId;
            const existingTransactionBooking = await db.select().from(bookings).where(eq2(bookings.paymentTransactionId, appleTransactionId)).limit(1);
            if (existingTransactionBooking.length > 0) {
              console.warn(`\u26A0\uFE0F Receipt replay attempt blocked: transaction ${appleTransactionId} already used for booking ${existingTransactionBooking[0].id}`);
              return res.status(409).json({
                error: "Questa transazione Apple \xE8 gi\xE0 stata utilizzata",
                success: false
              });
            }
            const userBookings = await storage.getBookingsByCustomer(parseInt(req.session.user.id));
            const booking = userBookings.find((b) => b.id === bookingIdNum);
            if (!booking) {
              return res.status(404).json({
                error: "Booking non trovato o non autorizzato"
              });
            }
            if (booking.status === "confirmed") {
              return res.status(400).json({
                error: "Booking gi\xE0 confermato",
                success: false
              });
            }
            try {
              await db.update(bookings).set({
                status: "confirmed",
                paymentTransactionId: appleTransactionId,
                paymentProvider: "apple",
                updatedAt: /* @__PURE__ */ new Date()
              }).where(eq2(bookings.id, bookingIdNum));
              console.log(`\u2705 Booking ${bookingId} confirmed via IAP`, {
                userId: req.session.user.id,
                transactionId,
                originalTransactionId: appleTransactionId,
                productId,
                environment: result.environment
              });
            } catch (dbError) {
              if (dbError.code === "23505") {
                console.warn(`\u26A0\uFE0F Race condition blocked: transaction ${appleTransactionId} constraint violation`);
                return res.status(409).json({
                  error: "Questa transazione Apple \xE8 gi\xE0 stata utilizzata",
                  success: false
                });
              }
              throw dbError;
            }
          } catch (error) {
            console.error(`\u274C Failed to update booking ${bookingId}:`, error);
            return res.status(500).json({
              error: "Errore durante l'aggiornamento booking"
            });
          }
        }
        res.json({
          success: true,
          environment: result.environment || "Production",
          receipt: {
            bundle_id: receiptInfo.bundle_id,
            application_version: receiptInfo.application_version,
            original_purchase_date: receiptInfo.original_purchase_date
          },
          purchase: matchingTransaction || inAppPurchases[0],
          transactionId
        });
      } else {
        const errorMessages = {
          21e3: "App Store non pu\xF2 leggere il receipt",
          21002: "Dati del receipt malformati",
          21003: "Receipt non autenticato",
          21004: "Shared secret non corretto",
          21005: "Server receipt non disponibile",
          21006: "Receipt valido ma subscription scaduta",
          21007: "Receipt da sandbox in produzione",
          21008: "Receipt da produzione in sandbox"
        };
        res.status(400).json({
          error: errorMessages[result.status] || `Verifica fallita: codice ${result.status}`
        });
      }
    } catch (error) {
      console.error("Purchase verification error:", error);
      res.status(500).json({
        error: error.message || "Errore durante la verifica acquisto"
      });
    }
  });
  app2.post("/api/create-demo-account", async (req, res) => {
    try {
      const demoEmail = "demo@seaboo.it";
      const demoPassword = "SeaBooDemo2025!";
      const existing = await storage.getUserByEmail(demoEmail);
      if (existing) {
        return res.json({
          success: true,
          message: "Account demo gi\xE0 esistente",
          credentials: { email: demoEmail, password: demoPassword }
        });
      }
      const demoUser = await storage.createUser({
        email: demoEmail,
        password: demoPassword,
        firstName: "Demo",
        lastName: "User",
        role: "user"
      });
      res.json({
        success: true,
        message: "Account demo creato",
        credentials: { email: demoEmail, password: demoPassword },
        user: {
          id: demoUser.id,
          email: demoUser.email
        }
      });
    } catch (error) {
      console.error("Demo account creation error:", error);
      res.status(500).json({
        error: error.message || "Errore durante la creazione account demo"
      });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Errore durante il logout" });
      }
      res.json({ success: true });
    });
  });
  app2.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ error: "Utente non trovato" });
      }
      const { password, ...userProfile } = user;
      res.json({ user: userProfile });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Errore nel recupero del profilo" });
    }
  });
  const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 5 * 1024 * 1024 },
    // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Solo immagini sono permesse"));
      }
    }
  });
  const requireOwner = (req, res, next) => {
    if (!req.session?.user || req.session.user.role !== "owner") {
      return res.status(403).json({ error: "Accesso negato: solo per noleggiatori" });
    }
    next();
  };
  app2.get("/api/boats", async (req, res) => {
    try {
      console.log("Fetching boats...");
      const boats2 = await storage.getBoats();
      console.log("Boats fetched:", boats2?.length || 0, "boats");
      res.json({ boats: boats2 });
    } catch (error) {
      console.error("Get boats error:", error);
      res.status(500).json({ error: "Errore nel recupero delle barche" });
    }
  });
  app2.get("/api/owner/boats", requireAuth, requireOwner, async (req, res) => {
    try {
      const boats2 = await storage.getBoatsByOwner(req.session.user.id);
      res.json({ boats: boats2 });
    } catch (error) {
      console.error("Get owner boats error:", error);
      res.status(500).json({ error: "Errore nel recupero delle barche" });
    }
  });
  app2.post("/api/boats", requireAuth, requireOwner, upload.array("images", 5), async (req, res) => {
    try {
      const boatData = insertBoatSchema.parse({
        ...req.body,
        hostId: parseInt(req.session.user.id),
        images: req.files ? req.files.map((file) => `/uploads/${file.filename}`) : []
      });
      const boat = await storage.createBoat(boatData);
      res.json({ success: true, boat });
    } catch (error) {
      console.error("Create boat error:", error);
      res.status(400).json({ error: error.message || "Errore nella creazione della barca" });
    }
  });
  app2.put("/api/boats/:id", requireAuth, requireOwner, upload.array("images", 5), async (req, res) => {
    try {
      const { id } = req.params;
      const existingBoat = await storage.getBoat(id);
      if (!existingBoat || existingBoat.hostId !== parseInt(req.session.user.id)) {
        return res.status(404).json({ error: "Barca non trovata" });
      }
      const updateData = { ...req.body };
      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map((file) => `/uploads/${file.filename}`);
      }
      const boat = await storage.updateBoat(id, updateData);
      res.json({ success: true, boat });
    } catch (error) {
      console.error("Update boat error:", error);
      res.status(400).json({ error: error.message || "Errore nell'aggiornamento della barca" });
    }
  });
  app2.delete("/api/boats/:id", requireAuth, requireOwner, async (req, res) => {
    try {
      const { id } = req.params;
      const existingBoat = await storage.getBoat(id);
      if (!existingBoat || existingBoat.hostId !== parseInt(req.session.user.id)) {
        return res.status(404).json({ error: "Barca non trovata" });
      }
      const success = await storage.deleteBoat(id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: "Barca non trovata" });
      }
    } catch (error) {
      console.error("Delete boat error:", error);
      res.status(500).json({ error: "Errore nell'eliminazione della barca" });
    }
  });
  app2.get("/api/owner/bookings", requireAuth, requireOwner, async (req, res) => {
    try {
      const bookings2 = await storage.getBookingsByOwner(req.session.user.id);
      res.json({ bookings: bookings2 });
    } catch (error) {
      console.error("Get owner bookings error:", error);
      res.status(500).json({ error: "Errore nel recupero delle prenotazioni" });
    }
  });
  app2.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  app2.get("/mobile-native-preview", (req, res) => {
    res.sendFile(path.join(__dirname, "../mobile-native-preview.html"));
  });
  app2.get("/mobile-native-app", (req, res) => {
    res.sendFile(path.join(__dirname, "../mobile-native-app-viewer.html"));
  });
  app2.get("/supporto", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supporto - SeaBoo</title>
    <style>
        body { font-family: 'Inter', -apple-system, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #0ea5e9; margin-bottom: 30px; }
        h2 { color: #374151; margin-top: 30px; }
        .contact-info { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .faq { margin: 20px 0; }
        .faq-item { margin-bottom: 15px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; }
        a { color: #0ea5e9; text-decoration: none; }
        .logo { text-align: center; margin-bottom: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>\u{1F6A4} SeaBoo - Centro Supporto</h1>
        </div>
        
        <h2>\u{1F4DE} Contattaci</h2>
        <div class="contact-info">
            <p><strong>Email Supporto:</strong> <a href="mailto:supporto@seaboo.it">supporto@seaboo.it</a></p>
            <p><strong>Orari:</strong> Luned\xEC - Venerd\xEC 9:00-18:00</p>
            <p><strong>Emergenze in mare:</strong> <a href="tel:1530">1530 (Guardia Costiera)</a></p>
        </div>

        <h2>\u2753 Domande Frequenti</h2>
        <div class="faq">
            <div class="faq-item">
                <strong>Come prenotare una barca?</strong><br>
                Usa la ricerca, seleziona date e completa il pagamento.
            </div>
            <div class="faq-item">
                <strong>Posso modificare la prenotazione?</strong><br>
                Modifiche possibili fino a 48h prima della partenza.
            </div>
            <div class="faq-item">
                <strong>Che documenti servono?</strong><br>
                Documento d'identit\xE0 e patente nautica (se richiesta).
            </div>
            <div class="faq-item">
                <strong>Metodi di pagamento?</strong><br>
                Carte di credito, Apple Pay, Google Pay tramite Stripe.
            </div>
        </div>

        <h2>\u{1F510} Privacy e Sicurezza</h2>
        <p>I tuoi dati sono protetti secondo il GDPR. Le transazioni sono sicure tramite Stripe.</p>
        
        <h2>\u{1F4F1} App Mobile</h2>
        <p>Benvenuto su SeaBoo - La piattaforma per il noleggio barche in Italia.</p>
        
        <p style="text-align: center; margin-top: 40px; color: #6b7280;">
            \xA9 2025 SeaBoo. Tutti i diritti riservati.
        </p>
    </div>
</body>
</html>
    `);
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, bookingId, currency = "eur" } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }
      if (!stripe) {
        return res.status(503).json({ error: "Payment service not configured" });
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency,
        metadata: {
          bookingId: bookingId ? bookingId.toString() : "",
          platform: "seaboo"
        },
        automatic_payment_methods: {
          enabled: true
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      console.error("Payment Intent creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: "Payment service not configured" });
    }
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    res.json({ received: true });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 5e3,
    allowedHosts: ["all"],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.enable("trust proxy");
app.use((req, res, next) => {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "");
  const isOurDomain = /(^|\.)seaboo\.it$/i.test(host);
  if (isOurDomain) {
    if (/^seaboo\.it$/i.test(host)) {
      return res.redirect(301, `https://www.seaboo.it${req.originalUrl}`);
    }
    if (proto !== "https") {
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  }
  next();
});
var ALLOWED_ORIGINS = [
  "https://www.seaboo.it",
  "https://seaboo.it",
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:5173"
];
var corsOptions = process.env.NODE_ENV === "development" ? {
  origin: true,
  // Allow all origins in development
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
} : {
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, _res, next) => {
  console.log("[REQ]", req.method, req.path);
  next();
});
var stripe2 = process.env.STRIPE_SECRET_KEY ? new Stripe2(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil"
}) : null;
app.get("/api/healthz", (_req, res) => res.json({ ok: true }));
app.post(
  "/api/create-experience-payment",
  async (req, res) => {
    try {
      const amount = Number(req.body?.amount);
      const currency = String(req.body?.currency || "eur");
      if (!stripe2 || !process.env.STRIPE_SECRET_KEY)
        return res.status(503).json({ error: "payment_service_not_configured" });
      if (!Number.isFinite(amount) || amount <= 0)
        return res.status(400).json({ error: "bad_amount" });
      const intent = await stripe2.paymentIntents.create({
        amount,
        // es. 1000 = €10,00
        currency,
        // es. 'eur'
        automatic_payment_methods: { enabled: true },
        description: "SeaBoo experience"
      });
      return res.json({ clientSecret: intent.client_secret });
    } catch (e) {
      console.error("[PAY][SERVER-ERR]", e?.message || e);
      return res.status(500).json({ error: "stripe_failed" });
    }
  }
);
(async () => {
  const server = await registerRoutes(app);
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT || 5e3);
  server.listen(
    port,
    "0.0.0.0",
    () => log(`\u{1F680} Server running on port ${port}`)
  );
})();
