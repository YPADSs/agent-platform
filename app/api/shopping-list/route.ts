import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';

type ShoppingListRequestBody = {
  text?: unknown;
  items?: unknown[];
  id?: unknown;
  pantry?: unknown;
  checked?: unknown;
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function textKey(value: string): string {
  return normalizeText(value).toLocaleLowerCase();
}

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await requireSession();
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { id: true }
  });
  return user?.id ?? null;
}

function collectCandidateTexts(body: ShoppingListRequestBody): string[] {
  const singleText = typeof body.text === 'string' ? body.text : null;
  const batchTexts = Array.isArray(body.items)
    ? body.items.filter((item): item is string => typeof item === 'string')
    : [];

  return [
    ...(singleText ? [singleText] : []),
    ...batchTexts
  ]
    .map(normalizeText)
    .filter((text) => Boolean(text));
}

function dedupeTexts(incoming: string[], existing: string[]) {
  const existingKeys = new Set(existing.map(textKey));
  const added: string[] = [];
  const skipped: string[] = [];

  for (const text of incoming) {
    const key = textKey(text);
    if (existingKeys.has(key)) {
      skipped.push(text);
      continue;
    }
    existingKeys.add(key);
    added.push(text);
  }

  return { added, skipped };
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const prisma = getPrisma();
    const items = await prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, text: true, checked: true, createdAt: true, updatedAt: true }
    });

    return NextResponse.json({
      items: items.map(item => ({
        ...item,
        pantry: item.checked
      }))
    });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const body: ShoppingListRequestBody = await req.json().catch(() => ({}));
    const candidateTexts = collectCandidateTexts(body);
    if (!candidateTexts.length) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const prisma = getPrisma();
    const existingItems = await prisma.shoppingListItem.findMany({
      where: { userId },
      select: { text: true }
    });

    const { added, skipped } = dedupeTexts(
      candidateTexts,
      existingItems.map(item => item.text)
    );

    if (added.length) {
      await prisma.shoppingListItem.createMany({
        data: added.map(text => ({ userId, text }))
      });
    }

    const items = await prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, text: true, checked: true, createdAt: true, updatedAt: true }
    });

    return NextResponse.json({
      ok: true,
      added,
      skipped,
      items: items.map(item => ({
        ...item,
        pantry: item.checked
      }))
    });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const body: ShoppingListRequestBody = await req.json();
    const id = typeof body.id === 'string' ? body.id : null;
    const pantry =
      typeof body.pantry === 'boolean'
        ? body.pantry
        : typeof body.checked === 'boolean'
        ? body.checked
        : null;

    if (!id || pantry === null) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.shoppingListItem.updateMany({
      where: { id, userId },
      data: { checked: pantry }
    });

    return NextResponse.json({ ok: true, id, pantry });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const body: ShoppingListRequestBody = await req.json();
    const id = typeof body.id === 'string' ? body.id : null;
    if (!id) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.shoppingListItem.deleteMany({ where: { id, userId } });
    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
