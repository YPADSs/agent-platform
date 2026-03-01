import Link from 'next/link';

export default function ArticlesPage() {
  return (
    <>
      <h1>Articles</h1>
      <p>List placeholder.</p>
      <ul>
        <li><Link href="/articles/sample-article">Sample article</Link></li>
      </ul>
    </>
  );
}
