import { NextResponse } from 'next/server';
import { importCheckedShoppingListItemsToPantryByEmail } from '@/lib/pantry';
import { requireSession } from '@/lib/session';

export async function POST() {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const result = await importCheckedShoppingListItemsToPantryByEmail(email);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 400;
    const code = (error as Error).message || 'PANTRY_IMPORT_FAILED';
    return NextResponse.json({ error: code }, { status });
  }
}
