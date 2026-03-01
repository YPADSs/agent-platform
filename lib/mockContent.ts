export type ContentItem = { slug: string; title: string; body: string };

export const mockRecipes: ContentItem[] = [
  { slug: 'sample-recipe', title: 'Sample Recipe', body: 'This is a placeholder recipe for MVP scaffolding.' },
  { slug: 'green-salad', title: 'Green Salad', body: 'Simple healthy salad (placeholder).' },
];

export const mockArticles: ContentItem[] = [
  { slug: 'welcome', title: 'Welcome', body: 'Welcome article (placeholder).' },
  { slug: 'nutrition-basics', title: 'Nutrition Basics', body: 'Basics of healthy eating (placeholder).' },
];
