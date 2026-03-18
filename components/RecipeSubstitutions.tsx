'use client';

import { useEffect, useMemo, useState } from 'react';

type RecipeIngredientProp = {
  name: string;
  text: string;
};

type SubstitutionSuggestion = {
  ingredientKey: string;
  displayName: string;
  reason: string;
  note: string | null;
  matchType: 'ingredient' | 'category';
};

type SubstitutionResult = {
  ingredientKey: string;
  ingredientName: string;
  suggestions: SubstitutionSuggestion[];
};

type RecipeSubstitutionsProps = {
  ingredients: RecipeIngredientProp[];
};

function toIngredientKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function RecipeSubstitutions({ ingredients }: RecipeSubstitutionsProps) {
  const normalizedItems = useMemo(() => {
    const map = new Map<string, string>();

    for (const ingredient of ingredients) {
      const key = toIngredientKey(ingredient.name);

      if (!key || map.has(key)) {
        continue;
      }

      map.set(key, ingredient.name);
    }

    return Array.from(map.entries()).map(([ingredientKey, ingredientName]) => ({
      ingredientKey,
      ingredientName,
    }));
  }, [ingredients]);

  const [results, setResults] = useState<SubstitutionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadSubstitutions() {
      if (!normalizedItems.length) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetched = await Promise.all(
          normalizedItems.map(async (item) => {
            const response = await fetch(`
/api/v1/substitutions?ingredientKey=${encodeURIComponent(item.ingredientKey)}`,
              {
                cache: 'no-store',
              },
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(data.error ?? 'UNABLE_TO_LOAD_SUBSTITUTIONS');
            }

            return {
              ingredientKey: item.ingredientKey,
              ingredientName: item.ingredientName,
              suggestions: (data.suggestions ?? []) as SubstitutionSuggestion[],
            };
          }),
        );

        if (!isActive) {
          return;
        }

        setResults(fetched.filter((item) => item.suggestions.length > 0));
        setLoading(false);
      } catch {
        if (!isActive) {
          return;
        }

        setError('Unable to load substitutions right now.');
        setLoading(false);
      }
    }

    void loadSubstitutions();

    return () => {
      isActive = false;
    };
  }, [normalizedItems]);

  if (loading) {
    return (
      <section className="panel">
        <h2>Substitutions</h2>
        <p className="muted">Loading possible swaps for your ingredients...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Substitutions</h2>
        <p className="muted">{error}</p>
      </section>
    );
  }

  if (!results.length) {
    return (
      <section className="panel">
        <h2>Substitutions</h2>
        <p className="muted">No curated swaps are available for this recipe yet.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>Substitutions</h2>
      <p className="muted">Deterministic swaps based on merged Sprint 5 rules.</p>
      <div className="recipeColumns">
        {results.map((result) => (
          <div key={result.ingredientKey} className="panel">
            <h3>{result.ingredientName}</h3>
            <ul className="ingredientList">
              {result.suggestions.map((suggestion) => (
                <li key={`${result.ingredientKey}-${suggestion.ingredientKey}`-${suggestion.matchType}`}>
                  <strong>{suggestion.displayName}</strong>
                  <p >{suggestion.reason}</p>
                  <small className="muted">
                    Match: {suggestion.matchType === 'ingredient' ? 'direct ingredient' : 'category fallback'}
                  </small>
                  {suggestion.note ? <p className="muted">{suggestion.note}</p> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
