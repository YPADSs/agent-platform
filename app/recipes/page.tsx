import Link from 'next/link';
import { listRecipes } from '@/lib/content';

export default async function RecipesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q;
  const recipes = await listRecipes(q);

  return (
    <>
      <h1>Recipes</h1>
      <form method="GET">
        <label>
          Search:{' '}
          <input name="q" defaultValue={q || ''} />
        </label>
        <button type="submit">Go</button>
      </form>
      <ul>
        {recipes.map((r) => (
          <li key={r.slug}>
            <Link href={`/recipes/${r.slug}`}>{r.title}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
