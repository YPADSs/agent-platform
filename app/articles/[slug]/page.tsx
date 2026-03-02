import { notFound } from 'next/navigation';
import { getArticle } from '@/lib/content';
import ViewTracker from '@/components/ViewTracker';

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);
  if (!article) return notFound();

  return (
    <>
      <ViewTracker kind="article" slug={article.slug} />
      <h1>{article.title}</h1>
      <p>
        <strong>Slug:</strong> {article.slug}
      </p>
      <article>
        <p>{article.body}</p>
      </article>
    </>
  );
}
