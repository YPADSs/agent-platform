import { PrismaClient } from '@prisma/client';

import recipesFromFile from './fixtures/recipes.json' assert { type: 'json' };
import articlesFromFile from './fixtures/articles.json' assert { type: 'json' };
import substitutionsFromFile from './fixtures/substitutions.json' assert { type: 'json' };

const prisma = new PrismaClient();

type FixtureItem = { slug: string; title: string; body: string };
type SubstitutionFixture = {
  sourceKey: string | null;
  sourceName: string | null;
  sourceCategoryKey: string | null;
  substituteKey: string;
  substituteName: string;
  substituteCategoryKey: string | null;
  reason: string;
  note: string | null;
  sortOrder: number;
};

const recipes = recipesFromFile as FixtureItem[];
const articles = articlesFromFile as FixtureItem[];
const substitutions = substitutionsFromFile as SubstitutionFixture[];

async function upsertIngredient(input: {
  key: string;
  defaultName: string;
  categoryKey?: string | null;
}) {
  return prisma.ingredientCatalog.upsert({
    where: { key: input.key },
    update: {
      defaultName: input.defaultName,
      categoryKey: input.categoryKey ?? null,
    },
    create: {
      key: input.key,
      defaultName: input.defaultName,
      categoryKey: input.categoryKey ?? null,
    },
    select: { id: true, key: true },
  });
}

async function seedSubstitutions() {
  for (const item of substitutions) {
    const substituteIngredient = await upsertIngredient({
      key: item.substituteKey,
      defaultName: item.substituteName,
      categoryKey: item.substituteCategoryKey,
    });

    const sourceIngredient =
      item.sourceKey && item.sourceName
        ? await upsertIngredient({
            key: item.sourceKey,
            defaultName: item.sourceName,
            categoryKey: item.sourceCategoryKey,
          })
        : null;

    await prisma.ingredientSubstitutionRule.deleteMany({
      where: {
        sourceIngredientId: sourceIngredient?.id ?? null,
        sourceCategoryKey: item.sourceCategoryKey ?? null,
        substituteIngredientId: substituteIngredient.id,
      },
    });

    await prisma.ingredientSubstitutionRule.create({
      data: {
        sourceIngredientId: sourceIngredient?.id ?? null,
        sourceCategoryKey: item.sourceCategoryKey ?? null,
        substituteIngredientId: substituteIngredient.id,
        reason: item.reason,
        note: item.note ?? null,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    });
  }
}

async function main() {
  await prisma.recipe.createMany({ data: recipes, skipDuplicates: true });
  await prisma.article.createMany({ data: articles, skipDuplicates: true });
  await seedSubstitutions();
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
