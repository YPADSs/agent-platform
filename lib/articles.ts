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

const articleCatalog: ArticleRecord[] = [
  {
    slug: 'protein-without-overthinking',
    title: 'Protein Without Overthinking It',
    description: 'Simple ways to reach steady protein intake with normal everyday meals.',
    body: 'People often overcomplicate protein. In practice, better protein intake comes from placing a clear source into breakfast, lunch, and dinner instead of chasing perfect macros. Eggs, yogurt, chicken, lentils, tofu, and canned fish all work when they fit the week you are actually going to live.',
    category: 'nutrition',
    images: [],
    keyTakeaways: [
      'Anchor each meal with a clear protein source.',
      'Aim for repeatable habits instead of perfect tracking.',
      'Protein is easier when breakfast is solved in advance.',
    ],
    sources: ['Harvard Healthy Eating Plate', 'WHO healthy diet guidance'],
    related: [
      { kind: 'recipe', slug: 'overnight-oats-blueberries', title: 'Overnight Oats with Blueberries' },
      { kind: 'recipe', slug: 'spinach-feta-omelet', title: 'Spinach Feta Omelet' },
    ],
  },
  {
    slug: 'build-a-weeknight-meal-system',
    title: 'Build a Weeknight Meal System',
    description: 'Create a practical repeatable structure for dinners instead of improvising every day.',
    body: 'A workable meal system usually means fewer decisions after work. Choose a few repeating dinner shapes such as bowl, soup, tray bake, or stir-fry. Then keep your pantry and shopping list aligned with those shapes so weeknights feel easier instead of chaotic.',
    category: 'guides',
    images: [],
    keyTakeaways: [
      'Repeat meal formats, not necessarily the same exact dishes.',
      'Base shopping on your weekly structure, not on random inspiration.',
      'A reliable pantry reduces friction more than another recipe bookmark.',
    ],
    sources: ['NHS healthy meal planning advice'],
    related: [
      { kind: 'recipe', slug: 'tofu-ginger-stir-fry', title: 'Tofu Ginger Stir-Fry' },
      { kind: 'recipe', slug: 'tomato-lentil-soup', title: 'Tomato Lentil Soup' },
    ],
  },
  {
    slug: 'how-to-use-a-pantry-like-a-product',
    title: 'How to Use a Pantry Like a Product',
    description: 'Turn your pantry from a vague cupboard into a useful planning signal.',
    body: 'Most people know roughly what they have at home, but rough knowledge breaks down during a busy week. A pantry becomes genuinely useful when it is treated as a lightweight operating layer: visible enough to influence planning, simple enough to maintain, and connected to what you already bought.',
    category: 'guides',
    images: [],
    keyTakeaways: [
      'Track staple items, not every single grain of food.',
      'Sync bought shopping items into pantry inventory regularly.',
      'Use pantry visibility to avoid duplicate purchases and reduce waste.',
    ],
    sources: ['WRAP household food waste guidance'],
    related: [
      { kind: 'recipe', slug: 'mediterranean-quinoa-bowl', title: 'Mediterranean Quinoa Bowl' },
      { kind: 'article', slug: 'build-a-weeknight-meal-system', title: 'Build a Weeknight Meal System' },
    ],
  },
  {
    slug: 'choosing-better-convenience-products',
    title: 'Choosing Better Convenience Products',
    description: 'How to compare packaged foods quickly without getting lost in label noise.',
    body: 'Convenience products are not the enemy. The real skill is knowing which ones support your actual meals. Compare protein, fiber, added sugar, sodium, and ingredient clarity. Then ask whether the product shortens a real step in your week.',
    category: 'products',
    images: [],
    keyTakeaways: [
      'Buy convenience that solves a real weekly bottleneck.',
      'Compare a few key numbers instead of scanning everything.',
      'Prioritize products that still fit normal meal building.',
    ],
    sources: ['FDA food labeling resources'],
    related: [
      { kind: 'recipe', slug: 'green-protein-smoothie', title: 'Green Protein Smoothie' },
      { kind: 'article', slug: 'protein-without-overthinking', title: 'Protein Without Overthinking It' },
    ],
  },
  {
    slug: 'healthy-eating-after-a-busy-day',
    title: 'Healthy Eating After a Busy Day',
    description: 'Why night-time food decisions go wrong and how to reduce friction before it happens.',
    body: 'Even motivated people drift off-plan when they hit the evening already tired and underfed. Better evenings usually start earlier: protein at lunch, a realistic snack, a meal system that removes choices, and a shopping list that protects you from missing ingredients.',
    category: 'nutrition',
    images: [],
    keyTakeaways: [
      'Evening eating problems often begin with earlier under-fuelling.',
      'Structure beats willpower when the day has already been hard.',
      'Good defaults matter more than perfect motivation.',
    ],
    sources: ['British Dietetic Association practical nutrition resources'],
    related: [
      { kind: 'recipe', slug: 'salmon-rice-crunch-bowl', title: 'Salmon Rice Crunch Bowl' },
      { kind: 'article', slug: 'build-a-weeknight-meal-system', title: 'Build a Weeknight Meal System' },
    ],
  },
  {
    slug: 'what-premium-should-unlock',
    title: 'What a Premium Meal Planning Experience Should Unlock',
    description: 'A product perspective on what makes a paid planning layer genuinely valuable.',
    body: 'Premium is not just extra screens. It should reduce decisions, speed up planning, and connect the user journey from recipes to pantry to shopping list to a repeatable weekly workflow. When those connections are real, the value proposition becomes obvious.',
    category: 'products',
    images: [],
    keyTakeaways: [
      'Premium should save time, not only add content.',
      'Cross-feature coordination is what creates product value.',
      'Users feel the difference when planning becomes easier to repeat.',
    ],
    sources: ['Internal product strategy note'],
    related: [
      { kind: 'recipe', slug: 'chicken-avocado-salad', title: 'Chicken Avocado Salad' },
      { kind: 'article', slug: 'how-to-use-a-pantry-like-a-product', title: 'How to Use a Pantry Like a Product' },
    ],
  },
];

const articleCatalogBySlug = new Map(articleCatalog.map((article) => [article.slug, article]));

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseCategory(value: string | null | undefined): ArticleCategory | null {
  if (!value) {
    return null;
  }

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
    description: body.slice(0, 150),
    body,
    category: title.toLowerCase().includes('product') ? 'products' : 'nutrition',
    images: [],
    keyTakeaways: [
      'Review the main idea.',
      'Connect it to a meal or shopping choice.',
      'Use it as a small rule you can repeat.',
    ],
    sources: ['Internal editorial placeholder'],
    related: [],
  };
}

function mergeDatabaseArticle(slug: string, title: string, body: string): ArticleRecord {
  const preset = articleCatalogBySlug.get(slug);
  if (!preset) {
    return buildFallbackArticle(slug, title, body);
  }

  return {
    ...preset,
    title: title || preset.title,
    body: body || preset.body,
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
      return articleCatalog;
    }

    return rows.map((row) => mergeDatabaseArticle(row.slug, row.title, row.body));
  } catch {
    return articleCatalog;
  }
}

export async function listArticleSummaries(
  params: ListArticleParams = {},
): Promise<ArticleSummary[]> {
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
