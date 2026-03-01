import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';

function asType(v: unknown): 'RECIPE' | 'ARTICLE' | null {
  if (v === 'RECIPE' || v === 'ARTICLE') return v;
  return null;
}

export async function GET() {
  try {
    const session = await requireSession();
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { targetType: true, targetSlug: true, createdAt: true },
    });

    return NextResponse.json({ favorites });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

    const body = await req.json();
    const targetType = asType(body?.targetType);
    const targetSlug = typeof body?.targetSlug === 'string' ? body.targetSlug : null;
    if (!targetType || !targetSlug) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    await prisma.favorite.upsert({
      where: { userId_targetType_targetSlug: { userId: user.id, targetType, targetSlug } },
      create: { userId: user.id, targetType, targetSlug },
      update: {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireSession();
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

    const body = await req.json();
    const targetType = asType(body?.targetType);
    const targetSlug = typeof body?.targetSlug === 'string' ? body.targetSlug : null;
    if (!targetType || !targetSlug) {
      return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({ where: { userId: user.id, targetType, targetSlug } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
