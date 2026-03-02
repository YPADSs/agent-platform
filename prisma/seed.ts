import { PrismaClient } from '@prisma/client';

import recipesFromFile from './fixtures/recipes.json' assert { type: 'json' };
import articlesFromFile from './fixtures/articles.json' assert { type: 'json' };

const prisma = new PrismaClient();

type FixtureItem = { slug: string; title: string; body: string };

const recipes = recipesFromFile as FixtureItem[];
const articles = articlesFromFile as FixtureItem[];

async function main() {
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
