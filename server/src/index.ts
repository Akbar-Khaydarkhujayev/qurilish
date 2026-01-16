import path from "path";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import pool from "./config/database";

dotenv.config();

const app: Application = express();
const PORT = 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:8081",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
