import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertOwnerSchema, insertUserOnlySchema, loginSchema, insertBoatSchema, bookings } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import appleSignin from "apple-signin-auth";
import { db } from "./db";
import { eq } from "drizzle-orm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Stripe (conditional)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })
  : null;

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      role: string;
      userType: string;
      businessName?: string;
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'seaboo-secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ error: "Non autenticato" });
    }
    next();
  };

  // Register endpoint with role-based validation
  app.post('/api/register', async (req, res) => {
    try {
      // Determine which schema to use based on role
      const role = req.body.role || "user";
      let userData;
      
      if (role === "owner") {
        userData = insertOwnerSchema.parse(req.body);
      } else {
        userData = insertUserOnlySchema.parse(req.body);
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email già registrata" });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      // Store user in session (login automatically after registration)
      req.session.user = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role || "user",
        userType: user.role === "owner" ? "owner" : "customer",
        businessName: user.businessName || undefined
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
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ 
        error: error.message || "Errore durante la registrazione" 
      });
    }
  });

  // Login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(loginData.email, loginData.password);
      if (!user) {
        return res.status(401).json({ error: "Email o password non validi" });
      }

      // Store user in session
      req.session.user = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role || "user",
        userType: user.role === "owner" ? "owner" : "customer",
        businessName: user.businessName || undefined
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
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ 
        error: error.message || "Errore durante il login" 
      });
    }
  });

  // Get current user endpoint
  app.get('/api/user', (req, res) => {
    if (req.session?.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ error: "Non autenticato" });
    }
  });

  // Apple Sign In endpoint
  app.post('/api/auth/apple', async (req, res) => {
    try {
      const { identityToken, user: appleUser, nonce } = req.body;
      
      if (!identityToken) {
        return res.status(400).json({ error: "Token Apple mancante" });
      }

      // Verify the identity token with Apple's public keys
      const appleIdTokenPayload = await appleSignin.verifyIdToken(identityToken, {
        audience: process.env.APPLE_CLIENT_ID || 'it.seaboo.app', // Your app's bundle ID
        nonce: nonce, // Nonce for replay attack prevention
        ignoreExpiration: false, // Enforce token expiration
      });
      
      const appleEmail = appleIdTokenPayload.email || appleUser?.email;
      const appleSub = appleIdTokenPayload.sub; // Stable user identifier from Apple
      
      if (!appleEmail) {
        return res.status(400).json({ error: "Email Apple non disponibile" });
      }

      // Check if user exists by Apple ID or email
      let user = await storage.getUserByEmail(appleEmail);
      
      if (!user) {
        // Create new user with Apple Sign In
        user = await storage.createUser({
          email: appleEmail,
          password: await bcrypt.hash(Math.random().toString(36), 12), // Random password for Apple users
          firstName: appleUser?.name?.firstName || appleUser?.givenName,
          lastName: appleUser?.name?.lastName || appleUser?.familyName,
          role: 'user',
          username: `apple_${appleSub.substring(0, 10)}` // Unique username from Apple ID
        });
      }

      // Store user in session
      req.session.user = {
        id: user.id.toString(),
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role || "user",
        userType: "customer",
        businessName: user.businessName || undefined
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
    } catch (error: any) {
      console.error("Apple Sign In error:", error);
      res.status(401).json({ 
        error: "Token Apple non valido" 
      });
    }
  });

  // iOS In-App Purchase verification endpoint
  app.post('/api/verify-purchase', async (req, res) => {
    try {
      const { receiptData, productId, transactionId, bookingId } = req.body;
      
      if (!receiptData) {
        return res.status(400).json({ error: "Receipt mancante" });
      }

      // Verify receipt with Apple's server
      const verifyReceipt = async (receipt: string, sandbox: boolean = false) => {
        const url = sandbox 
          ? 'https://sandbox.itunes.apple.com/verifyReceipt'
          : 'https://buy.itunes.apple.com/verifyReceipt';
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'receipt-data': receipt,
            'password': process.env.APP_STORE_SHARED_SECRET || ''
          })
        });
        
        return await response.json();
      };

      // Try production first, then sandbox
      let result = await verifyReceipt(receiptData);
      
      if (result.status === 21007) {
        // Receipt is from sandbox, retry with sandbox URL
        result = await verifyReceipt(receiptData, true);
      }

      if (result.status === 0) {
        // Receipt is valid
        const receiptInfo = result.receipt;
        const inAppPurchases = receiptInfo.in_app || [];
        
        // Verify the transaction matches what was requested
        if (!productId || !transactionId) {
          return res.status(400).json({
            error: 'productId e transactionId sono obbligatori'
          });
        }

        const matchingTransaction = inAppPurchases.find(
          (purchase: any) => purchase.transaction_id === transactionId && purchase.product_id === productId
        );

        if (!matchingTransaction) {
          return res.status(400).json({
            error: 'Transaction non corrispondente nel receipt'
          });
        }

        // If this is a booking payment, verify ownership and update status
        if (bookingId && req.session?.user) {
          try {
            const bookingIdNum = parseInt(bookingId);
            const appleTransactionId = matchingTransaction.original_transaction_id || transactionId;
            
            // GLOBAL idempotency check: verify transaction hasn't been used by ANY user
            const existingTransactionBooking = await db
              .select()
              .from(bookings)
              .where(eq(bookings.paymentTransactionId, appleTransactionId))
              .limit(1);
            
            if (existingTransactionBooking.length > 0) {
              console.warn(`⚠️ Receipt replay attempt blocked: transaction ${appleTransactionId} already used for booking ${existingTransactionBooking[0].id}`);
              return res.status(409).json({
                error: 'Questa transazione Apple è già stata utilizzata',
                success: false
              });
            }
            
            // Get THIS specific booking to verify ownership and current status
            const userBookings = await storage.getBookingsByCustomer(parseInt(req.session.user.id));
            const booking = userBookings.find(b => b.id === bookingIdNum);
            
            if (!booking) {
              return res.status(404).json({
                error: 'Booking non trovato o non autorizzato'
              });
            }

            // Prevent replay: check if booking is already confirmed
            if (booking.status === 'confirmed') {
              return res.status(400).json({
                error: 'Booking già confermato',
                success: false
              });
            }

            // Update booking to confirmed WITH transaction ID
            // Wrapped in try-catch to handle unique constraint violations (race condition protection)
            try {
              await db
                .update(bookings)
                .set({ 
                  status: 'confirmed',
                  paymentTransactionId: appleTransactionId,
                  paymentProvider: 'apple',
                  updatedAt: new Date()
                })
                .where(eq(bookings.id, bookingIdNum));

              console.log(`✅ Booking ${bookingId} confirmed via IAP`, {
                userId: req.session.user.id,
                transactionId,
                originalTransactionId: appleTransactionId,
                productId,
                environment: result.environment
              });
            } catch (dbError: any) {
              // Handle unique constraint violation (race condition caught by DB)
              if (dbError.code === '23505') { // PostgreSQL unique violation
                console.warn(`⚠️ Race condition blocked: transaction ${appleTransactionId} constraint violation`);
                return res.status(409).json({
                  error: 'Questa transazione Apple è già stata utilizzata',
                  success: false
                });
              }
              throw dbError; // Re-throw if it's a different error
            }
          } catch (error) {
            console.error(`❌ Failed to update booking ${bookingId}:`, error);
            return res.status(500).json({
              error: 'Errore durante l\'aggiornamento booking'
            });
          }
        }
        
        res.json({
          success: true,
          environment: result.environment || 'Production',
          receipt: {
            bundle_id: receiptInfo.bundle_id,
            application_version: receiptInfo.application_version,
            original_purchase_date: receiptInfo.original_purchase_date
          },
          purchase: matchingTransaction || inAppPurchases[0],
          transactionId: transactionId
        });
      } else {
        // Map common Apple status codes to user-friendly messages
        const errorMessages: Record<number, string> = {
          21000: 'App Store non può leggere il receipt',
          21002: 'Dati del receipt malformati',
          21003: 'Receipt non autenticato',
          21004: 'Shared secret non corretto',
          21005: 'Server receipt non disponibile',
          21006: 'Receipt valido ma subscription scaduta',
          21007: 'Receipt da sandbox in produzione',
          21008: 'Receipt da produzione in sandbox'
        };

        res.status(400).json({
          error: errorMessages[result.status] || `Verifica fallita: codice ${result.status}`
        });
      }
    } catch (error: any) {
      console.error("Purchase verification error:", error);
      res.status(500).json({ 
        error: error.message || "Errore durante la verifica acquisto" 
      });
    }
  });

  // Create demo account endpoint (for Apple review)
  app.post('/api/create-demo-account', async (req, res) => {
    try {
      const demoEmail = 'demo@seaboo.it';
      const demoPassword = 'SeaBooDemo2025!';
      
      // Check if demo account already exists
      const existing = await storage.getUserByEmail(demoEmail);
      if (existing) {
        return res.json({ 
          success: true, 
          message: 'Account demo già esistente',
          credentials: { email: demoEmail, password: demoPassword }
        });
      }

      // Create demo account
      const demoUser = await storage.createUser({
        email: demoEmail,
        password: demoPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'user'
      });

      res.json({ 
        success: true, 
        message: 'Account demo creato',
        credentials: { email: demoEmail, password: demoPassword },
        user: {
          id: demoUser.id,
          email: demoUser.email
        }
      });
    } catch (error: any) {
      console.error("Demo account creation error:", error);
      res.status(500).json({ 
        error: error.message || "Errore durante la creazione account demo" 
      });
    }
  });

  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Errore durante il logout" });
      }
      res.json({ success: true });
    });
  });

  // Protected route example
  app.get("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(404).json({ error: "Utente non trovato" });
      }
      
      // Don't send password
      const { password, ...userProfile } = user;
      res.json({ user: userProfile });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ error: "Errore nel recupero del profilo" });
    }
  });

  // Multer setup for file uploads
  const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo immagini sono permesse'));
      }
    }
  });

  // Owner-only middleware
  const requireOwner = (req: any, res: any, next: any) => {
    if (!req.session?.user || req.session.user.role !== 'owner') {
      return res.status(403).json({ error: "Accesso negato: solo per noleggiatori" });
    }
    next();
  };

  // Boat management endpoints
  app.get('/api/boats', async (req, res) => {
    try {
      console.log("Fetching boats...");
      const boats = await storage.getBoats();
      console.log("Boats fetched:", boats?.length || 0, "boats");
      res.json({ boats });
    } catch (error) {
      console.error("Get boats error:", error);
      res.status(500).json({ error: "Errore nel recupero delle barche" });
    }
  });

  app.get('/api/owner/boats', requireAuth, requireOwner, async (req: any, res) => {
    try {
      const boats = await storage.getBoatsByOwner(req.session.user.id);
      res.json({ boats });
    } catch (error) {
      console.error("Get owner boats error:", error);
      res.status(500).json({ error: "Errore nel recupero delle barche" });
    }
  });

  app.post('/api/boats', requireAuth, requireOwner, upload.array('images', 5), async (req: any, res) => {
    try {
      const boatData = insertBoatSchema.parse({
        ...req.body,
        hostId: parseInt(req.session.user.id),
        images: req.files ? req.files.map((file: any) => `/uploads/${file.filename}`) : []
      });

      const boat = await storage.createBoat(boatData);
      res.json({ success: true, boat });
    } catch (error: any) {
      console.error("Create boat error:", error);
      res.status(400).json({ error: error.message || "Errore nella creazione della barca" });
    }
  });

  app.put('/api/boats/:id', requireAuth, requireOwner, upload.array('images', 5), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Verify boat ownership
      const existingBoat = await storage.getBoat(id);
      if (!existingBoat || existingBoat.hostId !== parseInt(req.session.user.id)) {
        return res.status(404).json({ error: "Barca non trovata" });
      }

      const updateData: any = { ...req.body };
      if (req.files && req.files.length > 0) {
        updateData.images = req.files.map((file: any) => `/uploads/${file.filename}`);
      }

      const boat = await storage.updateBoat(id, updateData);
      res.json({ success: true, boat });
    } catch (error: any) {
      console.error("Update boat error:", error);
      res.status(400).json({ error: error.message || "Errore nell'aggiornamento della barca" });
    }
  });

  app.delete('/api/boats/:id', requireAuth, requireOwner, async (req: any, res) => {
    try {
      const { id } = req.params;
      
      // Verify boat ownership
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

  // Owner bookings endpoint
  app.get('/api/owner/bookings', requireAuth, requireOwner, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByOwner(req.session.user.id);
      res.json({ bookings });
    } catch (error) {
      console.error("Get owner bookings error:", error);
      res.status(500).json({ error: "Errore nel recupero delle prenotazioni" });
    }
  });

  // Serve static files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
  });

  // Serve mobile native preview
  app.get('/mobile-native-preview', (req, res) => {
    res.sendFile(path.join(__dirname, '../mobile-native-preview.html'));
  });

  // Serve mobile native app viewer
  app.get('/mobile-native-app', (req, res) => {
    res.sendFile(path.join(__dirname, '../mobile-native-app-viewer.html'));
  });

  // Support page for App Store requirement
  app.get('/supporto', (req, res) => {
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
            <h1>🚤 SeaBoo - Centro Supporto</h1>
        </div>
        
        <h2>📞 Contattaci</h2>
        <div class="contact-info">
            <p><strong>Email Supporto:</strong> <a href="mailto:supporto@seaboo.it">supporto@seaboo.it</a></p>
            <p><strong>Orari:</strong> Lunedì - Venerdì 9:00-18:00</p>
            <p><strong>Emergenze in mare:</strong> <a href="tel:1530">1530 (Guardia Costiera)</a></p>
        </div>

        <h2>❓ Domande Frequenti</h2>
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
                Documento d'identità e patente nautica (se richiesta).
            </div>
            <div class="faq-item">
                <strong>Metodi di pagamento?</strong><br>
                Carte di credito, Apple Pay, Google Pay tramite Stripe.
            </div>
        </div>

        <h2>🔐 Privacy e Sicurezza</h2>
        <p>I tuoi dati sono protetti secondo il GDPR. Le transazioni sono sicure tramite Stripe.</p>
        
        <h2>📱 App Mobile</h2>
        <p>Benvenuto su SeaBoo - La piattaforma per il noleggio barche in Italia.</p>
        
        <p style="text-align: center; margin-top: 40px; color: #6b7280;">
            © 2025 SeaBoo. Tutti i diritti riservati.
        </p>
    </div>
</body>
</html>
    `);
  });

  // Payment Intent Creation Endpoint
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { amount, bookingId, currency = 'eur' } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
      }

      if (!stripe) {
        return res.status(503).json({ error: 'Payment service not configured' });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        metadata: {
          bookingId: bookingId ? bookingId.toString() : '',
          platform: 'seaboo'
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret
      });
    } catch (error: any) {
      console.error('Payment Intent creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe Webhook Endpoint
  app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service not configured' });
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Update booking status in database
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
  });

  const httpServer = createServer(app);
  return httpServer;
}