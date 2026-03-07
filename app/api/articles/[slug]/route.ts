import { NextResponse } from 'next/server';
import { getArticleDetail } from '@/lib/articles';

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const article = await getArticleDetail(params.slug);

  if (!article) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({
    article,
    actions: {
      favorite: {
        method: 'POST',
        href: `/api/articles/${article.slug}/favorite`,
        requiresAuth: true,
      },
    },
  });
}
