import { defineConfig } from 'drizzle-kit';

// Get database credentials from environment
// Supports both explicit env vars (for Heroku/production) and local setup
const getDbCredentials = () => {
  // If running on Heroku or production with explicit credentials
  if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
    return {
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
    };
  }
  
  // For local development, use socket connection (more reliable)
  return {
    host: 'localhost',
    user: process.env.DB_USER || 'mostefa',
    password: process.env.DB_PASSWORD || '0000',
    database: process.env.DB_NAME || 'quran_study',
    socketPath: '/var/run/mysqld/mysqld.sock',
  };
};

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: getDbCredentials(),
});
