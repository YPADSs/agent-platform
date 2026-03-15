import type { Metadata } from 'next';
import type { Locale } from '@/i18n';
import { getArticleDetail } from '@/lib/articles';
import {
  getContentDetailAlternates,
  getContentDetailCanonical,
} from '@/lib/seo';

export { default } from '../../../articles/[slug]/page';

type LocalizedArticleMetadataProps = {
  params: { locale: Locale; slug: string };
};

export async function generateMetadata({ params }: LocalizedArticleMetadataProps): Promise<Metadata> {
  const article = await getArticleDetail(params.slug);

  if (!article) {
    return {
      title: 'Article not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getContentDetailCanonical('articles', article.slug, params.locale);

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical,
      languages: getContentDetailAlternates('articles', article.slug),
    },
    openGraph: {},
  };
}
