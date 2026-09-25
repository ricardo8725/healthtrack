'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { profileSchema, type ProfileInput } from '@/schemas/profile.schema';

interface ProfileFormProps {
  defaultValues?: Partial<ProfileInput>;
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      heightCm: defaultValues?.heightCm,
      dateOfBirth: defaultValues?.dateOfBirth,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setServerError('No se pudo guardar el perfil. Intenta de nuevo.');
      return;
    }
    router.push('/weight');
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="heightCm" className="text-sm font-medium">
          Altura (cm)
        </label>
        <input
          id="heightCm"
          type="number"
          step="0.1"
          className="rounded border border-gray-300 px-3 py-2"
          aria-invalid={errors.heightCm ? 'true' : 'false'}
          {...register('heightCm', { valueAsNumber: true })}
        />
        {errors.heightCm && (
          <p className="text-sm text-red-700" role="alert">
            {errors.heightCm.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="dateOfBirth" className="text-sm font-medium">
          Fecha de nacimiento
        </label>
        <input
          id="dateOfBirth"
          type="date"
          className="rounded border border-gray-300 px-3 py-2"
          aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
          {...register('dateOfBirth')}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-red-700" role="alert">
            {errors.dateOfBirth.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-700" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Guardando…' : 'Guardar perfil'}
      </button>
    </form>
  );
}
