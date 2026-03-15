import Link from 'next/link';
import { requirePremium } from '@/lib/premium';
import { requireSession } from '@/lib/session';
import { getUserPreferencesByEmail } from '@/lib/preferences';

type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function PlannerPage() {
  let preferences: Awaited<ReturnType<typeof getUserPreferencesByEmail>> | null = null;

  try {
    const session = await requireSession();
    const email = session.user?.email;

    if (email) {
      preferences = await getUserPreferencesByEmail(email);
    }

    await requirePremium();
  } catch {
    const showOnboardingCta = Boolean(
      preferences && preferences.onboardingStatus !== 'completed',
    );

    return (
      <div className="recipesPage">
        <h1>Meal Planner (Premium)</h1>
        <p>This feature requires Premium. Server-side gating is enforced.</p>
        <div className="filterActions">
          <Link href="/account">Go to Account</Link>
          <Link href="/account/onboarding">
            {showOnboardingCta ? 'Complete Sprint 4 setup' : 'Review setup'}
          </Link>
        </div>
      </div>
    );
  }

  const showOnboardingCallout = Boolean(
    preferences && preferences.onboardingStatus !== 'completed',
  );
  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <div className="recipesPage">
      <div className="pageIntro">
        <h1>Meal Planner (Premium)</h1>
        <p>
          Weekly planner V1 is available while the interactive calendar client is
          being stabilized.
        </p>
      </div>

      {showOnboardingCallout ? (
        <section className="panel">
          <h2>Complete your core setup</h2>
          <p>
            Confirm your goal, language, and units before you rely on the full
            weekly planner experience.
          </p>
          <Link href="/account/onboarding">Open onboarding</Link>
        </section>
      ) : null}

      <div className="plannerLayout">
        <section className="panel">
          <div className="plannerHeaderRow">
            <div>
              <h2>Weekly calendar</h2>
              <p className="muted">
                Premium access is active. The backend planner foundation,
                nutrient summary, and shopping list aggregation stay in Sprint 4
                scope while the interactive client UI is finalized.
              </p>
            </div>
            <div className="plannerWeekControls">
              <span className="badge">Week of {formatDate(weekStart)}</span>
            </div>
          </div>

          <div className="plannerGrid">
            {days.map((date, index) => (
              <article key={formatDate(date)} className="plannerDayCard">
                <div className="plannerDayHeader">
                  <h3>
                    {DAY_LABELS[index]} {date.getDate()}
                  </h3>
                  <span className="badge">{formatDate(date)}</span>
                </div>

                <div className="plannerSlots">
                  {slots.map((slot) => (
                    <section
                      key={`${formatDate(date)}-${slot}`}
                      className="plannerSlotCard"
                    >
                      <div className="plannerSlotHeader">
                        <strong>{SLOT_LABELS[slot]}</strong>
                        <span className="badge">V1</span>
                      </div>
                      <p className="muted">
                        Interactive add/remove controls are being finalized for
                        this pull request.
                      </p>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="plannerSidebar">
          <section className="panel">
            <h2>Week summary</h2>
            <dl className="plannerSummaryGrid">
              <div>
                <dt>Meals planned</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>Calories</dt>
                <dd>0</dd>
              </div>
              <div>
                <dt>Protein</dt>
                <dd>0g</dd>
              </div>
              <div>
                <dt>Fat</dt>
                <dd>0g</dd>
              </div>
              <div>
                <dt>Carbs</dt>
                <dd>0g</dd>
              </div>
              <div>
                <dt>Coverage</dt>
                <dd>Pending</dd>
              </div>
            </dl>
            <p className="muted">
              Summary wiring is merged on the backend and will be reconnected to
              the interactive planner client in the next fix.
            </p>
          </section>

          <section className="panel">
            <div className="plannerSidebarHeader">
              <h2>Shopping list preview</h2>
              <Link href="/shopping-list">Open full shopping list</Link>
            </div>
            <p className="muted">
              Shopping list aggregation remains part of Sprint 4 and will render
              here once planner item editing is reconnected.
            </p>
            <div className="emptyState">
              <p>
                Add planner items after the interactive planner client fix lands
                to see aggregated shopping list output here.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
