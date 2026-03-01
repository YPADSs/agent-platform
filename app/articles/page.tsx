import Link from 'next/link';
import { listArticles } from '@/lib/content';

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q;
  const articles = await listArticles(q);

  return (
    <>
      <h1>Articles</h1>
      <form method="GET">
        <label>
          Search:{' '}
          <input name="q" defaultValue={q || ''} />
        </label>
        <button type="submit">Go</button>
      </form>
      <ul>
        {articles.map((a) => (
          <li key={a.slug}>
            <Link href={`/articles/${a.slug}`}>{a.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
