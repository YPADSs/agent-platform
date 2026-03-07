import { getPrisma } from '@/lib/prisma';

export type MealType =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'snack'
  | 'soup'
  | 'drink'
  | 'salad';

export type RecipeNutrition = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type RecipeIngredient = {
  name: string;
  amount: number;
  unit: string;
  scalable: boolean;
  text: string;
};

export type RecipeStep = {
  order: number;
  text: string;
};

export type RecipeSummary = {
  slug: string;
  title: string;
  description: string;
  mealType: MealType;
  servings: number;
  nutrition: RecipeNutrition;
  ingredientNames: string[];
};

export type RecipeDetail = RecipeSummary & {
  body: string;
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
};

type RecipeRecord = {
  slug: string;
  title: string;
  description: string;
  body: string;
  mealType: MealType;
  servings: number;
  nutrition: RecipeNutrition;
  ingredients: Array<{
    name: string;
    amount: number;
    unit: string;
    scalable?: boolean;
  }>;
  steps: string[];
};

type ListRecipeParams = {
  q?: string | null;
  mealType?: string | null;
  ingredients?: string[];
  limit?: number;
};

const mockRecipeRecords: RecipeRecord[] = [
  {
    slug: 'green-protein-salad',
    title: 'Green Protein Salad',
    description: 'Leafy salad with chicken, avocado, and lemon dressing.',
    body: 'A simple high-protein salad designed for a fast healthy lunch.',
    mealType: 'salad',
    servings: 2,
    nutrition: { calories: 420, protein: 34, fat: 21, carbs: 18 },
    ingredients: [
      { name: 'Chicken breast', amount: 240, unit: 'g' },
      { name: 'Mixed greens', amount: 120, unit: 'g' },
      { name: 'Avocado', amount: 1, unit: 'pc' },
      { name: 'Cherry tomatoes', amount: 120, unit: 'g' },
      { name: 'Olive oil', amount: 2, unit: 'tbsp' },
      { name: 'Lemon juice', amount: 2, unit: 'tbsp' },
    ],
    steps: [
      'Cook or slice the chicken breast.',
      'Wash and dry the greens and tomatoes.',
      'Whisk olive oil with lemon juice.',
      'Assemble all ingredients and pour over dressing.',
    ],
  },
  {
    slug: 'overnight-oats-berries',
    title: 'Overnight Oats with Berries',
    description: 'Prep-ahead breakfast with oats, yogurt, and berries.',
    body: 'Balanced breakfast with fiber and protein for an easy morning routine.',
    mealType: 'breakfast',
    servings: 1,
    nutrition: { calories: 360, protein: 22, fat: 9, carbs: 50 },
    ingredients: [
      { name: 'Rolled oats', amount: 60, unit: 'g' },
      { name: 'Greek yogurt', amount: 120, unit: 'g' },
      { name: 'Milk', amount: 120, unit: 'ml' },
      { name: 'Blueberries', amount: 80, unit: 'g' },
      { name: 'Chia seeds', amount: 1, unit: 'tbsp' },
    ],
    steps: [
      'Combine oats, yogurt, milk, and chia seeds.',
      'Stir in half of the berries.',
      'Chill overnight.',
      'Top with the remaining berries before serving.',
    ],
  },
  {
    slug: 'tomato-lentil-soup',
    title: 'Tomato Lentil Soup',
    description: 'Comforting soup with lentils, tomatoes, and herbs.',
    body: 'A batch-friendly dinner recipe with pantry ingredients.',
    mealType: 'soup',
    servings: 4,
    nutrition: { calories: 310, protein: 18, fat: 7, carbs: 42 },
    ingredients: [
      { name: 'Red lentils', amount: 220, unit: 'g' },
      { name: 'Crushed tomatoes', amount: 400, unit: 'g' },
      { name: 'Vegetable broth', amount: 900, unit: 'ml' },
      { name: 'Onion', amount: 1, unit: 'pc' },
      { name: 'Garlic', amount: 3, unit: 'clove' },
      { name: 'Olive oil', amount: 1, unit: 'tbsp' },
    ],
    steps: [
      'Sauté onion and garlic in olive oil.',
      'Add lentils, tomatoes, and broth.',
      'Simmer until lentils are soft.',
      'Blend lightly if desired and serve.',
    ],
  },
];

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseMealType(value: string | null | undefined): MealType | null {
  if (!value) return null;
  const normalized = normalizeText(value);
  if (
    normalized === 'breakfast' ||
    normalized === 'lunch' ||
    normalized === 'dinner' ||
    normalized === 'dessert' ||
    normalized === 'snack' ||
    normalized === 'soup' ||
    normalized === 'drink' ||
    normalized === 'salad'
  ) {
    return normalized;
  }

  return null;
}

function roundAmount(value: number): number {
  return Number(value.toFixed(value >= 10 ? 0 : 1));
}

function toIngredientText(name: string, amount: number, unit: string): string {
  return `${roundAmount(amount)} ${unit} ${name}`.trim();
}

function toRecipeSummary(recipe: RecipeRecord): RecipeSummary {
  return {
    slug: recipe.slug,
    title: recipe.title,
    description: recipe.description,
    mealType: recipe.mealType,
    servings: recipe.servings,
    nutrition: recipe.nutrition,
    ingredientNames: recipe.ingredients.map((ingredient) => ingredient.name),
  };
}

function toRecipeDetail(recipe: RecipeRecord, servings?: number): RecipeDetail {
  const requestedServings = servings && servings > 0 ? servings : recipe.servings;
  const ratio = requestedServings / recipe.servings;

  return {
    ...toRecipeSummary({
      ...recipe,
      servings: requestedServings,
      nutrition: {
        calories: roundAmount(recipe.nutrition.calories * ratio),
        protein: roundAmount(recipe.nutrition.protein * ratio),
        fat: roundAmount(recipe.nutrition.fat * ratio),
        carbs: roundAmount(recipe.nutrition.carbs * ratio),
      },
    }),
    body: recipe.body,
    ingredients: recipe.ingredients.map((ingredient) => {
      const amount = ingredient.scalable === false ? ingredient.amount : ingredient.amount * ratio;
      return {
        name: ingredient.name,
        amount: roundAmount(amount),
        unit: ingredient.unit,
        scalable: ingredient.scalable !== false,
        text: toIngredientText(ingredient.name, amount, ingredient.unit),
      };
    }),
    steps: recipe.steps.map((text, index) => ({ order: index + 1, text })),
  };
}

function buildFallbackRecipe(slug: string, title: string, body: string): RecipeRecord {
  const baseIngredients = title.toLowerCase().includes('salad')
    ? [
        { name: 'Mixed greens', amount: 120, unit: 'g' },
        { name: 'Olive oil', amount: 1, unit: 'tbsp' },
        { name: 'Lemon juice', amount: 1, unit: 'tbsp' },
      ]
    : [
        { name: 'Main ingredient', amount: 200, unit: 'g' },
        { name: 'Olive oil', amount: 1, unit: 'tbsp' },
        { name: 'Salt', amount: 1, unit: 'tsp', scalable: false },
      ];

  return {
    slug,
    title,
    description: body,
    body,
    mealType: title.toLowerCase().includes('salad') ? 'salad' : 'dinner',
    servings: 2,
    nutrition: { calories: 400, protein: 25, fat: 15, carbs: 30 },
    ingredients: baseIngredients,
    steps: ['Prepare the ingredients.', 'Cook or assemble the dish.', 'Serve immediately.'],
  };
}

async function fetchRecipeRecords(): Promise<RecipeRecord[]> {
  try {
    const prisma = getPrisma();
    const rows = await prisma.recipe.findMany({
      orderBy: { createdAt: 'desc' },
      select: { slug: true, title: true, body: true },
      take: 100,
    });

    if (!rows.length) {
      return mockRecipeRecords;
    }

    return rows.map((row) => buildFallbackRecipe(row.slug, row.title, row.body));
  } catch {
    return mockRecipeRecords;
  }
}

export async function listRecipeSummaries(params: ListRecipeParams = {}): Promise<RecipeSummary[]> {
  const records = await fetchRecipeRecords();
  const query = normalizeText(params.q ?? '');
  const mealType = parseMealType(params.mealType);
  const ingredients = (params.ingredients ?? [])
    .map((ingredient) => normalizeText(ingredient))
    .filter(Boolean)
    .slice(0, 3);
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 50);

  return records
    .filter((recipe) => {
      if (mealType && recipe.mealType !== mealType) {
        return false;
      }

      if (query) {
        const matchesQuery =
          normalizeText(recipe.title).includes(query) ||
          normalizeText(recipe.description).includes(query) ||
          normalizeText(recipe.body).includes(query);

        if (!matchesQuery) {
          return false;
        }
      }

      if (ingredients.length) {
        const haystack = recipe.ingredients.map((ingredient) => normalizeText(ingredient.name));
        const matchesIngredients = ingredients.every((needle) =>
          haystack.some((ingredientName) => ingredientName.includes(needle)),
        );

        if (!matchesIngredients) {
          return false;
        }
      }

      return true;
    })
    .slice(0, limit)
    .map(toRecipeSummary);
}

export async function getRecipeDetail(
  slug: string,
  servings?: number,
): Promise<RecipeDetail | null> {
  const records = await fetchRecipeRecords();
  const recipe = records.find((item) => item.slug === slug);

  if (!recipe) {
    return null;
  }

  return toRecipeDetail(recipe, servings);
}

export function getShoppingListPayload(recipe: RecipeDetail): string[] {
  return recipe.ingredients.map((ingredient) => ingredient.text);
}
