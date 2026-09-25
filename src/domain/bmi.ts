export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIResult {
  /** IMC redondeado a 2 decimales */
  value: number;
  category: BMICategory;
}

/**
 * Calcula el IMC a partir del peso (kg) y la altura (cm).
 * Función pura: sin side-effects, sin dependencias del proyecto.
 * Usable tanto en el servidor como en el cliente.
 */
export function calculateBMI(weightKg: number, heightCm: number): BMIResult {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new RangeError('weight and height must be positive numbers');
  }
  const heightM = heightCm / 100;
  const raw = weightKg / (heightM * heightM);
  const value = Math.round(raw * 100) / 100;
  return { value, category: classifyBMI(value) };
}

/** Clasifica un valor de IMC según los umbrales de la OMS. */
export function classifyBMI(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25.0) return 'normal';
  if (bmi < 30.0) return 'overweight';
  return 'obese';
}
