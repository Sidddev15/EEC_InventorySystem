export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-xl rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          EEC Inventory System
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Foundation ready
        </h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Next.js, TypeScript, Tailwind, shadcn/ui, and Prisma are configured.
          Business modules will be added through the service layer in later
          phases.
        </p>
      </section>
    </main>
  );
}
