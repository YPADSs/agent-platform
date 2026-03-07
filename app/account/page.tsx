import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getAccountStatusByEmail } from "@/lib/billing";

export default async function AccountPage() {
  try {
    const session = await requireSession();
    const email = session.user?.email;
    if (!email) {
      return (
        <div>
          <h1>Account</h1>
          <p>Please log in to view your account.</p>
          <ul>
            <li><Link href="/account/login">Login</Link></li>
            <li><Link href="/account/register">Register</Link></li>
          </ul>
        </div>
      );
    }

    const account = await getAccountStatusByEmail(email);
    if (!account) {
      return (
        <div>
          <h1>Account</h1>
          <p>User not found.</p>
        </div>
      );
    }

    return (
      <div>
        <h1>Account</h1>
        <p><strong>Email:</strong> {account.user.email}</p>
        <p><strong>Role:</strong> {account.user.role}</p>
        <p><strong>Subscription status:</strong> {account.subscription.status}</p>
        <p><strong>Premium:</strong> {account.subscription.isPremium ? "Yes" : "No"}</p>
        {account.subscription.currentPeriodEnd && (
          <p>
            <strong>Current period end:</strong> {(account.subscription.currentPeriodEnd)}
          </p>
        )}
        <ul>
          <li><Link href="/favorites">Favorites</Link></li>
          <li><Link href="/shopping-list">Shopping List</Link></li>
          <li><form action="/api/billing/checkout" method="POST">
            <button type="submit">Start Checkout</button>
          </form></li>
          <li><form action="/api/billing/portal" method="POST">
            <button type="submit">Open Billing Portal</button>
          </form></li>
        </ul>
      </div>
    );
  } catch {
    return (
      <div>
        <h1>Account</h1>
        <p>Please log in to view your account.</p>
        <ul>
          <li><Link href="/account/login">Login</Link></li>
          <li><Link href="/account/register">Register</Link></li>
        </ul>
      </div>
    );
  }
}
