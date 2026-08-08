import { pgTable, uuid, text, boolean, timestamp, bigint, pgPolicy } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { authenticatedRole, anonRole, serviceRole, authUsers } from 'drizzle-orm/supabase';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  name: text('name'),
  isAdmin: boolean('is_admin').default(false).notNull(),
  isApproved: boolean('is_approved').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastDownload: timestamp('last_download'),
}, (table) => [
  // Users can view their own data
  pgPolicy('users_select_own', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.id} = (select auth.uid())`,
  }),
  // Admins can view all users
  pgPolicy('users_select_admin', {
    for: 'select',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Admins can update users
  pgPolicy('users_update_admin', {
    for: 'update',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
    withCheck: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Service role can do everything
  pgPolicy('users_service_role', {
    for: 'all',
    to: serviceRole,
    using: sql`true`,
    withCheck: sql`true`,
  }),
]);

export const releases = pgTable('releases', {
  id: uuid('id').primaryKey().defaultRandom(),
  version: text('version').notNull(),
  fileName: text('file_name').notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  r2Key: text('r2_key').notNull(),
  changelog: text('changelog'),
  releaseNotes: text('release_notes'),
  isProduction: boolean('is_production').default(false).notNull(),
  isLatest: boolean('is_latest').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => [
  // Public can view releases
  pgPolicy('releases_select_public', {
    for: 'select',
    to: anonRole,
    using: sql`true`,
  }),
  // Admins can insert releases
  pgPolicy('releases_insert_admin', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Admins can update releases
  pgPolicy('releases_update_admin', {
    for: 'update',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
    withCheck: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Admins can delete releases
  pgPolicy('releases_delete_admin', {
    for: 'delete',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Service role can do everything
  pgPolicy('releases_service_role', {
    for: 'all',
    to: serviceRole,
    using: sql`true`,
    withCheck: sql`true`,
  }),
]);

export const downloads = pgTable('downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  releaseId: uuid('release_id').references(() => releases.id).notNull(),
  downloadedAt: timestamp('downloaded_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => [
  // Admins can view downloads
  pgPolicy('downloads_select_admin', {
    for: 'select',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // System can insert downloads (via service role)
  pgPolicy('downloads_insert_service', {
    for: 'insert',
    to: serviceRole,
    withCheck: sql`true`,
  }),
  // Service role can do everything
  pgPolicy('downloads_service_role', {
    for: 'all',
    to: serviceRole,
    using: sql`true`,
    withCheck: sql`true`,
  }),
]);

export const accessRequests = pgTable('access_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: text('status').default('pending').notNull(), // pending, approved, rejected
  requestedAt: timestamp('requested_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
}, (table) => [
  // Users can create own requests
  pgPolicy('access_requests_insert_own', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`${table.userId} = (select auth.uid())`,
  }),
  // Users can view own requests
  pgPolicy('access_requests_select_own', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${table.userId} = (select auth.uid())`,
  }),
  // Admins can view all requests
  pgPolicy('access_requests_select_admin', {
    for: 'select',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Admins can update requests
  pgPolicy('access_requests_update_admin', {
    for: 'update',
    to: authenticatedRole,
    using: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
    withCheck: sql`EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )`,
  }),
  // Service role can do everything
  pgPolicy('access_requests_service_role', {
    for: 'all',
    to: serviceRole,
    using: sql`true`,
    withCheck: sql`true`,
  }),
]);

export const usersRelations = relations(users, ({ many }) => ({
  releases: many(releases),
  downloads: many(downloads),
  accessRequests: many(accessRequests),
}));

export const releasesRelations = relations(releases, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [releases.createdBy],
    references: [users.id],
  }),
  downloads: many(downloads),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  user: one(users, {
    fields: [downloads.userId],
    references: [users.id],
  }),
  release: one(releases, {
    fields: [downloads.releaseId],
    references: [releases.id],
  }),
}));

export const accessRequestsRelations = relations(accessRequests, ({ one }) => ({
  user: one(users, {
    fields: [accessRequests.userId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [accessRequests.reviewedBy],
    references: [users.id],
  }),
}));
