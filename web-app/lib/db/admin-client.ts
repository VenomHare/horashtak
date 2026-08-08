import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Service role connection for admin operations that bypass RLS
const connectionString = process.env.DATABASE_URL!;

const adminClient = postgres(connectionString, {
  prepare: false,
});

export const adminDb = drizzle(adminClient, { schema });
