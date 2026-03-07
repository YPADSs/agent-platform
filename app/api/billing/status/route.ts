import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getAccountStatusByEmail } from '@/lib/billing';

export async function GET() {
  try {
    const session = await requireSession();
    const email = session.user?.email;
    if (!email) {
      return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const account = await getAccountStatusByEmail(email);
    if (!account) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ subscription: account.subscription });
  } catch {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }
}
