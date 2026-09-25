import { NextResponse } from 'next/server';
import { FIXED_USER_ID } from '@/lib/constants';
import { weightEntrySchema } from '@/schemas/weight.schema';
import { calculateBMI } from '@/domain/bmi';
import { getProfile } from '@/lib/profile.repository';
import { deleteWeightEntry, updateWeightEntry } from '@/lib/weight.repository';

interface RouteContext {
  params: { id: string };
}

export async function PUT(request: Request, { params }: RouteContext) {
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
    const updated = await updateWeightEntry(params.id, FIXED_USER_ID, parsed.data, bmi);
    if (!updated) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const deleted = await deleteWeightEntry(params.id, FIXED_USER_ID);
    if (!deleted) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
