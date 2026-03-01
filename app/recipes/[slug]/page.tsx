import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/content';

export default async function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = await getRecipe(params.slug);
  if (!recipe) return notFound();

  return (
    <>
      <h1>{recipe.title}</h1>
      <p><strong>Slug:</strong> {recipe.slug}</p>
      <article>
        <p>{recipe.body}</p>
      </article>
    </>
  );
}
