"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { loginRequest } from "@/lib/api";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();
  const { isReady, isAuthenticated, signIn } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isReady, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await loginRequest(username.trim(), password);
      signIn(result.token, result.username);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.kicker}>SimpleHome</span>
        <h1 className={`${styles.title} page-title`}>Sign in to Dashboard</h1>
        <p className={styles.subtitle}>Monitor sensors and control your IoT device in real time.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="username">
            Username
            <input
              id="username"
              className={styles.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
            />
          </label>

          <label className={styles.label} htmlFor="password">
            Password
            <input
              id="password"
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              autoComplete="current-password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button className={styles.button} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.hint}>API base URL: `NEXT_PUBLIC_API_URL`</p>
      </section>
    </main>
  );
}
