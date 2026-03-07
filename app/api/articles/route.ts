import { NextResponse } from 'next/server';
import { listArticleSummaries } from '@/lib/articles';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const articles = await listArticleSummaries({ q, category });

  return NextResponse.json({
    articles,
    filters: {
      q: q ?? '',
      category: category ?? '',
    },
  });
}
