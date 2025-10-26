import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Create postgres client for queries
const client = postgres(connectionString);

// Create drizzle instance
export const db = drizzle(client, { schema });
