import { NextResponse } from 'next/server';
import { createPantryItemByEmail, getPantryByEmail } from '@/lib/pantry';
import { requireSession } from '@/lib/session';

type CreatePantryRequestBody = {
  name?: unknown;
  quantity?: unknown;
  unit?: unknown;
  note?: unknown;
};

function asOptionalString(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }

  return value === null ? null : undefined;
}

function asOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export async function GET() {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const items = await getPantryByEmail(email);
    return NextResponse.json({ items });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const code = status === 404 ? 'USER_NOT_FOUND' : 'UNAUTHENTICATED';
    return NextResponse.json({ error: code }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const body: CreatePantryRequestBody = await req.json().catch(() => ({}));
    const name = asOptionalString(body.name);
    const quantity = asOptionalNumber(body.quantity);
    const unit = asOptionalString(body.unit);
    const note = asOptionalString(body.note);

    if (!name) {
      return NextResponse.json({ error: 'INVALID_NAME' }, { status: 422 });
    }

    if (body.quantity !== undefined && quantity === undefined) {
      return NextResponse.json({ error: 'INVALID_QUANTITY' }, { status: 422 });
    }

    const item = await createPantryItemByEmail(email, { name, quantity, unit, note });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 400;
    const message = (error as Error).message;

    return NextResponse.json({ error: message }, { status });
  }
}
