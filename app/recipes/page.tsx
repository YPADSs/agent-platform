import Link from 'next/link';
import { listRecipes } from '@/lib/content';
import SearchForm from '@/components/SearchForm';

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
      <SearchForm kind="recipes" defaultValue={q} />
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
