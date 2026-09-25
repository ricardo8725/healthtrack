import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userProfile, type UserProfileRow } from '@/db/schema';
import type { ProfileInput } from '@/schemas/profile.schema';

export async function getProfile(userId: string): Promise<UserProfileRow | null> {
  const rows = db.select().from(userProfile).where(eq(userProfile.id, userId)).all();
  return rows[0] ?? null;
}

/**
 * Crea o actualiza el perfil del usuario (upsert).
 * El `userId` se usa como PK del perfil (un perfil por usuario).
 */
export async function upsertProfile(
  userId: string,
  data: ProfileInput,
): Promise<UserProfileRow> {
  const existing = await getProfile(userId);

  if (existing) {
    db.update(userProfile)
      .set({ heightCm: data.heightCm, dateOfBirth: data.dateOfBirth })
      .where(eq(userProfile.id, userId))
      .run();
  } else {
    db.insert(userProfile)
      .values({
        id: userId || randomUUID(),
        heightCm: data.heightCm,
        dateOfBirth: data.dateOfBirth,
      })
      .run();
  }

  const saved = await getProfile(userId);
  if (!saved) {
    throw new Error('Failed to persist profile');
  }
  return saved;
}
