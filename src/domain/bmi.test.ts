import { describe, it, expect } from 'vitest';
import { calculateBMI, classifyBMI } from './bmi';

describe('calculateBMI', () => {
  it('returns normal for 70kg / 175cm', () => {
    const result = calculateBMI(70, 175);
    expect(result.value).toBe(22.86);
    expect(result.category).toBe('normal');
  });

  it('rounds the BMI value to 2 decimal places', () => {
    const result = calculateBMI(70, 175);
    // 70 / 1.75² = 22.857142... → 22.86
    expect(result.value).toBe(22.86);
    expect(Number.isInteger(result.value * 100)).toBe(true);
  });

  it('classifies underweight just below 18.5', () => {
    // 56 kg / 175 cm → 18.29
    const result = calculateBMI(56, 175);
    expect(result.value).toBeLessThan(18.5);
    expect(result.category).toBe('underweight');
  });

  it('classifies normal at exactly 18.5 lower bound', () => {
    // Encuentra un peso que dé exactamente el límite normal
    const result = calculateBMI(56.66, 175); // ≈ 18.5
    expect(result.category).toBe('normal');
  });

  it('classifies overweight at 25.0 lower bound', () => {
    // 76.6 kg / 175 cm → 25.01
    const result = calculateBMI(76.6, 175);
    expect(result.value).toBeGreaterThanOrEqual(25.0);
    expect(result.category).toBe('overweight');
  });

  it('classifies obese at 30.0 lower bound', () => {
    // 92 kg / 175 cm → 30.04
    const result = calculateBMI(92, 175);
    expect(result.value).toBeGreaterThanOrEqual(30.0);
    expect(result.category).toBe('obese');
  });

  it('throws RangeError when weightKg <= 0', () => {
    expect(() => calculateBMI(0, 175)).toThrow(RangeError);
    expect(() => calculateBMI(-5, 175)).toThrow(RangeError);
  });

  it('throws RangeError when heightCm <= 0', () => {
    expect(() => calculateBMI(70, 0)).toThrow(RangeError);
    expect(() => calculateBMI(70, -10)).toThrow(RangeError);
  });
});

describe('classifyBMI', () => {
  it('maps boundary values to the correct category', () => {
    expect(classifyBMI(18.49)).toBe('underweight');
    expect(classifyBMI(18.5)).toBe('normal');
    expect(classifyBMI(24.99)).toBe('normal');
    expect(classifyBMI(25.0)).toBe('overweight');
    expect(classifyBMI(29.99)).toBe('overweight');
    expect(classifyBMI(30.0)).toBe('obese');
  });
});
