/**
 * Property-based tests for calculateBMI
 *
 * Librería: fast-check (npm install -D fast-check)
 * Runner:   Vitest
 *
 * Cada propiedad se ejecuta contra cientos de entradas aleatorias generadas
 * por fast-check. Cuando una falla, fast-check reduce el ejemplo al mínimo
 * reproducible (shrinking).
 *
 * Requisitos cubiertos:
 *   RNF-01 — Precisión de 2 decimales
 *   RF-03  — Fórmula: BMI = weight(kg) / (height(m))²
 *   RF-04  — Clasificación según umbrales WHO
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateBMI, type BMICategory } from './bmi';

// ---------------------------------------------------------------------------
// Arbitraries reutilizables
// ---------------------------------------------------------------------------

/** Peso válido según RF-02: (0, 700] kg */
const validWeight = () => fc.float({ min: 0.1, max: 700, noNaN: true });

/** Altura válida según el modelo: (0, 300] cm — rango humano razonable */
const validHeight = () => fc.float({ min: 1, max: 300, noNaN: true });

/** Par (weightKg, heightCm) siempre válido */
const validPair = () =>
  fc.record({ weightKg: validWeight(), heightCm: validHeight() });

// ---------------------------------------------------------------------------
// Helpers de referencia independientes del SUT
// ---------------------------------------------------------------------------

/** Fórmula canónica del spec: weight / (height_m)² */
function referenceBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

/** Clasificación WHO tal como se define en RF-04 */
function referenceCategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25.0) return 'normal';
  if (bmi < 30.0) return 'overweight';
  return 'obese';
}

// ---------------------------------------------------------------------------
// Propiedad 1 — El IMC es siempre positivo para entradas válidas
// Invariante fundamental: cualquier combinación (peso > 0, altura > 0)
// produce un IMC estrictamente positivo.
// ---------------------------------------------------------------------------
describe('Invariante: positividad', () => {
  it('el valor IMC es siempre > 0 para cualquier entrada válida', () => {
    fc.assert(
      fc.property(validPair(), ({ weightKg, heightCm }) => {
        const { value } = calculateBMI(weightKg, heightCm);
        expect(value).toBeGreaterThan(0);
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 2 — Precisión de 2 decimales (RNF-01)
// El valor almacenado no debe tener más de 2 dígitos decimales.
// ---------------------------------------------------------------------------
describe('Invariante: precisión (RNF-01)', () => {
  it('el valor IMC tiene como máximo 2 decimales', () => {
    fc.assert(
      fc.property(validPair(), ({ weightKg, heightCm }) => {
        const { value } = calculateBMI(weightKg, heightCm);
        // Multiplicar por 100, redondear, y volver a dividir no debe cambiar el número
        expect(value).toBe(Math.round(value * 100) / 100);
      }),
    );
  });

  it('el valor IMC está a menos de 0.005 del valor exacto (error de redondeo)', () => {
    fc.assert(
      fc.property(validPair(), ({ weightKg, heightCm }) => {
        const { value } = calculateBMI(weightKg, heightCm);
        const exact = referenceBMI(weightKg, heightCm);
        expect(Math.abs(value - exact)).toBeLessThan(0.005);
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 3 — Corrección de la fórmula (RF-03)
// El valor calculado coincide con la fórmula canónica del spec,
// con tolerancia de redondeo a 2 decimales.
// ---------------------------------------------------------------------------
describe('Invariante: corrección de la fórmula (RF-03)', () => {
  it('BMI = weight / (height_m)² con precisión de 2 decimales', () => {
    fc.assert(
      fc.property(validPair(), ({ weightKg, heightCm }) => {
        const { value } = calculateBMI(weightKg, heightCm);
        const expected = Math.round(referenceBMI(weightKg, heightCm) * 100) / 100;
        expect(value).toBe(expected);
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 4 — Monotonía respecto al peso
// A mayor peso (con misma altura), el IMC no puede disminuir.
// ---------------------------------------------------------------------------
describe('Invariante: monotonía respecto al peso', () => {
  it('si peso₁ < peso₂ entonces IMC₁ ≤ IMC₂ (misma altura)', () => {
    fc.assert(
      fc.property(
        validHeight(),
        fc.float({ min: 0.1, max: 349.9, noNaN: true }),
        fc.float({ min: 350, max: 700, noNaN: true }),
        (heightCm, lightWeight, heavyWeight) => {
          const { value: bmiLight } = calculateBMI(lightWeight, heightCm);
          const { value: bmiHeavy } = calculateBMI(heavyWeight, heightCm);
          expect(bmiLight).toBeLessThanOrEqual(bmiHeavy);
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 5 — Monotonía respecto a la altura (relación inversa)
// A mayor altura (con mismo peso), el IMC no puede aumentar.
// ---------------------------------------------------------------------------
describe('Invariante: monotonía respecto a la altura', () => {
  it('si altura₁ < altura₂ entonces IMC₁ ≥ IMC₂ (mismo peso)', () => {
    fc.assert(
      fc.property(
        validWeight(),
        fc.float({ min: 1, max: 149, noNaN: true }),
        fc.float({ min: 150, max: 300, noNaN: true }),
        (weightKg, shortHeight, tallHeight) => {
          const { value: bmiShort } = calculateBMI(weightKg, shortHeight);
          const { value: bmiTall } = calculateBMI(weightKg, tallHeight);
          expect(bmiShort).toBeGreaterThanOrEqual(bmiTall);
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 6 — Clasificación correcta según umbrales WHO (RF-04)
// La categoría devuelta debe ser la correcta para el valor IMC calculado.
// ---------------------------------------------------------------------------
describe('Invariante: clasificación WHO (RF-04)', () => {
  it('la categoría coincide con el umbral correspondiente al IMC calculado', () => {
    fc.assert(
      fc.property(validPair(), ({ weightKg, heightCm }) => {
        const { value, category } = calculateBMI(weightKg, heightCm);
        expect(category).toBe(referenceCategory(value));
      }),
    );
  });

  it('todos los valores < 18.5 se clasifican como underweight', () => {
    // Genera pares cuyo IMC de referencia caiga en < 18.5
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 300, noNaN: true }),  // heightCm
        fc.float({ min: 0.001, max: 1, noNaN: true }), // factor < 1 para forzar bajo IMC
        (heightCm, factor) => {
          // weight tal que IMC exacto = 18.4 * factor  → siempre < 18.5
          const targetBMI = 18.49 * factor; // estrictamente < 18.5
          const heightM = heightCm / 100;
          const weightKg = Math.max(0.001, targetBMI * heightM * heightM);
          if (weightKg > 700) return; // descarta entradas fuera de rango

          const { category } = calculateBMI(weightKg, heightCm);
          expect(category).toBe('underweight');
        },
      ),
    );
  });

  it('todos los valores ≥ 30.0 se clasifican como obese', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1, max: 300, noNaN: true }),
        fc.float({ min: 1, max: 10, noNaN: true }), // multiplicador ≥ 1 para empujar IMC alto
        (heightCm, multiplier) => {
          const targetBMI = 30.0 * multiplier; // siempre ≥ 30
          const heightM = heightCm / 100;
          const weightKg = targetBMI * heightM * heightM;
          if (weightKg <= 0 || weightKg > 700) return; // descarta fuera de rango

          const { category } = calculateBMI(weightKg, heightCm);
          expect(category).toBe('obese');
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 7 — Simetría de escala
// Doblar el peso y doblar la altura deja el IMC invariante.
// (proof: 2w / (2h)² = 2w / 4h² = w / 2h² ≠ w/h² — esto NO se cumple)
// En cambio, doblar el peso y multiplicar la altura por √2 SÍ lo preserva.
// Esta propiedad documenta la geometría real de la fórmula.
// ---------------------------------------------------------------------------
describe('Invariante: escala cuadrática de la altura', () => {
  it('escalar peso por k² y altura por k deja el IMC invariante', () => {
    fc.assert(
      fc.property(
        validPair(),
        fc.float({ min: 0.5, max: 2.0, noNaN: true }), // factor de escala k
        ({ weightKg, heightCm }, k) => {
          const scaledWeight = weightKg * k * k;
          const scaledHeight = heightCm * k;
          if (scaledWeight <= 0 || scaledWeight > 700 || scaledHeight <= 0 || scaledHeight > 300) return;

          const { value: original } = calculateBMI(weightKg, heightCm);
          const { value: scaled } = calculateBMI(scaledWeight, scaledHeight);
          // Ambos son redondeados a 2 decimales; toleramos ±0.01 por redondeo
          expect(Math.abs(original - scaled)).toBeLessThanOrEqual(0.01);
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 8 — Entradas inválidas lanzan RangeError
// Cubre los casos de borde rechazados por la función.
// ---------------------------------------------------------------------------
describe('Invariante: rechazo de entradas inválidas', () => {
  it('lanza RangeError cuando weightKg ≤ 0', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(0),
          fc.float({ min: -1e6, max: -Number.EPSILON, noNaN: true }),
        ),
        validHeight(),
        (badWeight, heightCm) => {
          expect(() => calculateBMI(badWeight, heightCm)).toThrow(RangeError);
        },
      ),
    );
  });

  it('lanza RangeError cuando heightCm ≤ 0', () => {
    fc.assert(
      fc.property(
        validWeight(),
        fc.oneof(
          fc.constant(0),
          fc.float({ min: -1e6, max: -Number.EPSILON, noNaN: true }),
        ),
        (weightKg, badHeight) => {
          expect(() => calculateBMI(weightKg, badHeight)).toThrow(RangeError);
        },
      ),
    );
  });
});

// ---------------------------------------------------------------------------
// Propiedad 9 — El conjunto de categorías posibles es exactamente el esperado
// Ninguna entrada válida puede producir una categoría fuera del enum RF-04.
// ---------------------------------------------------------------------------
describe('Invariante: universo de categorías', () => {
  const VALID_CATEGORIES: BMICategory[] = ['underweight', 'normal', 'overweight', 'obese'];

  it('la categoría siempre pertenece al conjunto definido en RF-04', () => {
    fc.assert(
      fc.property(validPair(), ({ weightKg, heightCm }) => {
        const { category } = calculateBMI(weightKg, heightCm);
        expect(VALID_CATEGORIES).toContain(category);
      }),
    );
  });
});
