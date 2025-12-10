// Vercel serverless function entry point
// This wraps the Express app for Vercel's serverless environment

import express from "express";
import { registerRoutes } from "../backend/routes.js";
import { serveStatic } from "../backend/static.js";
import { db } from "../backend/db.js";
import * as schema from "../shared/schema.js";

const app = express();

// Enable CORS headers for API routes
app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// Initialize the app (singleton pattern for serverless)
let appInitialized = false;
let initPromise = null;

async function initializeApp() {
  if (appInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    // Create a dummy httpServer for registerRoutes
    const { createServer } = await import("http");
    const httpServer = createServer(app);
    
    await registerRoutes(httpServer, app);

    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Log errors in production too, but be more selective
      console.error(`[${new Date().toISOString()}] Error ${status}:`, {
        message: err.message,
        stack: err.stack?.split('\n').slice(0, 5).join('\n'), // First 5 lines of stack
        url: _req?.url,
        method: _req?.method
      });

      res.status(status).json({ message });
    });

    // In production (Vercel), always serve static files
    serveStatic(app);
    
    appInitialized = true;
  })();

  return initPromise;
}

// Vercel serverless function handler
export default async function handler(req, res) {
  // Initialize the app if not already done
  await initializeApp();
  
  // Forward the request to Express
  app(req, res);
}
