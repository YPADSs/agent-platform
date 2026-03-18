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

const recipeCatalog: RecipeRecord[] = [
  {
    slug: 'overnight-oats-blueberries',
    title: 'Overnight Oats with Blueberries',
    description: 'Prep-ahead breakfast with oats, yogurt, chia, and berries.',
    body: 'A reliable high-fiber breakfast you can prep once and reuse all week.',
    mealType: 'breakfast',
    servings: 1,
    nutrition: { calories: 372, protein: 22, fat: 10, carbs: 49 },
    ingredients: [
      { name: 'Rolled oats', amount: 60, unit: 'g' },
      { name: 'Greek yogurt', amount: 120, unit: 'g' },
      { name: 'Milk', amount: 120, unit: 'ml' },
      { name: 'Blueberries', amount: 80, unit: 'g' },
      { name: 'Chia seeds', amount: 10, unit: 'g' },
    ],
    steps: [
      'Combine oats, yogurt, milk, and chia seeds in a jar.',
      'Stir in half of the blueberries and chill overnight.',
      'Top with the remaining berries before serving.',
    ],
  },
  {
    slug: 'spinach-feta-omelet',
    title: 'Spinach Feta Omelet',
    description: 'Fast savory breakfast with eggs, spinach, herbs, and feta.',
    body: 'A protein-forward breakfast that feels fresh without taking much time.',
    mealType: 'breakfast',
    servings: 1,
    nutrition: { calories: 328, protein: 24, fat: 22, carbs: 7 },
    ingredients: [
      { name: 'Eggs', amount: 3, unit: 'pc' },
      { name: 'Baby spinach', amount: 60, unit: 'g' },
      { name: 'Feta', amount: 35, unit: 'g' },
      { name: 'Olive oil', amount: 1, unit: 'tsp' },
      { name: 'Parsley', amount: 1, unit: 'tbsp', scalable: false },
    ],
    steps: [
      'Whisk the eggs with chopped parsley.',
      'Wilt spinach in a warm pan with olive oil.',
      'Pour in eggs, scatter feta over the top, and fold when set.',
    ],
  },
  {
    slug: 'chicken-avocado-salad',
    title: 'Chicken Avocado Salad',
    description: 'A lunch salad with grilled chicken, avocado, greens, and lemon dressing.',
    body: 'Balanced protein and healthy fats for a quick lunch that still feels satisfying.',
    mealType: 'salad',
    servings: 2,
    nutrition: { calories: 418, protein: 33, fat: 23, carbs: 17 },
    ingredients: [
      { name: 'Chicken breast', amount: 240, unit: 'g' },
      { name: 'Mixed greens', amount: 120, unit: 'g' },
      { name: 'Avocado', amount: 1, unit: 'pc' },
      { name: 'Cherry tomatoes', amount: 120, unit: 'g' },
      { name: 'Olive oil', amount: 1, unit: 'tbsp' },
      { name: 'Lemon juice', amount: 1, unit: 'tbsp' },
    ],
    steps: [
      'Slice the cooked chicken breast.',
      'Whisk olive oil and lemon juice into a dressing.',
      'Assemble the greens, tomatoes, avocado, and chicken, then dress before serving.',
    ],
  },
  {
    slug: 'mediterranean-quinoa-bowl',
    title: 'Mediterranean Quinoa Bowl',
    description: 'Quinoa bowl with chickpeas, cucumber, herbs, and yogurt sauce.',
    body: 'A portable lunch bowl that keeps well and tastes better after resting.',
    mealType: 'lunch',
    servings: 2,
    nutrition: { calories: 444, protein: 19, fat: 16, carbs: 54 },
    ingredients: [
      { name: 'Cooked quinoa', amount: 280, unit: 'g' },
      { name: 'Chickpeas', amount: 180, unit: 'g' },
      { name: 'Cucumber', amount: 140, unit: 'g' },
      { name: 'Cherry tomatoes', amount: 140, unit: 'g' },
      { name: 'Greek yogurt', amount: 100, unit: 'g' },
      { name: 'Lemon juice', amount: 1, unit: 'tbsp' },
    ],
    steps: [
      'Divide quinoa between bowls.',
      'Top with chickpeas, cucumber, and tomatoes.',
      'Mix yogurt with lemon juice and spoon over the bowls.',
    ],
  },
  {
    slug: 'tomato-lentil-soup',
    title: 'Tomato Lentil Soup',
    description: 'Comforting soup with red lentils, tomatoes, aromatics, and herbs.',
    body: 'A batch-friendly dinner that uses pantry ingredients and reheats beautifully.',
    mealType: 'soup',
    servings: 4,
    nutrition: { calories: 316, protein: 18, fat: 7, carbs: 44 },
    ingredients: [
      { name: 'Red lentils', amount: 220, unit: 'g' },
      { name: 'Crushed tomatoes', amount: 400, unit: 'g' },
      { name: 'Vegetable broth', amount: 900, unit: 'ml' },
      { name: 'Onion', amount: 1, unit: 'pc' },
      { name: 'Garlic', amount: 3, unit: 'clove' },
      { name: 'Olive oil', amount: 1, unit: 'tbsp' },
    ],
    steps: [
      'Saute onion and garlic in olive oil.',
      'Add lentils, tomatoes, and broth.',
      'Simmer until tender, season well, and blend lightly if desired.',
    ],
  },
  {
    slug: 'tofu-ginger-stir-fry',
    title: 'Tofu Ginger Stir-Fry',
    description: 'Weeknight dinner with tofu, vegetables, ginger, and a quick soy glaze.',
    body: 'A flexible dinner built around tofu, color, and quick pan-cooking.',
    mealType: 'dinner',
    servings: 2,
    nutrition: { calories: 432, protein: 25, fat: 19, carbs: 37 },
    ingredients: [
      { name: 'Firm tofu', amount: 280, unit: 'g' },
      { name: 'Broccoli', amount: 180, unit: 'g' },
      { name: 'Bell pepper', amount: 140, unit: 'g' },
      { name: 'Soy sauce', amount: 2, unit: 'tbsp' },
      { name: 'Ginger', amount: 1, unit: 'tbsp', scalable: false },
      { name: 'Cooked rice', amount: 240, unit: 'g' },
    ],
    steps: [
      'Brown the tofu until crisp on the edges.',
      'Stir-fry broccoli and pepper until just tender.',
      'Add soy sauce and ginger, then serve over warm rice.',
    ],
  },
  {
    slug: 'salmon-rice-crunch-bowl',
    title: 'Salmon Rice Crunch Bowl',
    description: 'Salmon, rice, cucumber, and avocado in a crisp weeknight bowl.',
    body: 'A fast dinner bowl that feels fresh, balanced, and genuinely satisfying.',
    mealType: 'dinner',
    servings: 2,
    nutrition: { calories: 498, protein: 32, fat: 21, carbs: 43 },
    ingredients: [
      { name: 'Salmon fillet', amount: 260, unit: 'g' },
      { name: 'Cooked rice', amount: 260, unit: 'g' },
      { name: 'Cucumber', amount: 120, unit: 'g' },
      { name: 'Avocado', amount: 1, unit: 'pc' },
      { name: 'Soy sauce', amount: 1, unit: 'tbsp' },
      { name: 'Sesame seeds', amount: 1, unit: 'tbsp', scalable: false },
    ],
    steps: [
      'Roast or pan-cook the salmon until just cooked through.',
      'Arrange rice, cucumber, and avocado in bowls.',
      'Top with salmon, soy sauce, and sesame seeds.',
    ],
  },
  {
    slug: 'greek-yogurt-berry-parfait',
    title: 'Greek Yogurt Berry Parfait',
    description: 'Snack or dessert with yogurt, berries, and crunchy granola.',
    body: 'A quick protein snack that also works as a light dessert.',
    mealType: 'snack',
    servings: 1,
    nutrition: { calories: 246, protein: 18, fat: 6, carbs: 28 },
    ingredients: [
      { name: 'Greek yogurt', amount: 170, unit: 'g' },
      { name: 'Strawberries', amount: 80, unit: 'g' },
      { name: 'Blueberries', amount: 50, unit: 'g' },
      { name: 'Granola', amount: 25, unit: 'g' },
      { name: 'Honey', amount: 1, unit: 'tsp', scalable: false },
    ],
    steps: [
      'Layer yogurt, berries, and granola in a glass.',
      'Finish with a small drizzle of honey.',
    ],
  },
  {
    slug: 'green-protein-smoothie',
    title: 'Green Protein Smoothie',
    description: 'Spinach smoothie with banana, yogurt, and protein powder.',
    body: 'Useful when someone wants a quick breakfast or post-workout drink without a full meal.',
    mealType: 'drink',
    servings: 1,
    nutrition: { calories: 312, protein: 28, fat: 7, carbs: 34 },
    ingredients: [
      { name: 'Banana', amount: 1, unit: 'pc' },
      { name: 'Baby spinach', amount: 50, unit: 'g' },
      { name: 'Greek yogurt', amount: 120, unit: 'g' },
      { name: 'Milk', amount: 220, unit: 'ml' },
      { name: 'Protein powder', amount: 30, unit: 'g' },
    ],
    steps: [
      'Blend all ingredients until fully smooth.',
      'Adjust thickness with extra milk if needed.',
      'Serve immediately.',
    ],
  },
  {
    slug: 'dark-chocolate-date-bites',
    title: 'Dark Chocolate Date Bites',
    description: 'Simple freezer-friendly dessert bites with dates, cocoa, and nuts.',
    body: 'A better dessert option for people who want something sweet but portioned.',
    mealType: 'dessert',
    servings: 8,
    nutrition: { calories: 128, protein: 3, fat: 6, carbs: 18 },
    ingredients: [
      { name: 'Dates', amount: 180, unit: 'g' },
      { name: 'Walnuts', amount: 70, unit: 'g' },
      { name: 'Cocoa powder', amount: 2, unit: 'tbsp', scalable: false },
      { name: 'Dark chocolate', amount: 40, unit: 'g' },
    ],
    steps: [
      'Blend dates and walnuts into a sticky crumb.',
      'Mix in cocoa powder and roll into small bites.',
      'Drizzle with melted chocolate and chill until firm.',
    ],
  },
];

const mealTypes: MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'snack',
  'soup',
  'drink',
  'salad',
];

const recipeCatalogBySlug = new Map(recipeCatalog.map((recipe) => [recipe.slug, recipe]));

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function parseMealType(value: string | null | undefined): MealType | null {
  if (!value) {
    return null;
  }

  const normalized = normalizeText(value);
  return mealTypes.includes(normalized as MealType) ? (normalized as MealType) : null;
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

function inferMealType(title: string, body: string): MealType {
  const haystack = `${title} ${body}`.toLowerCase();
  if (haystack.includes('breakfast') || haystack.includes('oat') || haystack.includes('omelet')) {
    return 'breakfast';
  }
  if (haystack.includes('salad')) {
    return 'salad';
  }
  if (haystack.includes('soup')) {
    return 'soup';
  }
  if (haystack.includes('smoothie') || haystack.includes('drink')) {
    return 'drink';
  }
  if (haystack.includes('dessert') || haystack.includes('chocolate')) {
    return 'dessert';
  }
  if (haystack.includes('snack') || haystack.includes('parfait')) {
    return 'snack';
  }
  if (haystack.includes('bowl') || haystack.includes('lunch')) {
    return 'lunch';
  }
  return 'dinner';
}

function buildFallbackRecipe(slug: string, title: string, body: string): RecipeRecord {
  return {
    slug,
    title,
    description: body.slice(0, 140),
    body,
    mealType: inferMealType(title, body),
    servings: 2,
    nutrition: { calories: 420, protein: 24, fat: 14, carbs: 38 },
    ingredients: [
      { name: 'Main ingredient', amount: 200, unit: 'g' },
      { name: 'Olive oil', amount: 1, unit: 'tbsp' },
      { name: 'Salt', amount: 1, unit: 'tsp', scalable: false },
    ],
    steps: ['Prepare the ingredients.', 'Cook or assemble the dish.', 'Serve immediately.'],
  };
}

function mergeDatabaseRecipe(slug: string, title: string, body: string): RecipeRecord {
  const preset = recipeCatalogBySlug.get(slug);
  if (!preset) {
    return buildFallbackRecipe(slug, title, body);
  }

  return {
    ...preset,
    title: title || preset.title,
    body: body || preset.body,
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
      return recipeCatalog;
    }

    return rows.map((row) => mergeDatabaseRecipe(row.slug, row.title, row.body));
  } catch {
    return recipeCatalog;
  }
}

export async function ensureRecipeRecordInDatabase(slug: string) {
  const prisma = getPrisma();
  const existing = await prisma.recipe.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true },
  });

  if (existing) {
    return existing;
  }

  const preset = recipeCatalogBySlug.get(slug);
  if (!preset) {
    return null;
  }

  return prisma.recipe.create({
    data: {
      slug: preset.slug,
      title: preset.title,
      body: preset.body,
    },
    select: { id: true, slug: true, title: true },
  });
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
