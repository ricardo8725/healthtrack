---
inclusion: always
---

# HealthTrack — Tooling & Kiro Powers

## Kiro IDE

Este proyecto está desarrollado con [Kiro](https://kiro.dev), un entorno de desarrollo
con IA que usa specs, steering files, hooks y agentes para guiar la implementación.

### Estructura .kiro/

```
.kiro/
├── hooks/
│   └── test-on-lib-save.json     # Ejecuta npm run test al guardar archivos en src/lib/
├── settings/
│   └── mcp.json.example          # Plantilla de configuración MCP/Powers (sin secretos)
├── specs/
│   └── weight-tracking/          # Spec completo de la feature de peso e IMC
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
└── steering/
    ├── product.md                 # Contexto de producto y dominio
    ├── tech.md                    # Stack y convenciones técnicas
    ├── structure.md               # Estructura de directorios y nombrado
    └── tooling.md                 # Este archivo — Powers, MCPs y setup

mcp-servers/
└── health-import/                # Servidor MCP propio del proyecto
    ├── src/index.ts              # Implementación de las 3 tools
    ├── data/sample-health-data.json  # Dataset sintético (~15 registros)
    ├── dist/index.js             # Compilado — punto de entrada para Kiro
    ├── package.json
    └── tsconfig.json
```

---

## Servidor MCP propio: health-import

Servidor MCP desarrollado para HealthTrack como parte de la **Lección 6 (MCP) del Kiro University Challenge**. Demuestra el flujo completo: fuente de datos externa → tools MCP → schema WeightEntry de la app.

| Campo       | Valor                                                                 |
|-------------|-----------------------------------------------------------------------|
| Ubicación   | `mcp-servers/health-import/`                                          |
| SDK         | `@modelcontextprotocol/sdk` v1.30.0                                   |
| Transporte  | stdio (JSON-RPC sobre stdin/stdout)                                   |
| Datos       | Sintéticos — 15 registros ficticios de peso (jul–sep 2026)            |
| Entry point | `mcp-servers/health-import/dist/index.js`                             |

### Tools expuestas

| Tool                               | Descripción                                                                      |
|------------------------------------|----------------------------------------------------------------------------------|
| `list_sample_records`              | Lista los 15 registros sintéticos con IMC calculado                              |
| `get_record_by_id`                 | Devuelve el detalle de un registro por su `id` (ej. `"ext-007"`)                 |
| `import_records_to_weight_tracking`| Filtra por rango de fechas o lista de ids y devuelve payloads listos para insertar en `weight_entry` |

### Build y prueba manual

```bash
# Compilar (solo necesario tras cambios en src/)
cd mcp-servers/health-import
npm run build

# Prueba manual del handshake MCP via stdio
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"0.0.1"}}}' \
  | node dist/index.js

# Probar list_sample_records
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_sample_records","arguments":{}}}' \
  | node dist/index.js

# Probar import_records_to_weight_tracking con rango de fechas
echo '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"import_records_to_weight_tracking","arguments":{"fromDate":"2026-09-01","toDate":"2026-09-22"}}}' \
  | node dist/index.js
```

> ⚠️ Los datos de `sample-health-data.json` son **completamente ficticios**, generados solo para demostrar la integración. No representan mediciones reales de ninguna persona.

### Configuración en Kiro (ya activa)

El servidor está registrado en `~/.kiro/settings/mcp.json` bajo la clave `healthtrack-health-import`. Para nuevos colaboradores, el `mcp.json.example` incluye la entrada con un placeholder para la ruta:

```json
"healthtrack-health-import": {
  "command": "node",
  "args": ["<ABSOLUTE_PATH_TO_REPO>/mcp-servers/health-import/dist/index.js"],
  "env": {},
  "disabled": false
}
```

Pasos para activarlo en un clon nuevo:
```bash
# 1. Compilar el servidor
cd mcp-servers/health-import && npm install && npm run build

# 2. Agregar la entrada al mcp.json de usuario con la ruta absoluta correcta
# (o copiar desde .kiro/settings/mcp.json.example y ajustar <ABSOLUTE_PATH_TO_REPO>)
```

---

## Kiro Powers activados

Los Powers extienden las capacidades del agente con herramientas especializadas vía MCP
(Model Context Protocol). La configuración real vive en `~/.kiro/settings/mcp.json`
(nivel usuario, fuera del repo). El archivo `.kiro/settings/mcp.json.example` en este
repo documenta los Powers utilizados con placeholders seguros.

### Power: Terraform

| Campo       | Valor                            |
|-------------|----------------------------------|
| Provider    | HashiCorp                        |
| MCP server  | `hashicorp/terraform-mcp-server` |
| Transporte  | Docker (`docker run -i --rm`)    |
| Uso previsto| IaC si el proyecto se despliega  |

**Prerequisito:** Docker instalado y corriendo localmente.

Para activarlo, copiar `.kiro/settings/mcp.json.example` a `~/.kiro/settings/mcp.json`
(o fusionar con el existente). No se requiere configuración adicional para Terraform.

### Power: Checkmarx

| Campo       | Valor                                        |
|-------------|----------------------------------------------|
| Provider    | Checkmarx                                    |
| MCP server  | Checkmarx One REST API                       |
| Transporte  | HTTP (URL remota)                            |
| Uso previsto| SAST, detección de secretos, análisis de IaC |

**Prerequisito:** Cuenta activa en Checkmarx One con acceso a la API.

Variables a configurar en `~/.kiro/settings/mcp.json`:

| Placeholder            | Dónde obtenerlo                                      |
|------------------------|------------------------------------------------------|
| `<CHECKMARX_BASE_URL>` | URL base de tu tenant en Checkmarx One               |
| `<CHECKMARX_API_KEY>`  | Ajustes de cuenta → API Keys en Checkmarx One portal |

> ⚠️ Nunca commitar el `mcp.json` real con credenciales. Está incluido en `.gitignore`.

---

## Hooks configurados

| Archivo                        | Trigger        | Matcher              | Acción              |
|--------------------------------|----------------|----------------------|---------------------|
| `test-on-lib-save.json`        | PostFileSave   | `src/lib/.*\.ts$`    | `npm run test`      |

El hook corre los tests de Vitest automáticamente cada vez que se guarda un archivo
`.ts` dentro de `src/lib/`. Activo desde la próxima sesión de Kiro tras ser creado.

---

## Setup inicial para nuevos colaboradores

```bash
# 1. Clonar el repo
git clone <repo-url> && cd healthtrack

# 2. Compilar el servidor MCP (necesario antes de conectarlo a Kiro)
cd mcp-servers/health-import && npm install && npm run build && cd ../..

# 3. Copiar la plantilla de MCP y ajustar la ruta absoluta del servidor
cp .kiro/settings/mcp.json.example ~/.kiro/settings/mcp.json
# Editar ~/.kiro/settings/mcp.json:
#   - Reemplazar <ABSOLUTE_PATH_TO_REPO> con la ruta real del repo
#   - Rellenar <CHECKMARX_BASE_URL> y <CHECKMARX_API_KEY> si usas Checkmarx

# 4. Instalar dependencias del proyecto principal
npm install

# 5. Aplicar migraciones de base de datos
npm run db:migrate

# 6. Arrancar el servidor de desarrollo
npm run dev
```

---

## Archivos excluidos del repositorio

Los siguientes archivos contienen datos locales o secretos y están en `.gitignore`:

| Archivo / patrón          | Razón                                        |
|---------------------------|----------------------------------------------|
| `healthtrack.db`          | Base de datos SQLite local, datos personales |
| `~/.kiro/settings/mcp.json` | Credenciales de API (fuera del repo)       |
| `.env*`                   | Variables de entorno con secretos            |
| `node_modules/`           | Dependencias, se restauran con `npm install` |
| `.next/`                  | Output de build de Next.js                   |
