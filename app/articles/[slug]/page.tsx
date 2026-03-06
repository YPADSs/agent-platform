import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/content';
import ViewTracker from '@/components/ViewTracker';
import FavoriteButton from '@/components/FavoriteButton';

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) return notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    articleBody: article.body,
    url: `/articles/${article.slug}`,
  };

  return (
    <>
      <ViewTracker kind="article" slug={article.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1>{article.title}</h1>
      <FavoriteButton targetType="ARTICLE" targetSlug={article.slug} />
      <p>
        <strong>Slug:</strong> {article.slug}
      </p>
      <article>
        <p>{article.body}</p>
      </article>
    </>
  );
}
