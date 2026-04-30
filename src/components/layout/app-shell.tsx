import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth";
import { AppSidebar } from "./app-sidebar";
import { AppTopbar } from "./app-topbar";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const user = await getCurrentUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar user={user} />
        <main className="flex-1 px-3 py-4 pb-24 sm:px-6 sm:py-5 lg:px-8 lg:pb-5">
          {children}
        </main>
      </div>
    </div>
  );
}
