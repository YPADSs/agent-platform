import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function loadFixture<T>(filename: string): Promise<T> {
  const filepath = path.join(__dirname, 'fixtures', filename);
  const contents = await readFile(filepath, 'utf8');
  return JSON.parse(contents) as T;
}

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

async function seedSubstitutions(substitutions: SubstitutionFixture[]) {
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
  const recipes = await loadFixture<FixtureItem[]>('recipes.json');
  const articles = await loadFixture<FixtureItem[]>('articles.json');
  const substitutions = await loadFixture<SubstitutionFixture[]>('substitutions.json');

  await prisma.recipe.createMany({ data: recipes, skipDuplicates: true });
  await prisma.article.createMany({ data: articles, skipDuplicates: true });
  await seedSubstitutions(substitutions);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
