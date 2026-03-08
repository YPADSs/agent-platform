import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getRecipeDetail } from '@/lib/recipes';
import { getArticleDetail } from '@/lib/articles';

type FavoriteTargetType = 'RECIPE' | 'ARTICLE';

type FavoritesRequestBody = {
  targetType?: unknown;
  targetSlug?: unknown;
};

type FavoriteTargetSummary = {
  type: FavoriteTargetType;
  slug: string;
  title: string;
  description: string;
  href: string;
};

function asType(value: unknown): FavoriteTargetType | null {
  if (value === 'RECIPE' || value === 'ARTICLE') return value;
  return null;
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

async function getFavoriteTargetSummary(
  targetType: FavoriteTargetType,
  targetSlug: string,
): Promise<FavoriteTargetSummary | null> {
  if (targetType === 'RECIPE') {
    const recipe = await getRecipeDetail(targetSlug);
    if (!recipe) return null;
    return {
      type: 'RECIPE',
      slug: recipe.slug,
      title: recipe.title,
      description: recipe.description,
      href: `/recipes/${recipe.slug}`
    };
  }

  const article = await getArticleDetail(targetSlug);
  if (!article) return null;
  return {
    type: 'ARTICLE',
    slug: article.slug,
    title: article.title,
    description: article.description,
    href: `/articles/${article.slug}`
  };
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const prisma = getPrisma();
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { targetType: true, targetSlug: true, createdAt: true }
    });

    const enriched = await Promise.all(
      favorites.map(async (favorite) => ({
        ...favorite,
        target: await getFavoriteTargetSummary(favorite.targetType, favorite.targetSlug)
      }))
    );

    return NextResponse.json({
      favorites: enriched.filter((favorite) => favorite.target !== null)
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

    const body: FavoritesRequestBody = await req.json();
    const targetType = asType(body.targetType);
    const targetSlug = typeof body.targetSlug === 'string' ? body.targetSlug.trim() : null;

    if (!targetType || !targetSlug) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const target = await getFavoriteTargetSummary(targetType, targetSlug);
    if (!target) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const prisma = getPrisma();
    await prisma.favorite.upsert({
      where: { userId_targetType_targetSlug: { userId, targetType, targetSlug } },
      create: { userId, targetType, targetSlug },
      update: {}
    });

    return NextResponse.json({ ok: true, target });
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

    const body: FavoritesRequestBody = await req.json();
    const targetType = asType(body.targetType);
    const targetSlug = typeof body.targetSlug === 'string' ? body.targetSlug.trim() : null;

    if (!targetType || !targetSlug) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    const prisma = getPrisma();
    await prisma.favorite.deleteMany({ where: { userId, targetType, targetSlug } });
    return NextResponse.json({ ok: true, targetType, targetSlug });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
