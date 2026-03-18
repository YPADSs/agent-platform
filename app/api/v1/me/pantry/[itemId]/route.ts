import { NextResponse } from 'next/server';
import { deletePantryItemByEmail, updatePantryItemByEmail } from '@/lib/pantry';
import { requireSession } from '@/lib/session';

type PatchPantryRequestBody = {
  quantity?: unknown;
  unit?: unknown;
  displayName?: unknown;
  note?: unknown;
  lastConfirmedAt?: unknown;
};

type Params = {
  params: { itemId: string };
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

function asOptionalDate(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === '') {
    return null;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  return undefined;
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const body: PatchPantryRequestBody = await req.json().catch(() => ({}));
    const quantity = asOptionalNumber(body.quantity);
    const unit = asOptionalString(body.unit);
    const displayName = asOptionalString(body.displayName);
    const note = asOptionalString(body.note);
    const lastConfirmedAt = asOptionalDate(body.lastConfirmedAt);

    if (body.quantity !== undefined && quantity === undefined) {
      return NextResponse.json({ error: 'INVALID_QUANTITY' }, { status: 422 });
    }

    if (body.lastConfirmedAt !== undefined && lastConfirmedAt === undefined) {
      return NextResponse.json({ error: 'INVALID_LAST_CONFIRMED_AT' }, { status: 422 });
    }

    const item = await updatePantryItemByEmail(email, params.itemId, {
      ...(body.quantity !== undefined ? { quantity } : {}),
      ...(body.unit !== undefined ? { unit } : {}),
      ...(body.displayName !== undefined ? { displayName } : {}),
      ...(body.note !== undefined ? { note } : {}),
      ...(body.lastConfirmedAt !== undefined ? { lastConfirmedAt } : {}),
    });

    return NextResponse.json({ ok: true, item });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 400;
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (!email) {
      return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    await deletePantryItemByEmail(email, params.itemId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 400;
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status });
  }
}
