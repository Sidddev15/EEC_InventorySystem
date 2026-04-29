"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const demoUsers = [
  "admin@eec.local / admin123",
  "factory@eec.local / factory123",
  "corporate@eec.local / corporate123",
];

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      setError("Invalid email or password.");
      return;
    }

    const data = (await response.json()) as { redirectTo: string };
    router.replace(data.redirectTo);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@eec.local"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
        />
      </div>

      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

      <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>

      <div className="rounded-lg border bg-muted/40 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Foundation users
        </p>
        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {demoUsers.map((user) => (
            <p key={user}>{user}</p>
          ))}
        </div>
      </div>
    </form>
  );
}
