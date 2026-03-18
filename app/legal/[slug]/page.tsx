import { notFound } from 'next/navigation';

const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    intro:
      'Nourivo stores only the information required to authenticate users, support planning features, and operate subscriptions responsibly.',
    sections: [
      {
        heading: 'What we collect',
        body: 'Account email, authentication credentials, product preferences, planner data, favorites, shopping items, and pantry records. Billing data is processed through Stripe and linked through customer identifiers rather than full card details.',
      },
      {
        heading: 'Why we collect it',
        body: 'We use this data to deliver the core product experience, keep user state synchronized across features, and support account and subscription management.',
      },
      {
        heading: 'Operational note',
        body: 'Production operations should ensure database backups, access controls, and environment secret management are configured before public launch.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro:
      'Nourivo is a software product for meal planning, recipe discovery, pantry awareness, and related subscription features.',
    sections: [
      {
        heading: 'Product scope',
        body: 'The platform is designed for informational and organizational use. It does not replace professional medical, nutritional, or legal advice.',
      },
      {
        heading: 'Accounts and access',
        body: 'Users are responsible for safeguarding their account credentials. Premium functionality depends on successful billing and current subscription status.',
      },
      {
        heading: 'Availability',
        body: 'We may update, improve, or temporarily restrict features as part of product maintenance, launch stabilization, and operational support.',
      },
    ],
  },
  cookies: {
    title: 'Cookies Policy',
    intro:
      'Nourivo may use essential cookies or session storage to support authentication, locale handling, and general application stability.',
    sections: [
      {
        heading: 'Essential behavior',
        body: 'Session and auth-related storage helps keep users logged in and preserves the basic application experience.',
      },
      {
        heading: 'Analytics',
        body: 'The platform can collect privacy-safe analytics events to understand feature usage and improve product performance without storing sensitive personal content in event payloads.',
      },
      {
        heading: 'Future updates',
        body: 'If additional analytics or marketing tooling is introduced, this policy should be updated before those changes go live.',
      },
    ],
  },
  disclaimer: {
    title: 'Disclaimer',
    intro:
      'Nourivo provides structured planning and educational content, but it is not a substitute for individualized medical or nutritional advice.',
    sections: [
      {
        heading: 'Health content',
        body: 'Recipes, articles, and planning suggestions are offered for general informational use only. Individual health conditions, allergies, and nutritional needs vary.',
      },
      {
        heading: 'Billing and product availability',
        body: 'Premium access, integrations, and external services depend on correct production configuration and third-party platform availability.',
      },
      {
        heading: 'User responsibility',
        body: 'Users should verify that recipes, substitutions, and pantry assumptions are suitable for their personal circumstances.',
      },
    ],
  },
} as const;

type LegalSlug = keyof typeof legalContent;

function isLegalSlug(value: string): value is LegalSlug {
  return value in legalContent;
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!isLegalSlug(slug)) {
    notFound();
  }

  const page = legalContent[slug];

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <p className="eyebrow">Legal</p>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
      </div>

      <div className="recipeColumns">
        {page.sections.map((section) => (
          <section key={section.heading} className="panel">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
