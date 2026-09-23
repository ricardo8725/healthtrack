---
inclusion: always
---

# HealthTrack — Project Structure

## Árbol de directorios

```
healthtrack/
├── .kiro/
│   ├── specs/
│   │   └── weight-tracking/         # Spec de la feature de peso e IMC
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── steering/
│       ├── product.md               # Contexto de producto
│       ├── tech.md                  # Stack y convenciones técnicas
│       └── structure.md             # Este archivo
│
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (fuente, metadata global)
│   │   ├── page.tsx                 # Redirect → /weight
│   │   ├── api/                     # Route Handlers (API)
│   │   │   ├── profile/
│   │   │   │   └── route.ts         # GET, PUT /api/profile
│   │   │   └── weight/
│   │   │       ├── route.ts         # GET, POST /api/weight
│   │   │       └── [id]/
│   │   │           └── route.ts     # PUT, DELETE /api/weight/[id]
│   │   ├── profile/
│   │   │   └── page.tsx             # Página de perfil de usuario
│   │   └── weight/
│   │       ├── page.tsx             # Historial de peso e IMC
│   │       ├── new/
│   │       │   └── page.tsx         # Nueva entrada de peso
│   │       └── [id]/
│   │           └── page.tsx         # Editar entrada existente
│   │
│   ├── components/                  # Componentes React reutilizables
│   │   ├── BMICategoryBadge.tsx     # Badge de color según categoría IMC
│   │   ├── DeleteConfirmDialog.tsx  # Modal de confirmación de borrado
│   │   ├── ProfileForm.tsx          # Formulario de perfil (Client Component)
│   │   ├── WeightEntryForm.tsx      # Formulario de peso (Client Component)
│   │   └── WeightHistoryTable.tsx   # Tabla de historial con acciones
│   │
│   ├── db/                          # Capa de base de datos
│   │   ├── index.ts                 # Singleton de better-sqlite3 + Drizzle
│   │   ├── schema.ts                # Definición de tablas (Drizzle)
│   │   └── migrations/              # SQL generado por drizzle-kit (no editar)
│   │
│   ├── domain/                      # Lógica de negocio pura
│   │   ├── bmi.ts                   # calculateBMI(), classifyBMI(), tipos BMI
│   │   └── bmi.test.ts              # Tests unitarios de dominio (Vitest)
│   │
│   ├── lib/                         # Utilidades y repositorios
│   │   ├── constants.ts             # FIXED_USER_ID y otras constantes globales
│   │   ├── bmi-labels.ts            # Etiquetas de texto para categorías IMC (i18n-ready)
│   │   ├── profile.repository.ts    # Queries de UserProfile
│   │   └── weight.repository.ts     # Queries de WeightEntry
│   │
│   └── schemas/                     # Schemas de validación Zod
│       ├── profile.schema.ts        # profileSchema + ProfileInput
│       └── weight.schema.ts         # weightEntrySchema + WeightEntryInput
│
├── .gitignore                       # Incluye: healthtrack.db, .env*, node_modules
├── drizzle.config.ts                # Configuración de drizzle-kit
├── healthtrack.db                   # Base de datos SQLite local (gitignored)
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

---

## Dónde va cada cosa

| Necesidad                                      | Ubicación correcta                        |
|------------------------------------------------|-------------------------------------------|
| Nueva tabla de base de datos                   | `src/db/schema.ts`                        |
| Nueva migración                                | `npm run db:generate` → `src/db/migrations/` |
| Lógica de cálculo o clasificación              | `src/domain/`                             |
| Test unitario                                  | Junto al archivo: `src/domain/*.test.ts`  |
| Reglas de validación de inputs                 | `src/schemas/`                            |
| Query a la base de datos                       | `src/lib/*.repository.ts`                 |
| Constante usada en múltiples archivos          | `src/lib/constants.ts`                    |
| Etiquetas de texto de categorías IMC           | `src/lib/bmi-labels.ts`                   |
| Endpoint de API                                | `src/app/api/**/route.ts`                 |
| Página con datos (Server Component)            | `src/app/**/page.tsx`                     |
| Componente interactivo (formulario, modal)     | `src/components/` con `'use client'`      |
| Componente de presentación reutilizable        | `src/components/` sin `'use client'`      |
| Script de utilidad (seed, migraciones custom)  | `src/scripts/`                            |

---

## Convenciones de nombrado de archivos

| Tipo de archivo               | Convención           | Ejemplo                       |
|-------------------------------|----------------------|-------------------------------|
| Componente React              | `PascalCase.tsx`     | `WeightHistoryTable.tsx`      |
| Página Next.js                | `page.tsx`           | `app/weight/page.tsx`         |
| Route Handler                 | `route.ts`           | `app/api/weight/route.ts`     |
| Repositorio                   | `*.repository.ts`    | `weight.repository.ts`        |
| Schema Zod                    | `*.schema.ts`        | `weight.schema.ts`            |
| Dominio / utilidad            | `kebab-case.ts`      | `bmi.ts`, `bmi-labels.ts`     |
| Test                          | `*.test.ts`          | `bmi.test.ts`                 |
| Config de herramienta         | `kebab-case.config.ts` | `drizzle.config.ts`         |

---

## Rutas de la aplicación

| Ruta              | Componente principal      | Descripción                          |
|-------------------|---------------------------|--------------------------------------|
| `/`               | `app/page.tsx`            | Redirect automático a `/weight`      |
| `/profile`        | `app/profile/page.tsx`    | Ver y editar perfil de usuario       |
| `/weight`         | `app/weight/page.tsx`     | Historial de peso e IMC              |
| `/weight/new`     | `app/weight/new/page.tsx` | Formulario de nueva entrada de peso  |
| `/weight/[id]`    | `app/weight/[id]/page.tsx`| Formulario de edición de entrada     |

---

## Archivos que NO se editan manualmente

- `src/db/migrations/*` — generados por `drizzle-kit`. Modificar a mano corrompe el estado de migraciones.
- `healthtrack.db` — archivo binario de SQLite, no es código fuente.
- `.next/` — output de build de Next.js.
