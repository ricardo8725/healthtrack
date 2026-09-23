---
inclusion: always
---

# HealthTrack — Product Context

## Qué es HealthTrack

HealthTrack es una aplicación web de control de salud personal, de uso individual y local. Permite al usuario llevar un registro continuo de su estado de salud a través del tiempo, con datos como peso, IMC, exámenes médicos, medicinas y actividad física.

La aplicación está pensada para una sola persona (el propio dueño del dispositivo). No hay multi-tenant, ni cuentas de equipo, ni sharing de datos entre usuarios.

---

## Usuario objetivo

Una persona que quiere:
- Registrar y visualizar su evolución de peso e IMC a lo largo del tiempo.
- Centralizar sus datos de salud en un lugar propio, sin depender de apps de terceros.
- En el futuro, conectar datos de Apple Health o Garmin sin perder lo ya registrado.

---

## Módulos planificados

| Módulo                | Estado         | Notas                                    |
|-----------------------|----------------|------------------------------------------|
| Peso e IMC            | En desarrollo  | Primera feature — spec completo          |
| Exámenes médicos      | Planificado    | —                                        |
| Medicinas             | Planificado    | —                                        |
| Ejercicio             | Planificado    | —                                        |
| Integración Apple Health | Futuro      | Requiere entorno macOS/iOS               |
| Integración Garmin    | Futuro         | —                                        |

---

## Principios de producto

- **Privacidad por defecto.** Los datos viven localmente en el dispositivo del usuario. No hay telemetría, ni llamadas a servicios externos, ni almacenamiento en la nube (a menos que el usuario lo configure explícitamente en el futuro).
- **Datos del usuario, siempre accesibles.** El archivo `healthtrack.db` es un SQLite estándar que el usuario puede abrir, exportar o migrar cuando quiera.
- **Extensibilidad sin romper lo existente.** Cada módulo nuevo se añade sin modificar el comportamiento de los módulos ya en producción.
- **Una sola fuente de verdad por entrada.** Un registro de peso editado reemplaza el anterior; no se crean versiones paralelas.

---

## Fuera del alcance permanente (para esta versión local)

- Cuentas de usuario múltiples o perfiles familiares.
- Sincronización en la nube automática.
- Aplicación móvil nativa (se prioriza web local).
- Compartir datos con terceros sin consentimiento explícito.

---

## Terminología del dominio

| Término         | Significado en HealthTrack                                       |
|-----------------|------------------------------------------------------------------|
| **Perfil**      | Datos fijos del usuario: altura (cm) y fecha de nacimiento.     |
| **Entrada de peso** | Registro de un peso (kg) en una fecha concreta.            |
| **IMC**         | Índice de Masa Corporal. Calculado automáticamente al guardar.   |
| **Categoría IMC** | Clasificación WHO: bajo peso / normal / sobrepeso / obesidad. |
| **Historial**   | Lista de todas las entradas de peso del usuario, orden desc.    |
