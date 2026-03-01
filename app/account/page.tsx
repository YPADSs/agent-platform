import Link from "next/link";

export default function AccountPage() {
  return (
    <div>
      <h1>Account</h1>
      <ul>
        <li><Link href="/account/login">Login</Link></li>
        <li><Link href="/account/register">Register</Link></li>
      </ul>
      <p>Session/profile UI will be added in S1-003.</p>
    </div>
  );
}
