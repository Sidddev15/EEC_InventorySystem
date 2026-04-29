"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.replace("/login");
    router.refresh();
  }

  return (
    <Button aria-label="Sign out" size="icon-lg" variant="outline" onClick={logout}>
      <LogOut className="size-4" aria-hidden="true" />
    </Button>
  );
}
