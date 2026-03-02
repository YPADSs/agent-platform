import { notFound } from 'next/navigation';
import { getRecipe } from '@/lib/content';

export default async function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = await getRecipe(params.slug);
  if (!recipe) return notFound();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.body,
    url: `/recipes/${recipe.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+ŽÊ'
        dangerouslySetHnnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <h1>{recipe.title}</h1>
      <p>
        <strong>Slug:</strong> {recipe.slug}
      </p>      <article>
        <p>{recipe.body}</p>
      </article>
    </>
  );
}
