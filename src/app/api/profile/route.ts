import { NextResponse } from 'next/server';
import { FIXED_USER_ID } from '@/lib/constants';
import { profileSchema } from '@/schemas/profile.schema';
import { getProfile, upsertProfile } from '@/lib/profile.repository';

export async function GET() {
  try {
    const profile = await getProfile(FIXED_USER_ID);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }
    return NextResponse.json(profile, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.flatten() }, { status: 400 });
    }
    const profile = await upsertProfile(FIXED_USER_ID, parsed.data);
    return NextResponse.json(profile, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
