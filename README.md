# HealthTrack

> Personal health control app: weight, medical exams, medications, BMI, exercise —
> with future integration to Apple Health and Garmin.
>
> Built entirely with [Kiro](https://kiro.dev) as part of the **Kiro University Challenge**.

---

## Kiro University Challenge — Progress

| Lesson | Evidence | Status |
|---|---|---|
| 1. Specs | `.kiro/specs/weight-tracking/` — requirements, design, tasks | ✅ |
| 2. Steering | `.kiro/steering/` — product, tech, structure, tooling | ✅ |
| 3. Hooks | `.kiro/hooks/test-on-lib-save.json` — runs `npm test` on every `src/lib/*.ts` save | ✅ |
| 4. Property-based testing | `src/domain/bmi.property.test.ts` — 9 invariants, fast-check + Vitest | ✅ |
| 5. Powers | `mcp.json.example` — Terraform (Docker) + Checkmarx MCP servers configured under `"powers"` | ✅ |
| 6. MCP | `mcp-servers/health-import/` — local MCP server with 3 tools, connected to Kiro | ✅ |
| 7. Custom agents | `.kiro/agents/health-data-importer.md` — scoped import agent with validation rules | ✅ |
| Bonus 1 (Cloud) | Commits by `kiro-agent` author — evidence of a cloud session writing to the repo | ✅ |
| Bonus 2 (Package a Power) | [`power-health-data-integration`](https://github.com/ricardo8725/power-health-data-integration) — submitted to Kiro Power registry | ✅ |

---

## Why Terraform and Checkmarx Powers?

The two IDE-installed Powers (Lesson 5) were chosen intentionally for HealthTrack's
production path:

- **Checkmarx** — used to scan the HealthTrack codebase for vulnerabilities (SAST),
  secret detection, and IaC issues. Health apps handle sensitive personal data,
  so security scanning from day one is non-negotiable.
- **Terraform** — infrastructure-as-code ready for when HealthTrack moves from local
  SQLite to a cloud deployment (Neon Postgres, AWS, etc.). The Power is configured but
  disabled until a cloud target is defined.

Neither requires real credentials to demonstrate the configuration — the `mcp.json.example`
documents both with placeholders.

---

## MCP Server — health-import

The `mcp-servers/health-import/` server runs **locally with no credentials**.

```bash
# Build
cd mcp-servers/health-import
npm install && npm run build

# Smoke test
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}' \
  | node dist/index.js
# Expected: ✅ health-import MCP server running via stdio
#           {"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},...}}

# Test list_sample_records
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_sample_records","arguments":{}}}' \
  | node dist/index.js
```

To connect it to Kiro, add this to `~/.kiro/settings/mcp.json`
(copy from `.kiro/settings/mcp.json.example` and replace the path):

```json
{
  "mcpServers": {
    "healthtrack-health-import": {
      "command": "node",
      "args": ["/absolute/path/to/healthtrack/mcp-servers/health-import/dist/index.js"],
      "env": {},
      "disabled": false
    }
  }
}
```

> The Terraform and Checkmarx powers require Docker and a Checkmarx One account
> respectively. They are **optional** — the rest of the project works without them.

---

## Running tests (Lesson 4 — Property-based testing)

The property-based tests for `calculateBMI` use [fast-check](https://fast-check.dev/)
and Vitest. Once the main project is initialized:

```bash
npm install          # installs vitest and fast-check
npm test             # runs bmi.property.test.ts — 9 properties, ~900 random cases
```

The test hook (Lesson 3) fires automatically when any `src/lib/*.ts` file is saved
in Kiro, running `npm test` immediately.

---

## Custom agent — health-data-importer (Lesson 7)

The agent at `.kiro/agents/health-data-importer.md` is scoped exclusively to importing
health records from the MCP server. To activate it:

1. Click the agent selector icon in the Kiro chat input
2. Select **health-data-importer**
3. Ask: _"Import all weight records from the MCP server"_

The agent will query the MCP tools, validate every record against physiological ranges,
and report valid vs. rejected records explicitly — never silently.

---

## Project structure

```
healthtrack/
├── .kiro/
│   ├── agents/          # Custom agents (Lesson 7)
│   ├── hooks/           # Automation hooks (Lesson 3)
│   ├── settings/        # mcp.json.example (Lesson 5 & 6)
│   ├── specs/           # Feature specs (Lesson 1)
│   └── steering/        # Always-on context files (Lesson 2)
├── mcp-servers/
│   └── health-import/   # Local MCP server (Lesson 6)
├── powers/
│   └── health-data-integration/  # Packaged Power (Bonus 2)
│       → published at github.com/ricardo8725/power-health-data-integration
└── src/
    └── domain/
        └── bmi.property.test.ts  # Property-based tests (Lesson 4)
```

---

## Tech stack (planned — spec complete, implementation next)

- **Next.js 14** (App Router) + TypeScript
- **SQLite** via `better-sqlite3` + **Drizzle ORM**
- **Zod** — shared validation schemas (API + client)
- **React Hook Form** — client-side forms
- **Tailwind CSS** — styling
- **Vitest** + **fast-check** — unit + property-based tests

See `.kiro/specs/weight-tracking/design.md` for the full architecture.

---

## License

MIT
