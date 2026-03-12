import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';
import { deletePlannerItem, requirePlannerAccess } from '@/lib/planner';

type Params = { params: Promise<{ itemId: string }> };

async function getAuthenticatedUser() {
  const session = await requireSession();
  const email = session.user?.email;

  if (!email) {
    const err = new Error('UNAUTHENTICATED') as Error & { status?: number };
    err.status = 401;
    throw err;
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    const err = new Error('USER_NOT_FOUND') as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  return user;
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    const { itemId } = await params;

    if (!itemId) {
      return NextResponse.json({ error: 'INVALID_ITEM_ID' }, { status: 422 });
    }

    const user = await getAuthenticatedUser();
    await requirePlannerAccess(user.id);

    const result = await deletePlannerItem(user.id, itemId);
    return NextResponse.json(result);
  } catch (error) {
    const status = (error as { status?: number })?.status ?? 401;
    const code =
      status === 403
        ? 'PREMIUM_REQUIRED'
        : status === 404
        ? 'NOT_FOUND'
        : 'UNAUTHENTICATED';

    return NextResponse.json({ error: code }, { status });
  }
}
