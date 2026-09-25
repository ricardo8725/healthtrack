import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { weightEntry, type WeightEntryRow } from '@/db/schema';
import type { WeightEntryInput } from '@/schemas/weight.schema';
import type { BMIResult } from '@/domain/bmi';

/** Lista todas las entradas del usuario, ordenadas por fecha descendente (RF-05). */
export async function listWeightEntries(userId: string): Promise<WeightEntryRow[]> {
  return db
    .select()
    .from(weightEntry)
    .where(eq(weightEntry.userId, userId))
    .orderBy(desc(weightEntry.date))
    .all();
}

/** Devuelve una entrada por id, solo si pertenece al usuario (RNF-03). */
export async function getWeightEntry(
  id: string,
  userId: string,
): Promise<WeightEntryRow | null> {
  const rows = db
    .select()
    .from(weightEntry)
    .where(and(eq(weightEntry.id, id), eq(weightEntry.userId, userId)))
    .all();
  return rows[0] ?? null;
}

export async function createWeightEntry(
  userId: string,
  data: WeightEntryInput,
  bmi: BMIResult,
): Promise<WeightEntryRow> {
  const id = randomUUID();
  const now = new Date();
  db.insert(weightEntry)
    .values({
      id,
      userId,
      date: data.date,
      weightKg: data.weightKg,
      bmi: bmi.value,
      bmiCategory: bmi.category,
      createdAt: now,
      updatedAt: now,
    })
    .run();

  const created = await getWeightEntry(id, userId);
  if (!created) {
    throw new Error('Failed to persist weight entry');
  }
  return created;
}

/**
 * Actualiza una entrada existente del usuario. Devuelve null si la entrada
 * no existe o no pertenece al usuario (RNF-03).
 */
export async function updateWeightEntry(
  id: string,
  userId: string,
  data: WeightEntryInput,
  bmi: BMIResult,
): Promise<WeightEntryRow | null> {
  const existing = await getWeightEntry(id, userId);
  if (!existing) {
    return null;
  }

  db.update(weightEntry)
    .set({
      date: data.date,
      weightKg: data.weightKg,
      bmi: bmi.value,
      bmiCategory: bmi.category,
      updatedAt: new Date(),
    })
    .where(and(eq(weightEntry.id, id), eq(weightEntry.userId, userId)))
    .run();

  return getWeightEntry(id, userId);
}

/**
 * Elimina una entrada del usuario. Devuelve true si se eliminó algo,
 * false si no existía o no pertenecía al usuario.
 */
export async function deleteWeightEntry(id: string, userId: string): Promise<boolean> {
  const result = db
    .delete(weightEntry)
    .where(and(eq(weightEntry.id, id), eq(weightEntry.userId, userId)))
    .run();
  return result.changes > 0;
}
