'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { weightEntrySchema, type WeightEntryInput } from '@/schemas/weight.schema';
import { calculateBMI } from '@/domain/bmi';
import { BMICategoryBadge } from '@/components/BMICategoryBadge';

interface WeightEntryFormProps {
  /** Altura del perfil, para el preview de IMC en vivo. */
  heightCm: number;
  defaultValues?: Partial<WeightEntryInput>;
  entryId?: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function WeightEntryForm({ heightCm, defaultValues, entryId }: WeightEntryFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<WeightEntryInput>({
    resolver: zodResolver(weightEntrySchema),
    defaultValues: {
      date: defaultValues?.date ?? today(),
      weightKg: defaultValues?.weightKg,
    },
  });

  const weightValue = watch('weightKg');

  // Preview de IMC en vivo (RF-03). Solo se muestra si el peso es válido.
  let preview: { value: number; category: ReturnType<typeof calculateBMI>['category'] } | null =
    null;
  if (typeof weightValue === 'number' && weightValue > 0 && weightValue <= 700) {
    try {
      preview = calculateBMI(weightValue, heightCm);
    } catch {
      preview = null;
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const url = entryId ? `/api/weight/${entryId}` : '/api/weight';
    const method = entryId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setServerError(payload?.error ?? 'No se pudo guardar el registro.');
      return;
    }
    router.push('/weight');
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-sm font-medium">
          Fecha
        </label>
        <input
          id="date"
          type="date"
          className="rounded border border-gray-300 px-3 py-2"
          aria-invalid={errors.date ? 'true' : 'false'}
          {...register('date')}
        />
        {errors.date && (
          <p className="text-sm text-red-700" role="alert">
            {errors.date.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="weightKg" className="text-sm font-medium">
          Peso (kg)
        </label>
        <input
          id="weightKg"
          type="number"
          step="0.1"
          className="rounded border border-gray-300 px-3 py-2"
          aria-invalid={errors.weightKg ? 'true' : 'false'}
          {...register('weightKg', { valueAsNumber: true })}
        />
        {errors.weightKg && (
          <p className="text-sm text-red-700" role="alert">
            {errors.weightKg.message}
          </p>
        )}
      </div>

      {preview && (
        <div className="flex items-center gap-2 rounded bg-gray-50 px-3 py-2 text-sm">
          <span className="font-medium">IMC estimado: {preview.value}</span>
          <BMICategoryBadge category={preview.category} />
        </div>
      )}

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
        {isSubmitting ? 'Guardando…' : entryId ? 'Guardar cambios' : 'Registrar peso'}
      </button>
    </form>
  );
}
