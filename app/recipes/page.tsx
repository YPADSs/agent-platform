import Link from 'next/link';

export default function RecipesPage() {
  return (
    <>
      <h1>Recipes</h1>
      <p>List placeholder. Search and filters will be added in later S1 issues.</p>
      <ul>
        <li><Link href="/recipes/sample-recipe">Sample recipe</Link></li>
      </ul>
    </>
  );
}
