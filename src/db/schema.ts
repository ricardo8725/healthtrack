import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const userProfile = sqliteTable('user_profile', {
  id: text('id').primaryKey(), // UUID v4
  heightCm: real('height_cm').notNull(), // > 0
  dateOfBirth: text('date_of_birth').notNull(), // ISO-8601 date string
});

export const weightEntry = sqliteTable('weight_entry', {
  id: text('id').primaryKey(), // UUID v4
  userId: text('user_id')
    .notNull()
    .references(() => userProfile.id),
  date: text('date').notNull(), // ISO-8601 date string
  weightKg: real('weight_kg').notNull(), // 0 < x <= 700
  bmi: real('bmi').notNull(), // calculado, 2 decimales
  bmiCategory: text('bmi_category').notNull(), // ver BMICategory
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type UserProfileRow = typeof userProfile.$inferSelect;
export type WeightEntryRow = typeof weightEntry.$inferSelect;
