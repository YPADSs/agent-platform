import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type FixtureItem = { slug: string; title: string; body: string };

const recipes: FixtureItem[] = [
  { slug: 'overnight-oats', title: 'Overnight Oats', body: 'Simple oats with yogurt and berries.' },
  { slug: 'chicken-salad', title: 'Chicken Salad', body: 'Lean protein salad with greens.' }
];

const articles: FixtureItem[] = [
  { slug: 'why-protein-matters', title: 'Why Protein Matters', body: 'Protein supports muscle and satiety.' },
  { slug: 'hydration-basics', title: 'Hydration Basics', body: 'Water intake tips for everyday life.' }
];

async function main() {
  // NOTE: Keep seed minimal for S2-002. S2-005 will expand to >=10/10.
  await prisma.recipe.createMany({ data: recipes, skipDuplicates: true });
  await prisma.article.createMany({ data: articles, skipDuplicates: true });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
