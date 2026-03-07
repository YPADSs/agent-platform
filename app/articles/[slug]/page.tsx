import { notFound } from 'next/navigation';
import ViewTracker from '@/components/ViewTracker';
import ArticleActions from '@/components/ArticleActions';
import { getArticleDetail } from '@/lib/articles';

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await getArticleDetail(params.slug);
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
                  <a href={item.kind === 'recipe' ? `/recipes/${item.slug}` : `/articles/${item.slug}`}>
                    {item.title}
                  </a>
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
