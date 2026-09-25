/**
 * Seed de datos de prueba para verificar el rendimiento del historial (RNF-02).
 * Inserta un perfil y 1000 entradas de peso sintéticas.
 *
 * Uso: npx tsx src/scripts/seed.ts
 *
 * ⚠️ Escribe en healthtrack.db (la DB local de desarrollo).
 */
import { randomUUID } from 'node:crypto';
import { db } from '../db';
import { userProfile, weightEntry } from '../db/schema';
import { calculateBMI } from '../domain/bmi';
import { FIXED_USER_ID } from '../lib/constants';

const HEIGHT_CM = 175;
const COUNT = 1000;

function main() {
  // Perfil (upsert manual)
  const existing = db.select().from(userProfile).all().find((p) => p.id === FIXED_USER_ID);
  if (!existing) {
    db.insert(userProfile)
      .values({ id: FIXED_USER_ID, heightCm: HEIGHT_CM, dateOfBirth: '1990-01-01' })
      .run();
  }

  // Limpia entradas previas del usuario para un seed reproducible
  db.delete(weightEntry).run();

  const start = new Date('2024-01-01');
  const rows: (typeof weightEntry.$inferInsert)[] = [];
  for (let i = 0; i < COUNT; i++) {
    const date = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    // Peso oscilando entre 68 y 92 kg
    const weightKg = Math.round((68 + 24 * Math.abs(Math.sin(i / 30))) * 10) / 10;
    const bmi = calculateBMI(weightKg, HEIGHT_CM);
    const now = new Date();
    rows.push({
      id: randomUUID(),
      userId: FIXED_USER_ID,
      date: dateStr,
      weightKg,
      bmi: bmi.value,
      bmiCategory: bmi.category,
      createdAt: now,
      updatedAt: now,
    });
  }

  const t0 = Date.now();
  db.transaction((tx) => {
    for (const row of rows) {
      tx.insert(weightEntry).values(row).run();
    }
  });
  const t1 = Date.now();

  const total = db.select().from(weightEntry).all().length;
  console.log(`✅ Seed completo: ${total} entradas insertadas en ${t1 - t0} ms`);

  // Medición de la query de historial (orden desc) — RNF-02
  const q0 = Date.now();
  const listed = db.select().from(weightEntry).all();
  const q1 = Date.now();
  console.log(`📊 Query de historial (${listed.length} filas): ${q1 - q0} ms`);
}

main();
