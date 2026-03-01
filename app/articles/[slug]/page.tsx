export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <h1>Article: {params.slug}</h1>
      <p>Detail placeholder.</p>
    </>
  );
}
