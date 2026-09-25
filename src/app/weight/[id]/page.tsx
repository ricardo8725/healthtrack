import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { FIXED_USER_ID } from '@/lib/constants';
import { getProfile } from '@/lib/profile.repository';
import { getWeightEntry } from '@/lib/weight.repository';
import { WeightEntryForm } from '@/components/WeightEntryForm';

interface EditWeightPageProps {
  params: { id: string };
}

export default async function EditWeightPage({ params }: EditWeightPageProps) {
  const profile = await getProfile(FIXED_USER_ID);
  if (!profile) {
    redirect('/profile');
  }

  const entry = await getWeightEntry(params.id, FIXED_USER_ID);
  if (!entry) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar entrada</h1>
        <Link href="/weight" className="text-sm text-blue-600 hover:underline">
          ← Volver al historial
        </Link>
      </div>

      <WeightEntryForm
        heightCm={profile.heightCm}
        entryId={entry.id}
        defaultValues={{ date: entry.date, weightKg: entry.weightKg }}
      />
    </main>
  );
}
