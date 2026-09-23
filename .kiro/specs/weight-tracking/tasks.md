# Tasks: Registro de Peso e IMC

> Stack: Next.js 14 (App Router) · SQLite · better-sqlite3 · Drizzle ORM · Zod · Tailwind CSS · Vitest
> Marcar como completada (`[x]`) conforme se avance.

---

## Fase 0 — Scaffolding del proyecto

- [ ] **T-00** Crear el proyecto Next.js con App Router y Tailwind CSS.
  ```bash
  npx create-next-app@latest healthtrack \
    --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  ```

- [ ] **T-01** Instalar dependencias de base de datos, ORM y validación.
  ```bash
  npm install better-sqlite3 drizzle-orm
  npm install -D drizzle-kit @types/better-sqlite3
  npm install zod react-hook-form @hookform/resolvers
  ```

- [ ] **T-02** Instalar y configurar Vitest y fast-check.
  ```bash
  npm install -D vitest @vitejs/plugin-react fast-check
  ```
  Crear `vitest.config.ts`:
  ```ts
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: { environment: 'node', include: ['src/**/*.test.ts'] },
  });
  ```
  Agregar a `package.json`:
  ```json
  "scripts": { "test": "vitest --run" }
  ```

- [ ] **T-03** Configurar Drizzle.
  Crear `drizzle.config.ts`:
  ```ts
  import type { Config } from 'drizzle-kit';
  export default {
    schema: './src/db/schema.ts',
    out:    './src/db/migrations',
    driver: 'better-sqlite',
    dbCredentials: { url: './healthtrack.db' },
  } satisfies Config;
  ```
  Agregar a `package.json`:
  ```json
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite",
    "db:migrate":  "drizzle-kit push:sqlite"
  }
  ```
  Agregar `healthtrack.db` a `.gitignore`.

---

## Fase 1 — Base de datos y dominio

- [ ] **T-04** Crear `src/db/schema.ts` con las tablas `user_profile` y `weight_entry`.
  _Ver sección "Esquema de base de datos" en design.md._

- [ ] **T-05** Crear `src/db/index.ts` — instancia singleton de `better-sqlite3`.
  ```ts
  import Database from 'better-sqlite3';
  import { drizzle } from 'drizzle-orm/better-sqlite3';
  import * as schema from './schema';

  const sqlite = new Database('./healthtrack.db');
  export const db = drizzle(sqlite, { schema });
  ```

- [ ] **T-06** Generar y aplicar la migración inicial.
  ```bash
  npm run db:generate
  npm run db:migrate
  ```

- [ ] **T-07** Crear `src/lib/constants.ts` con `FIXED_USER_ID = 'local-user'`.

- [ ] **T-08** Crear `src/domain/bmi.ts` con `calculateBMI(weightKg, heightCm)` y `classifyBMI`.
  _Ver implementación completa en design.md._

- [ ] **T-09** Escribir `src/domain/bmi.test.ts` con Vitest (tests unitarios de casos concretos).
  Casos a cubrir:
  - Resultado correcto para una persona de 70 kg / 175 cm → IMC 22.86, `'normal'`.
  - Límite inferior de `'underweight'`: IMC < 18.5.
  - Límite inferior de `'overweight'`: IMC ≥ 25.0.
  - Límite inferior de `'obese'`: IMC ≥ 30.0.
  - Precisión de 2 decimales.
  - `RangeError` con `weightKg <= 0`.
  - `RangeError` con `heightCm <= 0`.

- [x] **T-09b** Escribir `src/domain/bmi.property.test.ts` con Vitest + fast-check (property-based tests).
  Propiedades cubiertas (cientos de casos aleatorios por cada una):
  1. **Positividad** — IMC > 0 para toda entrada válida.
  2. **Precisión (RNF-01)** — valor ≤ 2 decimales; error de redondeo < 0.005.
  3. **Corrección de fórmula (RF-03)** — coincide con `weight / (height_m)²`.
  4. **Monotonía en peso** — más peso → IMC no decrece (misma altura).
  5. **Monotonía en altura** — más altura → IMC no crece (mismo peso).
  6. **Clasificación WHO (RF-04)** — categoría coincide con umbrales; underweight y obese cubiertos con generadores dirigidos.
  7. **Escala cuadrática** — escalar peso×k² y altura×k preserva el IMC (±0.01 por redondeo).
  8. **Rechazo de entradas inválidas** — `RangeError` para peso ≤ 0 y altura ≤ 0.
  9. **Universo de categorías** — ninguna entrada produce una categoría fuera del enum RF-04.
  
  Dependencia extra: `npm install -D fast-check`

---

## Fase 2 — Validación y repositorios

- [ ] **T-10** Crear `src/schemas/profile.schema.ts` con `profileSchema` (Zod).
  _Ver sección "Validación con Zod" en design.md._

- [ ] **T-11** Crear `src/schemas/weight.schema.ts` con `weightEntrySchema` (Zod).

- [ ] **T-12** Crear `src/lib/profile.repository.ts`.
  Exportar:
  - `getProfile(userId: string): Promise<UserProfile | null>`
  - `upsertProfile(userId: string, data: ProfileInput): Promise<UserProfile>`

- [ ] **T-13** Crear `src/lib/weight.repository.ts`.
  Exportar:
  - `listWeightEntries(userId: string): Promise<WeightEntry[]>` — orden `date DESC`
  - `getWeightEntry(id: string, userId: string): Promise<WeightEntry | null>`
  - `createWeightEntry(userId: string, data: WeightEntryInput, bmi: BMIResult): Promise<WeightEntry>`
  - `updateWeightEntry(id: string, userId: string, data: WeightEntryInput, bmi: BMIResult): Promise<WeightEntry>`
  - `deleteWeightEntry(id: string, userId: string): Promise<void>`
  
  Todas las queries filtran siempre por `userId` (RNF-03).

---

## Fase 3 — API Routes

- [ ] **T-14** Crear `src/app/api/profile/route.ts`.
  - `GET`: llama `getProfile(FIXED_USER_ID)` → 200 o 404.
  - `PUT`: valida body con `profileSchema`, llama `upsertProfile` → 200.

- [ ] **T-15** Crear `src/app/api/weight/route.ts`.
  - `GET`: llama `listWeightEntries(FIXED_USER_ID)` → 200 con array.
  - `POST`: valida body, obtiene perfil, llama `calculateBMI`, llama `createWeightEntry` → 201. Si no hay perfil → 400 con mensaje `'Complete tu perfil primero'`.

- [ ] **T-16** Crear `src/app/api/weight/[id]/route.ts`.
  - `PUT`: valida body, obtiene perfil, recalcula BMI, llama `updateWeightEntry`. Si la entrada no pertenece al usuario → 404.
  - `DELETE`: llama `deleteWeightEntry`. Si no existe → 404.

---

## Fase 4 — UI (páginas y componentes)

- [ ] **T-17** Crear `src/components/BMICategoryBadge.tsx`.
  Muestra la categoría con color: azul (bajo peso), verde (normal), amarillo (sobrepeso), rojo (obesidad). Incluye `aria-label` con texto completo para accesibilidad.

- [ ] **T-18** Crear `src/components/ProfileForm.tsx` (Client Component).
  - Campos: `heightCm` (number), `dateOfBirth` (date).
  - Validación en cliente con React Hook Form + `profileSchema`.
  - `onSubmit` → `PUT /api/profile`.
  - Redirige a `/weight` tras guardar.

- [ ] **T-19** Crear `src/app/profile/page.tsx` (Server Component).
  - Fetch inicial del perfil actual vía `getProfile`.
  - Pasa datos como `defaultValues` a `<ProfileForm>`.

- [ ] **T-20** Crear `src/components/WeightEntryForm.tsx` (Client Component).
  - Props: `defaultValues?: WeightEntryInput`, `entryId?: string`.
  - Campos: `date` (default: hoy), `weightKg`.
  - Validación con `weightEntrySchema`.
  - Si `entryId` → `PUT /api/weight/[id]`, si no → `POST /api/weight`.
  - Muestra preview del IMC calculado en tiempo real con `calculateBMI` en cliente.
  - Redirige a `/weight` tras guardar.

- [ ] **T-21** Crear `src/app/weight/new/page.tsx`.
  Renderiza `<WeightEntryForm>` en modo creación.

- [ ] **T-22** Crear `src/app/weight/[id]/page.tsx` (Server Component).
  - Fetch de la entrada por `id` vía `getWeightEntry`.
  - Pasa `defaultValues` y `entryId` a `<WeightEntryForm>`.

- [ ] **T-23** Crear `src/components/DeleteConfirmDialog.tsx` (Client Component).
  - Diálogo modal accesible (`role="dialog"`, `aria-modal`, focus trap básico).
  - Props: `entryId`, `onDeleted` callback.
  - Llama `DELETE /api/weight/[id]` → llama `onDeleted()`.

- [ ] **T-24** Crear `src/components/WeightHistoryTable.tsx`.
  - Muestra columnas: Fecha · Peso (kg) · IMC · Categoría · Acciones (editar / eliminar).
  - Usa `<BMICategoryBadge>` para la categoría.
  - Incluye `<DeleteConfirmDialog>` por fila.
  - Muestra estado vacío cuando no hay entradas (RF-05).

- [ ] **T-25** Crear `src/app/weight/page.tsx` (Server Component).
  - Fetch de entradas con `listWeightEntries`.
  - Renderiza `<WeightHistoryTable>` + enlace "Nueva entrada".
  - Si el perfil no está completo → banner que redirige a `/profile`.

- [ ] **T-26** Actualizar `src/app/page.tsx` para hacer redirect a `/weight`.

---

## Fase 5 — Calidad y pulido

- [ ] **T-27** Revisar que todas las etiquetas de categoría BMI estén en un único archivo de constantes (`src/lib/bmi-labels.ts`) para facilitar i18n futura (RNF-04).

- [ ] **T-28** Seed de 1 000 entradas de prueba y verificación visual de rendimiento del historial (RNF-02).
  ```bash
  # script: src/scripts/seed.ts
  npx tsx src/scripts/seed.ts
  ```

- [ ] **T-29** Revisión de accesibilidad básica:
  - Todos los `<input>` tienen `<label>` asociado.
  - `<BMICategoryBadge>` tiene `aria-label`.
  - Diálogo de confirmación tiene `role="dialog"` y `aria-modal="true"`.
  - Contraste de colores de badges ≥ 4.5:1 (WCAG AA).

---

## Dependencias entre tareas

```
T-00 → T-01 → T-02 → T-03 (scaffolding en serie)
T-03 → T-04 → T-05 → T-06 (DB en serie)
T-06, T-07 → T-08 → T-09 (dominio + tests)
T-08 → T-10, T-11 (schemas)
T-10, T-11, T-12 → T-14 (API profile)
T-10, T-11, T-13 → T-15, T-16 (API weight)
T-14 → T-18, T-19
T-15, T-16 → T-20, T-21, T-22, T-23, T-24
T-17 → T-24
T-19, T-24, T-25 → T-26
T-24 → T-27
T-13 → T-28
T-17, T-18, T-23 → T-29
```
