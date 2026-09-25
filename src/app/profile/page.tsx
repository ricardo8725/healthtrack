import Link from 'next/link';
import { FIXED_USER_ID } from '@/lib/constants';
import { getProfile } from '@/lib/profile.repository';
import { ProfileForm } from '@/components/ProfileForm';

export default async function ProfilePage() {
  const profile = await getProfile(FIXED_USER_ID);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <Link href="/weight" className="text-sm text-blue-600 hover:underline">
          ← Volver al historial
        </Link>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Tu altura y fecha de nacimiento se usan para calcular el IMC de cada registro de peso.
      </p>

      <ProfileForm
        defaultValues={
          profile
            ? { heightCm: profile.heightCm, dateOfBirth: profile.dateOfBirth }
            : undefined
        }
      />
    </main>
  );
}
