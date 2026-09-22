# Requirements: Registro de Peso e IMC

## Contexto del proyecto

HealthTrack es una aplicación de control de salud personal. Permite al usuario registrar peso, exámenes médicos, medicinas y ejercicio, con integración futura a Apple Health y Garmin.

**Stack confirmado:** Next.js 14 (App Router) · SQLite (better-sqlite3) · Drizzle ORM · Zod · Tailwind CSS · Vitest

Esta feature cubre el módulo de **registro de peso e IMC**, la primera funcionalidad central de la app.

---

## Requisitos funcionales

### RF-01 — Perfil del usuario

WHEN the user creates or updates their profile,
THE SYSTEM SHALL store height in centimeters and date of birth as mandatory fields.

WHEN height or date of birth is missing from the profile,
THE SYSTEM SHALL prevent the user from saving the profile and display a descriptive validation error for each missing field.

---

### RF-02 — Registro de entrada de peso

WHEN the user submits a new weight entry,
THE SYSTEM SHALL accept weight in kilograms (kg) and a date as required fields.

WHEN the user submits a weight entry with a weight value less than or equal to zero, or greater than 700 kg,
THE SYSTEM SHALL reject the entry and display a validation error indicating the allowed range.

WHEN the user submits a weight entry without specifying a date,
THE SYSTEM SHALL default the entry date to the current date.

WHEN two weight entries share the same date for the same user,
THE SYSTEM SHALL allow both entries and store them as distinct records.

---

### RF-03 — Cálculo automático del IMC

WHEN the user saves a weight entry,
THE SYSTEM SHALL automatically calculate the BMI using the formula:
`BMI = weight (kg) / (height (m))²`
where height is taken from the user's profile.

WHEN the user's profile does not contain a valid height,
THE SYSTEM SHALL block the creation of a weight entry and prompt the user to complete their profile first.

---

### RF-04 — Clasificación del IMC

WHEN the BMI is calculated for a weight entry,
THE SYSTEM SHALL assign a classification according to the following WHO thresholds:

| Clasificación     | Rango IMC       |
|-------------------|-----------------|
| Bajo peso         | < 18.5          |
| Normal            | 18.5 – 24.9     |
| Sobrepeso         | 25.0 – 29.9     |
| Obesidad          | ≥ 30.0          |

WHEN the BMI classification is determined,
THE SYSTEM SHALL store the classification label alongside the calculated BMI value.

---

### RF-05 — Historial de registros

WHEN the user navigates to the weight history view,
THE SYSTEM SHALL display all weight entries for the authenticated user, sorted by date in descending order (most recent first).

WHEN the user requests the weight history,
THE SYSTEM SHALL include for each entry: date, weight (kg), calculated BMI value, and BMI classification.

WHEN the user has no weight entries,
THE SYSTEM SHALL display an empty-state message encouraging them to add their first entry.

---

### RF-06 — Edición de un registro existente

WHEN the user selects an existing weight entry and submits a modified weight or date,
THE SYSTEM SHALL validate the new values using the same rules as RF-02.

WHEN the user saves an edited weight entry,
THE SYSTEM SHALL recalculate and update the BMI value and classification automatically.

WHEN the edit is saved successfully,
THE SYSTEM SHALL reflect the updated values immediately in the weight history view.

---

### RF-07 — Eliminación de un registro

WHEN the user requests to delete a weight entry,
THE SYSTEM SHALL prompt the user for explicit confirmation before proceeding.

WHEN the user confirms the deletion,
THE SYSTEM SHALL permanently remove the entry and update the history view to no longer include it.

WHEN the user cancels the deletion,
THE SYSTEM SHALL leave the entry unchanged.

---

## Requisitos no funcionales

| ID     | Atributo       | Descripción |
|--------|----------------|-------------|
| RNF-01 | Precisión      | El IMC se calcula y almacena con dos decimales de precisión. |
| RNF-02 | Rendimiento    | La lista de historial debe renderizar en menos de 500 ms para hasta 1 000 entradas. |
| RNF-03 | Seguridad      | Un usuario autenticado solo puede ver, editar y eliminar sus propios registros. |
| RNF-04 | Internacionalización | Las etiquetas de clasificación deben ser traducibles (i18n). |
| RNF-05 | Extensibilidad | La lógica de cálculo del IMC debe estar encapsulada para facilitar integración futura con Apple Health y Garmin. |

---

## Fuera del alcance (esta iteración)

- Integración con Apple Health o Garmin.
- Gráficas o visualizaciones de tendencias de peso.
- Comparación de progreso entre fechas.
- Metas de peso o alertas.
- Gestión de múltiples usuarios o perfiles familiares.
