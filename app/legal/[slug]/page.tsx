const titles: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookies: 'Cookies Policy',
  disclaimer: 'Disclaimer'
};

export default function LegalPage({ params }: { params: { slug: string } }) {
  const title = titles[params.slug] ?? 'Legal';
  return (
    <>
      <h1>{title}</h1>
      <p>Placeholder legal page content.</p>
    </>
  );
}
