import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ViewTracker from '@/components/ViewTracker';
import ArticleActions from '@/components/ArticleActions';
import { getArticleDetail } from '@/lib/articles';
import {
  getAbsoluteUrl,
  getContentDetailAlternates,
  getContentDetailCanonical,
} from '@/lib/seo';
import { withLocale } from '@/lib/locale-path';

type ArticleDetailPageProps = {
  params: { slug: string; locale?: string };
};

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const article = await getArticleDetail(params.slug);

  if (!article) {
    return {
      title: 'Article not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = getContentDetailCanonical('articles', article.slug);

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

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const article = await getArticleDetail(params.slug);
  if (!article) return notFound();
  const locale = params.locale;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    articleBody: article.body,
    url: getAbsoluteUrl(`/articles/${article.slug}`),
  };

  return (
    <>
      <ViewTracker kind="article" slug={article.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="recipeDetail">
        <header className="recipeHero">
          <p className="badge">{article.category}</p>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
        </header>

        <ArticleActions slug={article.slug} />

        <div className="recipeColumns">
          <section className="panel">
            <h2>Article</h2>
            <p>{article.body}</p>
          </section>

          <section className="panel">
            <h2>Key takeaways</h2>
            <ul className="ingredientList">
              {article.keyTakeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="recipeColumns">
          <section className="panel">
            <h2>Sources</h2>
            <ul className="ingredientList">
              {article.sources.length ? article.sources.map((source) => (
                <li key={source}>{source}</li>
              )) : <li>No sources listed yet.</li>}
            </ul>
          </section>

          <section className="panel">
            <h2>Related content</h2>
            <ul className="ingredientList">
              {article.related.length ? article.related.map((item) => (
                <li key={`${item.kind}-${item.slug}`}>
                  <Link href={withLocale(locale, item.kind === 'recipe' ? `/recipes/${item.slug}` : `/articles/${item.slug}`)}>
                    {item.title}
                  </Link>
                  <small className="muted">{item.kind}</small>
                </li>
              )) : <li>No related content available.</li>}
            </ul>
          </section>
        </div>
      </article>
    </>
  );
}
