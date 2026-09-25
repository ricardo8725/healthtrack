# HealthTrack

> Personal health tracking web app: register your weight, get your BMI calculated and
> classified automatically, and review your history over time. First feature of a broader
> health platform (medical exams, medications, exercise, and future Apple Health / Garmin sync).
>
> Built entirely with [Kiro](https://kiro.dev) for the **Kiro University Challenge 2026**.

---

## 🚀 Quick start (for reviewers)

**Requirements:** Node.js ≥ 18 (developed on Node 20+) and npm.

```bash
# 1. Clone and enter the repo
git clone https://github.com/ricardo8725/healthtrack
cd healthtrack

# 2. Install dependencies
npm install

# 3. Create the local SQLite database (applies migrations)
npm run db:migrate

# 4. Start the app
npm run dev
```

Open **http://localhost:3000** — you'll be redirected to the weight history.

To run the automated tests:

```bash
npm test        # 22 tests: 9 unit + 13 property-based (fast-check)
```

To produce a production build:

```bash
npm run build   # compiles, type-checks, and lints all routes
```

---

## ✅ How to validate the app works

The app implements a full CRUD flow for weight + BMI tracking. Follow this path in the browser:

1. **Set up your profile (RF-01)** — the home page shows an empty history with a banner
   prompting you to complete your profile. Click **Perfil**, enter a height (e.g. `175`)
   and date of birth, then **Guardar perfil**.
   - _Validation check:_ try height `0` or empty → it shows an inline error and won't save.

2. **Register a weight (RF-02, RF-03, RF-04)** — click **Nueva entrada**. Type a weight
   (e.g. `80`) and watch the **BMI compute live** with its color-coded category badge
   *before* you save.
   - _Validation check:_ enter `900` → rejected with "El peso no puede superar 700 kg".

3. **View history (RF-05)** — after saving you land on `/weight`, a table sorted by date
   descending: Date · Weight · BMI · Category · Actions. Add several entries to see the
   category colors change (underweight / normal / overweight / obese).

4. **Edit an entry (RF-06)** — click **Editar** on any row, change the weight, save.
   The BMI and category **recalculate automatically**.

5. **Delete an entry (RF-07)** — click **Eliminar**. A confirmation dialog appears;
   **Cancelar** keeps it, **Eliminar** removes it. (Press **Escape** to close — accessible dialog.)

The API layer can also be validated directly:

```bash
# Create a profile
curl -X PUT http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{"heightCm":175,"dateOfBirth":"1990-04-15"}'

# Create a weight entry — BMI is calculated server-side
curl -X POST http://localhost:3000/api/weight \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-09-20","weightKg":80}'

# List history
curl http://localhost:3000/api/weight
```

---

## 🎓 Kiro University Challenge — lesson evidence

| Lesson | Evidence in the repo | Status |
|---|---|---|
| 1. Specs | `.kiro/specs/weight-tracking/` — requirements (EARS), design, tasks, progress-log | ✅ |
| 2. Steering | `.kiro/steering/` — product, tech, structure, tooling | ✅ |
| 3. Hooks | `.kiro/hooks/test-on-lib-save.json` — runs `npm test` on `src/lib/*.ts` save | ✅ |
| 4. Property-based testing | `src/domain/bmi.property.test.ts` — 13 invariants (fast-check + Vitest) | ✅ |
| 5. Powers | `.kiro/settings/mcp.json.example` — Terraform + Checkmarx configured under `"powers"` | ✅ |
| 6. MCP | `mcp-servers/health-import/` — local MCP server with 3 tools, connected to Kiro | ✅ |
| 7. Custom agents | `.kiro/agents/health-data-importer.md` — scoped import agent with validation | ✅ |
| Bonus 1 (Cloud) | Commits authored by `kiro-agent` — a cloud session writing to the repo | ✅ |
| Bonus 2 (Package a Power) | [`power-health-data-integration`](https://github.com/ricardo8725/power-health-data-integration) — published as a standalone Kiro Power | ✅ |

---

## 🧩 Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **SQLite** via `better-sqlite3` + **Drizzle ORM** (migrations)
- **Zod** — validation schemas shared between API routes and client forms
- **React Hook Form** — client-side forms with the same Zod schemas
- **Tailwind CSS** — styling
- **Vitest** + **fast-check** — unit and property-based tests

Full architecture in `.kiro/specs/weight-tracking/design.md`.

---

## 🗺️ Feature status

| Module | Status |
|---|---|
| **Weight & BMI tracking** | ✅ Implemented (this feature — full CRUD, tests, validation) |
| Medical exams | Planned |
| Medications | Planned |
| Exercise | Planned |
| Apple Health / Garmin sync | Future (pattern demonstrated via the MCP server) |

---

## 📁 Project structure

```
healthtrack/
├── .kiro/
│   ├── agents/          # Custom agent: health-data-importer (Lesson 7)
│   ├── hooks/           # test-on-lib-save (Lesson 3)
│   ├── settings/        # mcp.json.example — Powers + MCP (Lessons 5 & 6)
│   ├── specs/           # weight-tracking spec: requirements/design/tasks (Lesson 1)
│   └── steering/        # product, tech, structure, tooling (Lesson 2)
├── mcp-servers/
│   └── health-import/   # Local MCP server, 3 tools, synthetic data (Lesson 6)
├── powers/
│   └── health-data-integration/   # Packaged Kiro Power (Bonus 2)
└── src/
    ├── app/             # Next.js App Router: pages + API routes
    │   ├── api/         # /api/profile, /api/weight, /api/weight/[id]
    │   ├── profile/     # profile page
    │   └── weight/      # history, new entry, edit entry
    ├── components/      # BMICategoryBadge, forms, history table, delete dialog
    ├── db/              # Drizzle schema, singleton connection, migrations
    ├── domain/          # calculateBMI (pure) + unit & property tests
    ├── lib/             # repositories, constants, BMI labels (i18n-ready)
    ├── schemas/         # Zod schemas
    └── scripts/         # seed.ts (1000-row performance check)
```

---

## 🔌 MCP server — health-import (Lesson 6)

A local MCP server that simulates an external health data source (Apple Health / Garmin)
with **synthetic, fictitious data** — no real health records, no credentials.

```bash
cd mcp-servers/health-import
npm install && npm run build

# Smoke test the MCP handshake
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}' \
  | node dist/index.js
```

To connect it in Kiro, copy `.kiro/settings/mcp.json.example` to `~/.kiro/settings/mcp.json`
and replace `<ABSOLUTE_PATH_TO_REPO>` with your local path. See `.kiro/steering/tooling.md` for details.

> The Terraform and Checkmarx Powers (Lesson 5) require Docker and a Checkmarx One account
> respectively — they are **optional** and not needed to run or validate the app.

---

## 🔒 Privacy & data safety

- The local database (`healthtrack.db`) is gitignored and never committed.
- All sample health data in the MCP server is synthetic and explicitly labeled as fictitious.
- No secrets or credentials are committed — `mcp.json.example` uses placeholders only.

---

## License

MIT
