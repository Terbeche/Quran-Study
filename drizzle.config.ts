import { defineConfig } from 'drizzle-kit';

// Add SSL parameter for Heroku Postgres in production
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL!;
  if (process.env.NODE_ENV === 'production') {
    // Add sslmode=require for Heroku Postgres
    return url.includes('?') ? `${url}&sslmode=require` : `${url}?sslmode=require`;
  }
  return url;
};

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: getDatabaseUrl(),
  },
});
