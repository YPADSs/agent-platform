import Link from 'next/link';
import { requirePremium } from '@/lib/premium';

export default async function PlannerPage() {
  try {
    await requirePremium();
  } catch (err){
    return (
      <>
        <h1>Meal Planner (Premium)</h1>
        <p>This feature requires Premium. Server-side gating is enforced.</p>
        <p>
          <Link href="/account">Go to Account</Link> to upgrade.
        </p>
      </>
    );
  }

  return (
    <>
      <h1>Meal Planner (Premium)</h1>
      <p>Premium access confirmed (server-side).</p>
    </>
  );
}
