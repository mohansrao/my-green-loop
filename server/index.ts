import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log environment mode and secret variables on startup
console.log('\n=== Environment Mode ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

console.log('\n=== Secret Environment Variables ===');
const secretKeys = [
  'DATABASE_URL',
  'DEBUG_TWILIO',
  'DEV_ADMIN_WHATSAPP_NUMBER',
  'PROD_ADMIN_WHATSAPP_NUMBER',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_WHATSAPP_NUMBER'
];

secretKeys.forEach(key => {
  if (process.env[key]) {
    console.log(`${key}: ${process.env[key]}`);
  }
});
console.log('=== End Secret Environment Variables ===\n');

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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

      if (logLine.length > 120) {
        const jsonStart = logLine.indexOf(' :: ');
        if (jsonStart !== -1) {
          logLine = logLine.slice(0, jsonStart) + ' :: ' + JSON.stringify(capturedJsonResponse).slice(0, 50) + '...}';
        }
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const PORT = process.env.PORT || 5000;
  const HOST = "0.0.0.0";
  server.listen(PORT, HOST, () => {
    log(`serving on ${HOST}:${PORT} in ${app.get("env")} mode`);
  });
})();
