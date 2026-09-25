'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { BMICategory } from '@/domain/bmi';
import { BMICategoryBadge } from '@/components/BMICategoryBadge';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export interface WeightHistoryRow {
  id: string;
  date: string;
  weightKg: number;
  bmi: number;
  bmiCategory: BMICategory;
}

interface WeightHistoryTableProps {
  entries: WeightHistoryRow[];
}

export function WeightHistoryTable({ entries }: WeightHistoryTableProps) {
  const router = useRouter();

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">Aún no tienes registros de peso.</p>
        <Link
          href="/weight/new"
          className="mt-3 inline-block rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Agregar tu primer registro
        </Link>
      </div>
    );
  }

  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">Historial de registros de peso e IMC</caption>
      <thead>
        <tr className="border-b text-left">
          <th scope="col" className="py-2 pr-4 font-medium">Fecha</th>
          <th scope="col" className="py-2 pr-4 font-medium">Peso (kg)</th>
          <th scope="col" className="py-2 pr-4 font-medium">IMC</th>
          <th scope="col" className="py-2 pr-4 font-medium">Categoría</th>
          <th scope="col" className="py-2 font-medium">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id} className="border-b">
            <td className="py-2 pr-4">{entry.date}</td>
            <td className="py-2 pr-4">{entry.weightKg}</td>
            <td className="py-2 pr-4">{entry.bmi}</td>
            <td className="py-2 pr-4">
              <BMICategoryBadge category={entry.bmiCategory} />
            </td>
            <td className="py-2">
              <div className="flex gap-3">
                <Link
                  href={`/weight/${entry.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Editar
                </Link>
                <DeleteConfirmDialog
                  entryId={entry.id}
                  entryDate={entry.date}
                  onDeleted={() => router.refresh()}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
