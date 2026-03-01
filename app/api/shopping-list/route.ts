import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await requireSession();
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

    const items = await prisma.shoppingListItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, text: true, checked: true, createdAt: true },
    });

    return NextResponse.json({ items });
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
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!text) return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });

    const item = await prisma.shoppingListItem.create({ data: { userId: user.id, text } });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!user) return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });

    const body = await req.json();
    const id = typeof body?.id === 'string' ? body.id : null;
    const checked = typeof body?.checked === 'boolean' ? body.checked : null;
    if (!id || checked === null) return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });

    await prisma.shoppingListItem.updateMany({ where: { id, userId: user.id }, data: { checked } });
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
    const id = typeof body?.id === 'string' ? body.id : null;
    if (!id) return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400 });

    await prisma.shoppingListItem.deleteMany({ where: { id, userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });
  }
}
