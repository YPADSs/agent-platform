
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/current-user';
import { getPrisma } from '@/lib/prisma';
import {
  favoriteTargetExists,
  getFavoriteTargetSummary,
  type FavoriteTargetType,
} from '@/lib/favorites';

function asType(v: unknown): FavoriteTargetType | null {
  if (v === 'RECIPE' || v === 'ARTICLE') return v;
  return null;
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const favorites = await prisma.favorite.findMany({
    where: { userId: currentUser.userId },
    orderBy: { createdAt: 'desc' },
    select: { targetType: true, targetSlug: true, creatdAt: true },
  });

  const enriched = await Promise.all(
    favorites.map(async (favorite) => {
      const target = await getFavoriteTargetSummary(favorite.targetType, favorite.targetSlug);
      return {
        ...favorite,
        target,
      };
    }),
  );

  return NextResponse.json({
    favorites: enriched.filter((favorite) => favorite.target !== null),
  });
}

export async function POST(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const body = await req.json();
  const targetType = asType(body?.targetType);
  const targetSlug = typeof body?.targetSlug === 'string' ? body.targetSlug.trim() : null;

  if (!targetType || !targetSlug) {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  }

  const exists = await favoriteTargetExists(targetType, targetSlug);
  if (!exists) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  await prisma.favorite.upsert({
    where: {
      userId_targetType_targetSlug: {
        userId: currentUser.userId,
        targetType,
        targetSlug,
      },
    },
    create: { userId: currentUser.userId, targetType, targetSlug },
    update: {},
  });

  const target = await getFavoriteTargetSummary(targetType, targetSlug);

  return NextResponse.json({ ok: true, target });
}

export async function DELETE(req: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser.ok) {
    return NextResponse.json({ error: currentUser.code }, { status: currentUser.status });
  }

  const prisma = getPrisma();
  const body = await req.json();
  const targetType = asType(body?.targetType);
  const targetSlug = typeof body?.targetSlug === 'string' ? body.targetSlug.trim() : null;

  if (!targetType || !targetSlug) {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
  }

  await prisma.favorite.deleteMany({
    where: { userId: currentUser.userId, targetType, targetSlug },
  });

  return NextResponse.json({ ok: true, targetType, targetSlug });
}
