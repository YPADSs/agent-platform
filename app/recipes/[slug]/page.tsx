export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <h1>Recipe: {params.slug}</h1>
      <p>Detail placeholder.</p>
    </>
  );
}
