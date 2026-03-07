import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { getArticleDetail } from '@/lib/articles';

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

    const article = await getArticleDetail(params.slug);
    if (!article) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    const prisma = getPrisma();
    await prisma.favorite.upsert({
      where: {
        userId_targetType_targetSlug: {
          userId,
          targetType: 'ARTICLE',
          targetSlug: article.slug,
        },
      },
      create: {
        userId,
        targetType: 'ARTICLE',
        targetSlug: article.slug,
      },
      update: {},
    });

    return NextResponse.json({ ok: true, targetSlug: article.slug });
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
        targetType: 'ARTICLE',
        targetSlug: params.slug,
      },
    });

    return NextResponse.json({ ok: true, targetSlug: params.slug });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
