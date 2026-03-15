import Link from 'next/link';
import { listArticleSummaries } from '@/lib/articles';
import { withLocale } from '@/lib/locale-path';

type ArticlesPageProps = {
  params?: { locale?: string };
  searchParams?: {
    q?: string;
    category?: string;
  };
};

const categoryOptions = [
  { value: '', label: 'All categories' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'guides', label: 'Guides' },
  { value: 'products', label: 'Products' },
];

export default async function ArticlesPage({ params, searchParams }: ArticlesPageProps) {
  const locale = params?.locale;
  const q = searchParams?.q?.trim() ?? '';
  const category = searchParams?.category?.trim() ?? '';
  const articles = await listArticleSummaries({ q, category });

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Articles</h1>
        <p>Search articles, browse by category, and open detail pages with key takeaways and related content.</p>
      </div>

      <form method="GET" className="recipesFilters">
        <label className="field">
          <span>Search</span>
          <input name="q" defaultValue={q} placeholder="Search articles" aria-label="Search articles" />
        </label>
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={category} aria-label="Filter articles by category">
            {categoryOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="filterActions">
          <button type="submit">Apply filters</button>
          <Link href={withLocale(locale, '/articles')}>Reset</Link>
        </div>
      </form>

      <p className="resultsMeta">{articles.length} result{articles.length === 1 ? '' : 's'}</p>

      {articles.length ? (
        <ul className="recipeGrid">
          {articles.map((article) => (
            <li key={article.slug} className="recipeCard">
              <div className="recipeCardHeader">
                <p className="badge">{article.category}</p>
              </div>
              <h2><Link href={withLocale(locale, `/articles/${article.slug}`)}>{article.title}</Link></h2>
              <p>{article.description}</p>
              <Link className="cardLink" href={withLocale(locale, `/articles/${article.slug}`)}>Open article</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="emptyState">
          <h2>No articles matched your filters</h2>
          <p>Try a different query or select a wider category.</p>
        </div>
      )}
    </div>
  );
}
