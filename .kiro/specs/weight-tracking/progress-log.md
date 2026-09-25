# Progress Log — weight-tracking implementation

## Estado actual

- Última tarea completada: T-29 — PROYECTO COMPLETO (T-00 a T-29)
- Próxima tarea a ejecutar: ninguna — feature weight-tracking terminada
- Fecha: 2026-09-25

### Verificación final (2026-09-25)
- `npm run build` → ✓ 10 rutas generadas, typecheck + lint OK
- `npm test` → ✓ 22/22 tests (9 unit + 13 property)
- Flujo API e2e (curl) → ✓ crear perfil, crear peso (IMC auto), validación 400,
  listar, editar (recalcula IMC), eliminar (204), lista vacía final
- Rendimiento (RNF-02) → 1000 entradas, query historial en 1 ms (límite: 500 ms)
- Accesibilidad (RNF-04/WCAG) → labels, aria-label, role=dialog, contraste 6.38–7.15:1
- DB limpiada tras las pruebas (0 entries, 0 profiles)

## Historial

---

## [T-00] Crear el proyecto Next.js con App Router y Tailwind CSS

- Estado: completada
- Fecha: 2026-09-25

- Archivos creados/modificados:
  - `package.json` — nombre: healthtrack, scripts: dev/build/start/lint
  - `package-lock.json`
  - `tsconfig.json` — target ES2017, paths alias `@/*` → `./src/*`
  - `next.config.mjs`
  - `tailwind.config.ts`
  - `postcss.config.mjs`
  - `eslint.config.mjs`
  - `src/app/layout.tsx` — metadata title actualizado a "HealthTrack"
  - `src/app/page.tsx` — boilerplate de Next.js (se reemplazará en T-26)
  - `src/app/globals.css` — Tailwind base/components/utilities
  - `src/app/favicon.ico`
  - `src/app/fonts/` — GeistSans + GeistMono (woff)
  - Directorios vacíos creados:
    `src/app/api/profile/`, `src/app/api/weight/`, `src/app/profile/`,
    `src/app/weight/new/`, `src/app/weight/[id]/`,
    `src/components/`, `src/db/migrations/`,
    `src/lib/`, `src/schemas/`, `src/scripts/`

- Comandos ejecutados:
  - `npm install -g create-next-app@14` (instalación global del CLI)
  - `create-next-app /tmp/healthtrack-scaffold --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git`
  - Copia manual del scaffold al repo raíz (evitando pisar `.kiro/`, `mcp-servers/`, `powers/`, `README.md`)
  - `npm install` (instalación de dependencias en el repo raíz)
  - `npm run dev` → ✓ Ready in 3s en http://localhost:3000

- Decisiones tomadas:
  - **Scaffold en /tmp + copia manual**: `create-next-app` rechaza directorios no vacíos.
    Se generó en `/tmp/healthtrack-scaffold` y se copiaron solo los archivos de Next.js,
    preservando todo `.kiro/`, `mcp-servers/`, `powers/`, `src/domain/` existentes.
  - **`src/domain/` preservada**: `bmi.property.test.ts` ya existía de la Lección 4.
    No se pisó. La carpeta convive con los archivos de Next.js en `src/`.
  - **Next.js 14.2.35**: versión instalada (14.x tal como define el spec).
  - **`next.config.mjs`** (no `.ts`): el scaffold de Next.js 14 genera `.mjs` por defecto.
    No requiere cambio — funciona igual.
  - **Nombre en package.json**: corregido de `healthtrack-scaffold` a `healthtrack`.

- Notas para continuar (contexto para una sesión nueva):
  - El repo tiene TANTO archivos de Next.js (package.json, tsconfig, src/app/) COMO
    los archivos previos de Kiro (.kiro/, mcp-servers/, powers/). Todo convive sin conflicto.
  - `node_modules/` está en la raíz (instalado). NO está en mcp-servers/health-import/
    (ese tiene su propio package.json y necesita `npm install` por separado si se usa).
  - La carpeta `src/db/migrations/` está vacía — se llenará en T-06.
  - El `src/app/page.tsx` actual es el boilerplate de Next.js. Se reemplazará en T-26
    con el redirect a `/weight`.
  - T-09b (bmi.property.test.ts) ya está completada (Lección 4 del challenge).
    fast-check AÚN NO está instalado en package.json — se instala en T-02.

- Próxima tarea: T-01 — Instalar dependencias de base de datos, ORM y validación


---

## [T-01] Instalar dependencias de base de datos, ORM y validación

- Estado: completada
- Fecha: 2026-09-25

- Archivos creados/modificados:
  - `package.json` — 7 dependencias nuevas añadidas
  - `package-lock.json` — actualizado
  - `tsconfig.json` — añadido `mcp-servers` y `powers` al `exclude`
    (son subproyectos independientes con su propio tsconfig/node_modules;
     el typecheck del proyecto principal no debe escanearlos)

- Comandos ejecutados:
  - `npm install better-sqlite3 drizzle-orm`
  - `npm install -D drizzle-kit @types/better-sqlite3`
  - `npm install zod react-hook-form @hookform/resolvers`
  - `npm ls zod @hookform/resolvers` (verificación de peer deps — sin conflictos)
  - `npx tsc --noEmit` (verificación de typecheck)

- Versiones instaladas:
  - better-sqlite3 ^13.0.3
  - drizzle-orm ^0.45.3
  - drizzle-kit ^0.31.11 (dev)
  - @types/better-sqlite3 ^9.6.0 (dev)
  - zod ^4.6.5
  - react-hook-form ^7.88.0
  - @hookform/resolvers ^5.9.1

- Decisiones tomadas:
  - **Zod v4 (no v3)**: npm instaló Zod ^4.6.5. El steering tech.md indica "Zod v3 mínima",
    pero v4 es compatible con toda la API que usa el spec (`z.object`, `z.infer`, `.regex`,
    `.positive`, `.max`, `error.flatten()`) y `@hookform/resolvers@5` la soporta nativamente.
    `npm ls` confirma que no hay conflicto de peer dependencies (zod deduped a 4.6.5).
    → Si en el futuro se prefiere v3 estricto: `npm install zod@^3` + `@hookform/resolvers@^3`.
  - **tsconfig exclude**: el `include: ["**/*.ts"]` del scaffold capturaba `powers/` y
    `mcp-servers/`, generando errores de módulos no encontrados (esos subproyectos tienen
    su propio node_modules). Se añadieron al `exclude`. Ahora el typecheck raíz es limpio
    salvo por bmi.property.test.ts (esperado — ver abajo).

- Notas para continuar (contexto para una sesión nueva):
  - `npx tsc --noEmit` reporta 32 errores, TODOS en `src/domain/bmi.property.test.ts`.
    NO son regresiones — son porque `vitest`, `fast-check` y `./bmi` aún no existen:
      · vitest + fast-check → se instalan en T-02
      · src/domain/bmi.ts   → se crea en T-08
    Una vez completados T-02 y T-08, esos 32 errores desaparecen. El código de Next.js
    (src/app/**) compila sin errores.
  - `better-sqlite3` es un binario nativo — compiló correctamente contra Node 26 en esta
    máquina (macOS/darwin). Si se cambia de máquina o versión de Node, correr `npm rebuild
    better-sqlite3` o `npm install` de nuevo.
  - Aún NO se han creado `drizzle.config.ts` ni `vitest.config.ts` — eso es T-02 y T-03.

- Próxima tarea: T-02 — Instalar y configurar Vitest y fast-check


---

## [T-02 → T-06] Config (Vitest, Drizzle) + Base de datos

- Estado: completadas
- Fecha: 2026-09-25

- Archivos: `vitest.config.ts`, `drizzle.config.ts`, `src/db/schema.ts`,
  `src/db/index.ts`, `src/db/migrations/0000_neat_saracen.sql`, `package.json` (scripts)
- Comandos: `npm i -D vitest@^1.6.0 @vitejs/plugin-react fast-check`,
  `npm run db:generate`, `npm run db:migrate`

- Decisiones:
  - **Vitest 1.6, no 5.x**: Vitest 5 exige `@types/node ^22 || >=24`, pero el scaffold
    de Next 14 fija `@types/node@20`. Vitest 1.6 es compatible y estable con Next 14.
  - **drizzle-kit 0.31**: el spec (design.md) usaba el formato viejo (`driver: 'better-sqlite'`,
    `generate:sqlite`). El formato 0.31 usa `dialect: 'sqlite'` y comandos `generate`/`migrate`
    sin sufijo. drizzle.config.ts y los scripts se actualizaron al formato nuevo.
  - **foreign_keys ON**: añadido `sqlite.pragma('foreign_keys = ON')` en db/index.ts
    (SQLite no los aplica por defecto).

## [T-07 → T-11, T-27] Dominio, schemas, constantes, labels

- Estado: completadas
- Archivos: `src/lib/constants.ts`, `src/domain/bmi.ts`, `src/domain/bmi.test.ts`,
  `src/schemas/profile.schema.ts`, `src/schemas/weight.schema.ts`, `src/lib/bmi-labels.ts`
- FIX: `src/domain/bmi.property.test.ts` (Lección 4) usaba `fc.float` que en fast-check v4
  exige floats de 32-bit → reemplazado por `fc.double` (13 ocurrencias). 22/22 tests pasan.
- Nota: `bmi-labels.ts` (T-27) se adelantó porque `BMICategoryBadge` lo importa.

## [T-12 → T-16] Repositorios + API Routes

- Estado: completadas
- Archivos: `src/lib/profile.repository.ts`, `src/lib/weight.repository.ts`,
  `src/app/api/profile/route.ts`, `src/app/api/weight/route.ts`, `src/app/api/weight/[id]/route.ts`
- Todas las queries filtran por `userId` (RNF-03). POST /api/weight verifica perfil → 400
  "Complete tu perfil primero". PUT/DELETE → 404 si la entrada no existe/no es del usuario.
  Errores Zod → 400 con `error.flatten()`. DELETE → 204.

## [T-17 → T-26] UI (componentes + páginas)

- Estado: completadas
- Archivos: `BMICategoryBadge.tsx`, `ProfileForm.tsx`, `WeightEntryForm.tsx`,
  `DeleteConfirmDialog.tsx`, `WeightHistoryTable.tsx`, y páginas
  `profile/page.tsx`, `weight/page.tsx`, `weight/new/page.tsx`, `weight/[id]/page.tsx`,
  `page.tsx` (redirect a /weight)
- Server Components (páginas) hacen fetch directo a repositorios; formularios y tabla son
  Client Components. WeightEntryForm muestra preview de IMC en vivo con `calculateBMI`.
  Páginas de peso redirigen a /profile si no hay perfil.

## [T-28] Seed + rendimiento (RNF-02)

- Estado: completada
- Archivo: `src/scripts/seed.ts`
- Comando: `npx tsx src/scripts/seed.ts`
- FIX: `db.transaction()` de Drizzle pasa el objeto tx al callback, no un array externo.
  Reescrito para usar `tx.insert()` dentro del callback.
- Resultado: 1000 entradas en 39 ms; query de historial en 1 ms (RNF-02 <500ms ✓).
- La DB se limpió tras la medición.

## [T-29] Accesibilidad (WCAG AA)

- Estado: completada
- Verificado: todos los inputs con `<label htmlFor>`; badge con `aria-label`;
  dialog con `role="dialog"` + `aria-modal="true"` + `aria-labelledby` + focus/Escape;
  contraste de los 4 badges medido programáticamente: 6.38–7.15:1 (≥ 4.5:1 requerido).

- Notas para continuar:
  - La feature weight-tracking está COMPLETA y verificada (build + tests + e2e).
  - Próximos módulos del producto (fuera de este spec): exámenes médicos, medicinas,
    ejercicio, integración Apple Health/Garmin.
  - `tsx` se usó vía `npx` (no está en devDependencies). Si se quiere fijar, añadir
    `npm i -D tsx` y un script `"seed": "tsx src/scripts/seed.ts"`.
