import { NextResponse } from 'next/server';
import { FIXED_USER_ID } from '@/lib/constants';
import { weightEntrySchema } from '@/schemas/weight.schema';
import { calculateBMI } from '@/domain/bmi';
import { getProfile } from '@/lib/profile.repository';
import { createWeightEntry, listWeightEntries } from '@/lib/weight.repository';

export async function GET() {
  try {
    const entries = await listWeightEntries(FIXED_USER_ID);
    return NextResponse.json(entries, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = weightEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }

    const profile = await getProfile(FIXED_USER_ID);
    if (!profile) {
      return NextResponse.json(
        { error: 'Complete tu perfil primero' },
        { status: 400 },
      );
    }

    const bmi = calculateBMI(parsed.data.weightKg, profile.heightCm);
    const entry = await createWeightEntry(FIXED_USER_ID, parsed.data, bmi);
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
