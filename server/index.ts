import 'dotenv/config';
import Stripe from "stripe";
import cors from "cors";
import express, { type Request, Response } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.enable("trust proxy");

app.use((req, res, next) => {
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  const proto = String(req.headers["x-forwarded-proto"] || req.protocol || "");

  // solo per i tuoi domini pubblici
  const isOurDomain = /(^|\.)seaboo\.it$/i.test(host);

  if (isOurDomain) {
    // se è il dominio senza www → aggiungi www
    if (/^seaboo\.it$/i.test(host)) {
      return res.redirect(301, `https://www.seaboo.it${req.originalUrl}`);
    }
    // se è www ma su http → forza https
    if (proto !== "https") {
      return res.redirect(301, `https://${host}${req.originalUrl}`);
    }
  }
  next();
});

// middleware base
const ALLOWED_ORIGINS = [
  "https://www.seaboo.it",
  "https://seaboo.it",
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:5173",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Preflight esplicito
app.options("*", cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, _res, next) => {
  console.log("[REQ]", req.method, req.path);
  next();
});

// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-08-27.basil",
});

// === API (PRIMA di registerRoutes/serveStatic) ===
app.get("/api/healthz", (_req, res) => res.json({ ok: true })); // test veloce

app.post(
  "/api/create-experience-payment",
  async (req: Request, res: Response) => {
    try {
      const amount = Number(req.body?.amount);
      const currency = String(req.body?.currency || "eur");
      if (!process.env.STRIPE_SECRET_KEY)
        return res.status(500).json({ error: "missing_secret" });
      if (!Number.isFinite(amount) || amount <= 0)
        return res.status(400).json({ error: "bad_amount" });

      const intent = await stripe.paymentIntents.create({
        amount, // es. 1000 = €10,00
        currency, // es. 'eur'
        automatic_payment_methods: { enabled: true },
        description: "SeaBoo experience",
      });

      return res.json({ clientSecret: intent.client_secret });
    } catch (e: any) {
      console.error("[PAY][SERVER-ERR]", e?.message || e);
      return res.status(500).json({ error: "stripe_failed" });
    }
  },
);

// routing/statici DOPO le API
(async () => {
  const server = await registerRoutes(app);
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = Number(process.env.PORT || 5000);
  server.listen(port, "0.0.0.0", () =>
    log(`🚀 Server running on port ${port}`),
  );
})();
