import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Create postgres client for queries with SSL for production (Heroku)
const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : undefined,
});

// Create drizzle instance
export const db = drizzle(client, { schema });
