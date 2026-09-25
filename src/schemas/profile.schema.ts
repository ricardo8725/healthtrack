import { z } from 'zod';

export const profileSchema = z.object({
  heightCm: z.number().positive('La altura debe ser mayor que 0'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato esperado: YYYY-MM-DD'),
});

export type ProfileInput = z.infer<typeof profileSchema>;
