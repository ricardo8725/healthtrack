import type { BMICategory } from '@/domain/bmi';
import { bmiCategoryLabel } from '@/lib/bmi-labels';

// Colores con contraste ≥ 4.5:1 sobre el fondo claro (WCAG AA).
const CATEGORY_STYLES: Record<BMICategory, string> = {
  underweight: 'bg-blue-100 text-blue-800',
  normal: 'bg-green-100 text-green-800',
  overweight: 'bg-yellow-100 text-yellow-800',
  obese: 'bg-red-100 text-red-800',
};

interface BMICategoryBadgeProps {
  category: BMICategory;
}

export function BMICategoryBadge({ category }: BMICategoryBadgeProps) {
  const label = bmiCategoryLabel(category);
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${CATEGORY_STYLES[category]}`}
      aria-label={`Categoría de IMC: ${label}`}
    >
      {label}
    </span>
  );
}
