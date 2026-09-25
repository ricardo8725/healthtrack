import Link from 'next/link';
import { FIXED_USER_ID } from '@/lib/constants';
import { getProfile } from '@/lib/profile.repository';
import { listWeightEntries } from '@/lib/weight.repository';
import type { BMICategory } from '@/domain/bmi';
import { WeightHistoryTable, type WeightHistoryRow } from '@/components/WeightHistoryTable';

export default async function WeightPage() {
  const profile = await getProfile(FIXED_USER_ID);
  const entries = await listWeightEntries(FIXED_USER_ID);

  const rows: WeightHistoryRow[] = entries.map((e) => ({
    id: e.id,
    date: e.date,
    weightKg: e.weightKg,
    bmi: e.bmi,
    bmiCategory: e.bmiCategory as BMICategory,
  }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Historial de peso e IMC</h1>
        <div className="flex items-center gap-4">
          <Link href="/profile" className="text-sm text-blue-600 hover:underline">
            Perfil
          </Link>
          <Link
            href="/weight/new"
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Nueva entrada
          </Link>
        </div>
      </div>

      {!profile && (
        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          Completa tu perfil (altura y fecha de nacimiento) antes de registrar peso.{' '}
          <Link href="/profile" className="font-medium underline">
            Ir al perfil
          </Link>
        </div>
      )}

      <WeightHistoryTable entries={rows} />
    </main>
  );
}
