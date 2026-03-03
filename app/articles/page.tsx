import Link from 'next/link';
import { listArticles } from '@/lib/content';
import SearchForm from '@/components/SearchForm';

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
      <SearchForm kind="articles" defaultValue={q} />
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
