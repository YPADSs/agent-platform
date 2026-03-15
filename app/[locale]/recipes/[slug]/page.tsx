import type { Metadata } from 'next';
import type { Locale } from '@/i18n';
import { getRecipeDetail } from '@/lib/recipes';
import {
  getContentDetailAlternates,
  getContentDetailCanonical,
} from '@/lib/seo';

export { default } from '../../../recipes/[slug]/page';

type LocalizedRecipeMetadataProps = {
  params: { locale: Locale; slug: string };
};

export async function generateMetadata({ params }: LocalizedRecipeMetadataProps): Promise<Metadata> {
  const recipe = await getRecipeDetail(params.slug);

  if (!recipe) {
    return {
      title: 'Recipe not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getContentDetailCanonical('recipes', recipe.slug, params.locale);

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: {
      canonical,
      languages: getContentDetailAlternates('recipes', recipe.slug),
    },
    openGraph: {},
  };
}
