import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import pool from "./config/database";
import { setupStreamWebSocket } from "./services/stream.service";
import { ensureSelfSignedCert } from "./utils/generate-cert";

dotenv.config();

const app: Application = express();
const PORT = parseInt(process.env.PORT || "5000", 10);
const HTTPS_ENABLED = process.env.HTTPS_ENABLED !== "false"; // enabled by default

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
const uploadsPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../uploads")
    : path.join(process.cwd(), "uploads");
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(uploadsPath),
);
console.log(`📁 Serving uploads from: ${uploadsPath}`);

// Routes
app.use("/api", routes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    message: "Qurilish API Server",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: {
        signUp: "POST /api/auth/sign-up",
        signIn: "POST /api/auth/sign-in",
        me: "GET /api/auth/me",
      },
    },
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Test database connection and start server
const startServer = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ Database connection successful");

    let server: http.Server | https.Server;

    if (HTTPS_ENABLED) {
      // Use custom certs from env or auto-generate self-signed for dev
      const sslKeyPath = process.env.SSL_KEY_PATH;
      const sslCertPath = process.env.SSL_CERT_PATH;

      let key: Buffer;
      let cert: Buffer;

      if (sslKeyPath && sslCertPath) {
        key = fs.readFileSync(sslKeyPath);
        cert = fs.readFileSync(sslCertPath);
        console.log("🔒 Using provided SSL certificates");
      } else {
        const certs = ensureSelfSignedCert();
        key = fs.readFileSync(certs.keyPath);
        cert = fs.readFileSync(certs.certPath);
        console.log("🔒 Using auto-generated self-signed certificate (dev)");
      }

      server = https.createServer({ key, cert }, app);
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on https://0.0.0.0:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      });
    } else {
      server = http.createServer(app);
      server.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      });
    }

    // Attach RTSP → WebSocket stream proxy (works on both HTTP and HTTPS)
    setupStreamWebSocket(server);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
