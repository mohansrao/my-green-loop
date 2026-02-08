import ws from "ws";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Check if we should use Neon Serverless driver (Production or Neon URL)
const useNeon = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('neon.tech');

let pool: any;
let db: any;

if (useNeon) {
  // Use Neon Serverless driver
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');

  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  // Use standard Postgres driver for local development
  const { default: pg } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');

  const Pool = pg.Pool;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { pool, db };