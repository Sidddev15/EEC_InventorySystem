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
        <main className="flex-1 px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-28 lg:pb-6">
          <div className="mx-auto flex max-w-full flex-col space-y-4 md:max-w-7xl md:space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
