import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getRecipeDetail } from '@/lib/recipes';

async function getAuthenticatedUserId() {
  const session = await requireSession();
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: session.user!.email! },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

  return user.id;
}

export async function POST(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const recipe = await getRecipeDetail(params.slug);
    if (!recipe) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const prisma = getPrisma();
    await prisma.favorite.upsert({
      where: {
        userId_targetType_targetSlug: {
          userId,
          targetType: 'RECIPE',
          targetSlug: recipe.slug,
        },
      },
      create: {
        userId,
        targetType: 'RECIPE',
        targetSlug: recipe.slug,
      },
      update: {},
    });

    return NextResponse.json({ ok: true, targetSlug: recipe.slug });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
    }

    const prisma = getPrisma();
    await prisma.favorite.deleteMany({
      where: {
        userId,
        targetType: 'RECIPE',
        targetSlug: params.slug,
      },
    });

    return NextResponse.json({ ok: true, targetSlug: params.slug });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
