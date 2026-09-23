---
inclusion: always
---

# HealthTrack — Tech Stack & Conventions

## Stack

| Capa              | Tecnología                          | Versión mínima |
|-------------------|-------------------------------------|----------------|
| Framework         | Next.js (App Router)                | 14             |
| Lenguaje          | TypeScript                          | 5              |
| Base de datos     | SQLite via `better-sqlite3`         | —              |
| ORM / migraciones | Drizzle ORM + `drizzle-kit`         | —              |
| Validación        | Zod                                 | 3              |
| UI                | React + Tailwind CSS                | React 18       |
| Formularios       | React Hook Form + `@hookform/resolvers` | —          |
| Tests             | Vitest                              | —              |

---

## Reglas de arquitectura

### Capas y dependencias permitidas

```
UI (components, pages)
  └── puede importar de: schemas, domain, lib
API Routes (app/api/**/route.ts)
  └── puede importar de: schemas, domain, lib, db
lib (repositories)
  └── puede importar de: db, schemas, domain
domain
  └── sin imports del proyecto — solo stdlib y tipos
db
  └── solo drizzle y better-sqlite3
schemas
  └── solo zod
```

Las capas superiores pueden importar hacia abajo; **nunca hacia arriba**. Por ejemplo, `domain/bmi.ts` no puede importar de `lib/` ni de `app/`.

### Dominio puro

- `src/domain/` contiene únicamente lógica de negocio sin side-effects.
- Las funciones de dominio son puras: misma entrada → misma salida, sin llamadas a DB, sin fetch, sin estado global.
- `calculateBMI` es la función canónica del dominio. Se puede importar tanto en el servidor como en el cliente.

### Base de datos

- Un único archivo `healthtrack.db` en la raíz del proyecto (gitignored).
- La instancia de `better-sqlite3` es un **singleton** exportado desde `src/db/index.ts`. No se crean instancias adicionales en ningún otro archivo.
- Todas las migraciones se generan con `drizzle-kit` y viven en `src/db/migrations/`. No se ejecutan sentencias DDL manuales.
- Las fechas se almacenan como `TEXT` en formato `YYYY-MM-DD` (ISO 8601). Los timestamps como `INTEGER` (Unix epoch).
- Los IDs son UUID v4 generados en la capa de repositorio antes del INSERT.

### Validación

- Los schemas Zod viven en `src/schemas/` y son la única fuente de verdad para la forma de los datos entrantes.
- El mismo schema se reutiliza en el API route (server-side parse) y en el formulario React (resolver de React Hook Form). No se duplican reglas de validación.
- Los API routes devuelven los errores de Zod como `400` con el detalle de `error.flatten()`.

### API Routes

- Usan los handlers de Next.js App Router (`export async function GET/POST/PUT/DELETE`).
- Responden siempre JSON. En error, incluyen `{ error: string }` o `{ errors: ZodFlattenedError }`.
- Códigos de estado estándar: `200` OK, `201` Created, `400` Bad Request, `404` Not Found, `500` Internal Server Error.
- Por ahora, el `userId` se obtiene de la constante `FIXED_USER_ID` en `src/lib/constants.ts`. Cuando se añada auth, ese es el único punto de cambio.

### Componentes React

- Los Server Components hacen fetch directo a repositorios (sin pasar por API routes).
- Los Client Components (`'use client'`) se usan exclusivamente cuando se necesita estado interactivo, eventos del navegador o hooks de React.
- Los formularios son siempre Client Components con React Hook Form + resolver Zod.
- Cada componente tiene una sola responsabilidad. No hay componentes "página" que también sean formularios.

---

## Comandos de desarrollo

```bash
npm run dev          # Servidor de desarrollo Next.js
npm run build        # Build de producción
npm run test         # Vitest en modo single-run
npm run db:generate  # Genera SQL de migración desde el schema
npm run db:migrate   # Aplica migraciones pendientes a healthtrack.db
```

---

## Convenciones de código

- **Nombres de archivos:** `kebab-case` para utilidades y configs; `PascalCase` para componentes React (`.tsx`).
- **Nombres de funciones/variables:** `camelCase`.
- **Tipos e interfaces:** `PascalCase`. Preferir `interface` para formas de objetos, `type` para uniones y aliases.
- **Exports:** preferir exports nombrados sobre default exports, excepto en páginas Next.js (que requieren default export).
- **No `any`.** Si el tipo no se puede inferir, se declara explícitamente. `unknown` es preferible a `any`.
- **Errores:** las funciones de dominio lanzan excepciones tipadas (`RangeError`, `Error`). Los repositorios dejan propagar los errores de DB; los API routes los capturan y responden `500`.
- **Comentarios:** se usan para explicar el *por qué*, no el *qué*. El código debe ser autoexplicativo.

---

## Testing

- Los tests unitarios viven junto al archivo que prueban: `bmi.ts` → `bmi.test.ts`.
- Solo se testea la capa de dominio con Vitest. Los repositorios y API routes se validan manualmente o con tests de integración futuros.
- Los tests no tocan la base de datos de producción (`healthtrack.db`).
- Convención de nombres de tests: `describe('calculateBMI')` → `it('returns normal for 70kg / 175cm')`.

---

## Lo que NO se hace en este proyecto

- No se usa `fetch` dentro de Server Components para llamar a las propias API routes; se importan los repositorios directamente.
- No se instala Redux, Zustand ni ningún gestor de estado global. El estado de UI vive en componentes locales o en URL params.
- No se crean endpoints REST para operaciones que no tienen UI asociada.
- No se añaden dependencias de UI externas (component libraries) sin discutirlo primero. Tailwind CSS es suficiente.
