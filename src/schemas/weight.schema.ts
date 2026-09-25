import { z } from 'zod';

export const weightEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
  weightKg: z
    .number()
    .positive('El peso debe ser mayor que 0')
    .max(700, 'El peso no puede superar 700 kg'),
});

export type WeightEntryInput = z.infer<typeof weightEntrySchema>;
