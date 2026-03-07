
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { getPrisma } from '@/lib/prisma';
import {
  dedupeShoppingListTexts,
  normalizeShoppingListText,
} from '@/lib/shopping-list';

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const items = await prisma.shoppingListItem.findMany({
    where: { userId: currentUser.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, text: true, checked: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      pantry: item.checked,
    })),
  });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const body = await req.json().catch(() => ({}));

  const singleText = typeof body?.text === 'string' ? body.text : null;
  const batchTexts = Array.isArray(body?.items)
    ? body.items.filter((item): item is string => typeof item === 'string')
    : [];

  const candidateTexts = [
    ...(singleText ? [singleText] : []),
    ...batchTexts,
  ].map(normalizeShoppingListText).filter(Boolean);

  if (!candidateTexts.length) {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  }

  const existingItems = await prisma.shoppingListItem.findMany({
    where: { userId: currentUser.userId },
    select: { text: true },
  });

  const { added, skipped } = dedupeShoppingListTexts(
    candidateTexts,
    existingItems.map((item) => item.text),
  );

  if (added.length) {
    await prisma.shoppingListItem.createMany({
      data: added.map((text) => ({ userId: currentUser.userId, text })),
    });
  }

  const items = await prisma.shoppingListItem.findMany({
    where: { userId: currentUser.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, text: true, checked: true, createdAt: true, updatedAt: true },
  });

  return NextResponse.json({
    ok: true,
    added,
    skipped,
    items: items.map((item) => ({
      ...item,
      pantry: item.checked,
    })),
  });
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const body = await req.json();
  const id = typeof body?.id === 'string' ? body.id : null;
  const pantry =
    typeof body?.pantry === 'boolean'
      ? body.pantry
      : typeof body?.checked === 'boolean'
        ? body.checked
        : null;

  if (!id || pantry === null) {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  }

  await prisma.shoppingListItem.updateMany({
    where: { id, userId: currentUser.userId },
    data: { checked: pantry },
  });

  return NextResponse.json({ ok: true, id, pantry });
}

export async function DELETE(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const body = await req.json();
  const id = typeof body?.id === 'string' ? body.id : null;

  if (!id) {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  }

  await prisma.shoppingListItem.deleteMany({
    where: { id, userId: currentUser.userId },
  });

  return NextResponse.json({ ok: true, id });
}
