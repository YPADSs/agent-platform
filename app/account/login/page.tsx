"use client";

import { signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { withLocale } from '@/lib/locale-path';

export default function LoginPage() {
  const params = useParams<{ locale?: string }>();
  const locale = typeof params?.locale === "string" ? params.locale : undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1>Login</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await signIn("credentials", {
            email,
            password,
            callbackUrl: withLocale(locale, '/account'),
          });
        }}
      >
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  );
}
