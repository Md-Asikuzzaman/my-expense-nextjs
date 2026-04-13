import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { LayoutDashboard, ReceiptText, LogOut } from "lucide-react";

import { logoutAction } from "@/app/actions";
import { requireAuth } from "@/lib/auth";
import { APP_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuickAddModal } from "@/components/dashboard/quick-add-modal";
import { Button } from "@/components/ui/button";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6">Loading workspace...</div>}>
      <ProtectedShell>{children}</ProtectedShell>
    </Suspense>
  );
}

async function ProtectedShell({ children }: { children: React.ReactNode }) {
  await connection();
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_35%)]">
      <div className="mx-auto grid max-w-7xl gap-4 p-3 sm:p-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-border/60 bg-card/70 p-4 shadow-sm backdrop-blur-xl">
          <h1 className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-xl font-bold text-transparent">
            {APP_NAME}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{session.email}</p>

          <nav className="mt-4 grid gap-2 sm:mt-6">
            <Link
              href="/dashboard"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-muted"
            >
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
            <Link
              href="/dashboard#transactions"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-muted"
            >
              <ReceiptText className="size-4" /> Transactions
            </Link>
          </nav>

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-6">
            <ThemeToggle />
            <form action={logoutAction}>
              <Button variant="outline" type="submit" className="min-h-10">
                <LogOut className="size-4" /> Logout
              </Button>
            </form>
          </div>
        </aside>

        <main className="space-y-4 min-w-0">{children}</main>
      </div>

      <div className="fixed right-6 bottom-6 z-40">
        <QuickAddModal />
      </div>
    </div>
  );
}
