import { getPrisma } from './prisma';
import { mockArticles, mockRecipes, type ContentItem } from './mockContent';

export async function listRecipes(q?: string): Promise<ContentItem[]> {
  try {
    const prisma = getPrisma();
    const rows = await prisma.recipe.findMany({
      where: q ? { title: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: { slug: true, title: true, body: true },
      take: 50,
    });
    return rows;
  } catch {
    const query = (q || '').toLowerCase();
    return mockRecipes.filter((r) => !query || r.title.toLowerCase().includes(query));
  }
}

export async function getRecipe(slug: string): Promise<ContentItem | null> {
  try {
    const prisma = getPrisma();
    return await prisma.recipe.findUnique({ where: { slug }, select: { slug: true, title: true, body: true } });
  } catch {
    return mockRecipes.find((r) => r.slug === slug) ?? null;
  }
}

export async function listArticles(q?: string): Promise<ContentItem[]> {
  try {
    const prisma = getPrisma();
    const rows = await prisma.article.findMany({
      where: q ? { title: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { createdAt: 'desc' },
      select: { slug: true, title: true, body: true },
      take: 50,
    });
    return rows;
  } catch {
    const query = (q || '').toLowerCase();
    return mockArticles.filter((a) => !query || a.title.toLowerCase().includes(query));
  }
}

export async function getArticle(slug: string): Promise<ContentItem | null> {
  try {
    const prisma = getPrisma();
    return await prisma.article.findUnique({ where: { slug }, select: { slug: true, title: true, body: true } });
  } catch {
    return mockArticles.find((a) => a.slug === slug) ?? null;
  }
}
