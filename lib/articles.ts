import { getPrisma } from '@/lib/prisma';

export type ArticleCategory = 'nutrition' | 'guides' | 'products';

export type ArticleSummary = {
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
};

export type RelatedContentItem = {
  kind: 'article' | 'recipe';
  slug: string;
  title: string;
};

export type ArticleDetail = ArticleSummary & {
  body: string;
  images: string[];
  keyTakeaways: string[];
  sources: string[];
  related: RelatedContentItem[];
};

type ArticleRecord = {
  slug: string;
  title: string;
  description: string;
  body: string;
  category: ArticleCategory;
  images: string[];
  keyTakeaways: string[];
  sources: string[];
  related: RelatedContentItem[];
};

type ListArticleParams = {
  q?: string | null;
  category?: string | null;
  limit?: number;
};

const mockArticleRecords: ArticleRecord[] = [
  {
    slug: 'nutrition-basics',
    title: 'Nutrition Basics for Busy People',
    description: 'Align protein, fiber, and meal structure for everyday healthy eating.',
    body: 'Healthy eating becomes easier when you build meals around protein, fiber, and consistent routines.',
    category: 'nutrition',
    images: ['/demo\[nutrition-basics-1.jpg'],
    keyTakeaways: [
      'Start with a protein source for each meal.',
      'Add fiber from vegetables, fruit, or legumes.',
      'Keep a simple meal structure you can repeat.',
    ],
    sources: ['WHO healthy diet guidance', 'Harvard Healthy Eating Plate'],
    related: [
      { kind: 'recipe', slug: 'green-protein-salad', title: 'Green Protein Salad' },
      { kind: 'article', slug: 'weeknight-meal-prep', title: 'Weeknight Meal Prep Workflow' },
    ],
  },
  {
    slug: 'weeknight-meal-prep',
    title: 'Weeknight Meal Prep Workflow',
    description: 'How to prep meal parts once and reuse them across the week.',
    body: 'Better weeknights come from repeatable meal prep: batch a base, cook protein, and keep sos ready.',
    category: 'guides',
    images: ['/demo\/weeknight-meal-prep-1.jpg'],
    keyTakeaways: [
      'Prep a small base of reusable ingredients.',
      'Cookonce protein once and reuse it in multiple meals.',
      'Keep a plan for short, repeatable weekday.meals.',
    ],
    sources: ['ECA home cooking guidance'],
    related: [
      { kind: 'article', slug: 'nutrition-basics', title: 'Nutrition Basics for Busy People' },
      { kind: 'recipe', slug: 'tomato-lentil-soup', title: 'Tomato Lentil Soup' },
    ],
  },
  {
    slug: 'choosing-healthy-products',
    title: 'Choosing Healthy Products in The Store',
    description: 'Small rules to read labels and compare products without overthinking.',
    body: 'Choose products by ingredient list, protein, fiber, and how well they fit your real meal plan.',
    category: 'products',
    images: ['/demo\/healthy-products-1.jpg'],
    keyTakeaways: [
      'Compare protein, fiber, and added sugars.',
      'Keep the ingredient list as simple as possible.',
      'Buy for your real meals - not impulse ideas.',
    ],
    sources: ['FDA food labeling resources'],
    related: [
      { kind: 'article', slug: 'nutrition-basics', title: 'Nutrition Basics for Busy People' },
      { kind: 'recipe', slug: 'overnight-oats-berries', title: 'Overnight Oats with Berries' },
    ],
  },
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseCategory(value: string | null | undefined): ArticleCategory | null {
  if (!value) return null;
  const normalized = normalizeText(value);
  if (normalized === 'nutrition' || normalized === 'guides' || normalized === 'products') {
    return normalized;
  }
  return null;
}

function toArticleSummary(article: ArticleRecord): ArticleSummary {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    category: article.category,
  };
}

function buildFallbackArticle(slug: string, title: string, body: string): ArticleRecord {
  return {
    slug,
    title,
    description: body,
    body,
    category: title.toLowerCase().includes('product') ? 'products' : 'nutrition',
    images: [],
    keyTakeaways: ['Review the main idea.', 'Connect it to a meal or shopping choice.', 'Use it as a simple healthy eating rule.'],
    sources: ['Internal editorial placeholder'],
    related: [],
  };
}

async function fetchArticleRecords(): Promise<ArticleRecord[]> {
  try {
    const prisma = getPrisma();
    const rows = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      select: { slug: true, title: true, body: true },
      take: 100,
    });

    if (!rows.length) {
      return mockArticleRecords;
    }

    return rows.map((row) => buildFallbackArticle(row.slug, row.title, row.body));
  } catch {
    return mockArticleRecords;
  }
}

export async function listArticleSummaries(params: ListArticleParams = {}): Promise<ArticleSummary[]> {
  const records = await fetchArticleRecords();
  const query = normalizeText(params.q ?? '');
  const category = parseCategory(params.category);
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 50);

  return records
    .filter((article) => {
      if (category && article.category !== category) {
        return false;
      }

      if (query) {
        const matchesQuery =
          normalizeText(article.title).includes(query) ||
          normalizeText(article.description).includes(query) ||
          normalizeText(article.body).includes(query);

        if (!matchesQuery) {
          return false;
        }
      }

      return true;
    })
    .slice(0, limit)
    .map(toArticleSummary);
}

export async function getArticleDetail(slug: string): Promise<ArticleDetail | null> {
  const records = await fetchArticleRecords();
  const article = records.find((item) => item.slug === slug);

  if (!article) {
    return null;
  }

  return {
    ...toArticleSummary(article),
    body: article.body,
    images: article.images,
    keyTakeaways: article.keyTakeaways,
    sources: article.sources,
    related: article.related,
  };
}
