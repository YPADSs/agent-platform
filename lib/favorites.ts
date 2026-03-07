
import { getArticleDetail } from '@/lib/articles';
import { getRecipeDetail } from '@/lib/recipes';

export type FavoriteTargetType = 'RECIPE' | 'ARTICLE';

export type FavoriteTargetSummary = {
  type: FavoriteTargetType;
  slug: string;
  title: string;
  description: string;
  href: string;
};

export async function getFavoriteTargetSummary(
  targetType: FavoriteTargetType,
  targetSlug: string,
): Promise<FavoriteTargetSummary | null> {
  if (targetType === 'RECIPE') {
    const recipe = await getRecipeDetail(targetSlug);
    if (!recipe) return null;
    return {
      type: 'RECIPE',
      slug: recipe.slug,
      title: recipe.title,
      description: recipe.description,
      href: `/recipes/${recipe.slug}`,
    };
  }

  const article = await getArticleDetail(targetSlug);
  if (!article) return null;
  return {
    type: 'ARTICLE',
    slug: article.slug,
    title: article.title,
    description: article.description,
    href: `/articles/${article.slug}`,
  };
}

export async function favoriteTargetExists(
  targetType: FavoriteTargetType,
  targetSlug: string,
): Promise<boolean> {
  const target = await getFavoriteTargetSummary(targetType, targetSlug);
  return Boolean(target);
}
