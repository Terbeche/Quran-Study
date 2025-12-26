import { mysqlTable, varchar, timestamp, int, boolean, primaryKey, unique } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: varchar('image', { length: 500 }),
  password: varchar('password', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Sessions table (for NextAuth)
export const sessions = mysqlTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

// Verification tokens (for NextAuth)
export const verificationTokens = mysqlTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires: timestamp('expires').notNull(),
}, (vt) => ({
  compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Accounts table (for NextAuth OAuth providers)
export const accounts = mysqlTable('accounts', {
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: varchar('refresh_token', { length: 500 }),
  access_token: varchar('access_token', { length: 500 }),
  expires_at: int('expires_at'),
  token_type: varchar('token_type', { length: 50 }),
  scope: varchar('scope', { length: 255 }),
  id_token: varchar('id_token', { length: 2000 }),
  session_state: varchar('session_state', { length: 255 }),
}, (account) => ({
  compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
}));

// Tags table
export const tags = mysqlTable('tags', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  verseKey: varchar('verse_key', { length: 10 }).notNull(),
  tagText: varchar('tag_text', { length: 50 }).notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  votes: int('votes').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate tags per user per verse
  uniqueUserVerseTag: unique().on(table.userId, table.verseKey, table.tagText),
}));

// Tag votes table
export const tagVotes = mysqlTable('tag_votes', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tagId: varchar('tag_id', { length: 36 }).notNull().references(() => tags.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  voteType: int('vote_type').notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // One vote per user per tag
  uniqueUserTagVote: unique().on(table.userId, table.tagId),
}));

// Collections table
export const collections = mysqlTable('collections', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Prevent duplicate collection names per user
  uniqueUserCollectionName: unique().on(table.userId, table.name),
}));

// Collection verses junction table
export const collectionVerses = mysqlTable('collection_verses', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  collectionId: varchar('collection_id', { length: 36 }).notNull().references(() => collections.id, { onDelete: 'cascade' }),
  verseKey: varchar('verse_key', { length: 10 }).notNull(),
  position: int('position').notNull().default(0),
  notes: varchar('notes', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  uniqueCollectionVerse: unique().on(table.collectionId, table.verseKey),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tags: many(tags),
  tagVotes: many(tagVotes),
  collections: many(collections),
  sessions: many(sessions),
  accounts: many(accounts),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(users, {
    fields: [tags.userId],
    references: [users.id],
  }),
  votes: many(tagVotes),
}));

export const tagVotesRelations = relations(tagVotes, ({ one }) => ({
  tag: one(tags, {
    fields: [tagVotes.tagId],
    references: [tags.id],
  }),
  user: one(users, {
    fields: [tagVotes.userId],
    references: [users.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  verses: many(collectionVerses),
}));

export const collectionVersesRelations = relations(collectionVerses, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionVerses.collectionId],
    references: [collections.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
