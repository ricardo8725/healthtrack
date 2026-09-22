# Design: Registro de Peso e IMC

> Estado: listo para implementación.
> Stack: Next.js (App Router) · SQLite (better-sqlite3) · Drizzle ORM · Zod · Tailwind CSS

---

## Stack tecnológico

| Capa              | Tecnología                        | Razón                                              |
|-------------------|-----------------------------------|----------------------------------------------------|
| Framework         | Next.js 14 (App Router)           | API Routes + SSR/RSC en un solo proyecto           |
| Base de datos     | SQLite via `better-sqlite3`       | Local, sin servidor, archivo único `healthtrack.db`|
| ORM / migraciones | Drizzle ORM + `drizzle-kit`       | Type-safe, migraciones SQL explícitas, liviano     |
| Validación        | Zod                               | Esquemas compartidos entre API y cliente           |
| UI                | React + Tailwind CSS              | Estándar del ecosistema Next.js                    |
| Formularios       | React Hook Form + resolvers Zod   | Validación en cliente reutilizando los mismos Zod schemas |
| Tests             | Vitest                            | Rápido, nativo ESM, compatible con el proyecto     |

---

## Estructura de directorios

```
healthtrack/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Redirect → /weight
│   │   ├── profile/
│   │   │   └── page.tsx             # Formulario de perfil
│   │   └── weight/
│   │       ├── page.tsx             # Historial de peso + botón nuevo
│   │       └── [id]/
│   │           └── page.tsx         # Editar entrada existente
│   ├── api/                         # Next.js Route Handlers
│   │   ├── profile/
│   │   │   └── route.ts             # GET, PUT /api/profile
│   │   └── weight/
│   │       ├── route.ts             # GET, POST /api/weight
│   │       └── [id]/
│   │           └── route.ts         # PUT, DELETE /api/weight/[id]
│   ├── db/
│   │   ├── index.ts                 # Instancia singleton de better-sqlite3
│   │   ├── schema.ts                # Definición de tablas con Drizzle
│   │   └── migrations/              # Archivos SQL generados por drizzle-kit
│   ├── domain/
│   │   └── bmi.ts                   # calculateBMI() — lógica pura, sin dependencias
│   ├── lib/
│   │   ├── profile.repository.ts    # Queries de UserProfile
│   │   └── weight.repository.ts     # Queries de WeightEntry
│   ├── schemas/
│   │   ├── profile.schema.ts        # Zod schema para UserProfile
│   │   └── weight.schema.ts         # Zod schema para WeightEntry
│   └── components/
│       ├── ProfileForm.tsx
│       ├── WeightEntryForm.tsx
│       ├── WeightHistoryTable.tsx
│       ├── DeleteConfirmDialog.tsx
│       └── BMICategoryBadge.tsx
├── drizzle.config.ts
├── healthtrack.db                   # Generado en primera migración (gitignored)
└── vitest.config.ts
```

---

## Esquema de base de datos (Drizzle)

```ts
// src/db/schema.ts
import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const userProfile = sqliteTable('user_profile', {
  id:            text('id').primaryKey(),          // UUID v4
  heightCm:      real('height_cm').notNull(),       // > 0
  dateOfBirth:   text('date_of_birth').notNull(),   // ISO-8601 date string
});

export const weightEntry = sqliteTable('weight_entry', {
  id:          text('id').primaryKey(),             // UUID v4
  userId:      text('user_id').notNull()
                 .references(() => userProfile.id),
  date:        text('date').notNull(),              // ISO-8601 date string
  weightKg:    real('weight_kg').notNull(),         // 0 < x ≤ 700
  bmi:         real('bmi').notNull(),               // calculado, 2 decimales
  bmiCategory: text('bmi_category').notNull(),      // ver BMICategory
  createdAt:   integer('created_at', { mode: 'timestamp' })
                 .$defaultFn(() => new Date()),
  updatedAt:   integer('updated_at', { mode: 'timestamp' })
                 .$defaultFn(() => new Date()),
});
```

> `better-sqlite3` no tiene tipo nativo `DATE`; se usa `text` en formato `YYYY-MM-DD`.

---

## Dominio: lógica de negocio

### `src/domain/bmi.ts`

```ts
export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIResult {
  value: number;        // redondeado a 2 decimales
  category: BMICategory;
}

export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new RangeError('weight and height must be positive numbers');
  }
  const heightM = heightCm / 100;
  const raw = weightKg / (heightM * heightM);
  const value = Math.round(raw * 100) / 100;
  return { value, category: classifyBMI(value) };
}

function classifyBMI(bmi: number): BMICategory {
  if (bmi < 18.5)  return 'underweight';
  if (bmi < 25.0)  return 'normal';
  if (bmi < 30.0)  return 'overweight';
  return 'obese';
}
```

Esta función es pura (sin side-effects, sin imports externos) y puede importarse tanto en API routes como en el cliente para feedback inmediato.

---

## Validación con Zod

### `src/schemas/profile.schema.ts`

```ts
import { z } from 'zod';

export const profileSchema = z.object({
  heightCm:    z.number().positive('La altura debe ser mayor que 0'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
```

### `src/schemas/weight.schema.ts`

```ts
import { z } from 'zod';

export const weightEntrySchema = z.object({
  date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
  weightKg: z.number()
              .positive('El peso debe ser mayor que 0')
              .max(700, 'El peso no puede superar 700 kg'),
});

export type WeightEntryInput = z.infer<typeof weightEntrySchema>;
```

---

## API Routes

### Perfil

| Método | Path           | Descripción                        |
|--------|----------------|------------------------------------|
| GET    | /api/profile   | Devuelve el perfil del usuario     |
| PUT    | /api/profile   | Crea o actualiza el perfil (upsert)|

### Entradas de peso

| Método | Path               | Descripción                        |
|--------|--------------------|------------------------------------|
| GET    | /api/weight        | Lista todas las entradas (desc)    |
| POST   | /api/weight        | Crea nueva entrada                 |
| PUT    | /api/weight/[id]   | Edita una entrada existente        |
| DELETE | /api/weight/[id]   | Elimina una entrada                |

**Flujo POST /api/weight:**
1. Parsear body con `weightEntrySchema`.
2. Obtener `heightCm` del perfil del usuario.
3. Si no hay perfil → `400 Profile incomplete`.
4. Llamar `calculateBMI(weightKg, heightCm)`.
5. Insertar en `weight_entry` con `bmi` y `bmiCategory` calculados.
6. Responder `201` con la entrada creada.

**Flujo PUT /api/weight/[id]:**  
Idéntico al POST, pero con `UPDATE` en lugar de `INSERT`.

---

## Manejo de usuario (sin auth por ahora)

Para la fase local se usa un **userId fijo** (`FIXED_USER_ID = 'local-user'`) declarado como constante en `src/lib/constants.ts`. Esto permite cumplir RNF-03 (aislamiento por usuario) desde el inicio, y el único cambio para añadir auth real será reemplazar esa constante por `session.user.id`.

---

## Flujo de pantallas (App Router)

```
/                   → redirect a /weight
/profile            → ProfileForm (RSC + Client Form)
/weight             → WeightHistoryTable (RSC) + botón "Nueva entrada"
/weight/new         → WeightEntryForm (modo creación)
/weight/[id]        → WeightEntryForm (modo edición, pre-poblado)
```

- Las páginas de listado usan React Server Components para fetch directo a repositorio.
- Los formularios son Client Components con React Hook Form + Zod resolver.
- El diálogo de confirmación de eliminación es un Client Component modal.

---

## Consideraciones de extensibilidad

- `calculateBMI` no tiene dependencias: puede usarse en cualquier plataforma futura.
- `WeightEntry` puede añadir `source: 'manual' | 'apple_health' | 'garmin'` (nullable) sin migración destructiva.
- Reemplazar `better-sqlite3` por Postgres (Neon, Supabase) solo requiere cambiar el driver en `src/db/index.ts`; el schema Drizzle y los repositorios no cambian.
- La constante `FIXED_USER_ID` puede sustituirse por `next-auth` o `Clerk` sin tocar la lógica de negocio.
