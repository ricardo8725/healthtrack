import type { BMICategory } from '@/domain/bmi';

/**
 * Etiquetas de texto para las categorías de IMC.
 * Fuente única para facilitar i18n futura (RNF-04): para añadir otro idioma,
 * basta con reemplazar este mapa por una función de traducción.
 */
export const BMI_CATEGORY_LABELS: Record<BMICategory, string> = {
  underweight: 'Bajo peso',
  normal: 'Normal',
  overweight: 'Sobrepeso',
  obese: 'Obesidad',
};

export function bmiCategoryLabel(category: BMICategory): string {
  return BMI_CATEGORY_LABELS[category];
}
