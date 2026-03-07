import { requireSession } from '@/lib/session';
import { getPrisma } from '@/lib/prisma';

export type CurrentUserResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; status: number; code: string };

export async function getCurrentUser(): Promise<CurrentUserResult> {
  try {
    const session = await requireSession();
    const email = session.user?.email;
    if (!email) {
      return { ok: false, status: 401, code: 'AUTH_REQUIRED' };
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return { ok: false, status: 404, code: 'USER_NOT_FOUND' };
    }

    return { ok: true, userId: user.id, email };
  } catch {
    return { ok: false, status: 401, code: 'AUTH_REQUIRED' };
  }
}
