import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FIXED_USER_ID } from '@/lib/constants';
import { getProfile } from '@/lib/profile.repository';
import { WeightEntryForm } from '@/components/WeightEntryForm';

export default async function NewWeightPage() {
  const profile = await getProfile(FIXED_USER_ID);
  if (!profile) {
    redirect('/profile');
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nueva entrada de peso</h1>
        <Link href="/weight" className="text-sm text-blue-600 hover:underline">
          ← Volver al historial
        </Link>
      </div>

      <WeightEntryForm heightCm={profile.heightCm} />
    </main>
  );
}
