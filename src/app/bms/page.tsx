import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { logoutAdminAction } from "@/app/bms/actions";
import { destroySession, getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "BMS Dashboard",
};

export default async function BmsDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/bms/login");
  }

  const admin = await db.adminUser.findUnique({
    where: { id: session.adminId },
    include: { role: true },
  });

  if (!admin?.isActive) {
    await destroySession();
    redirect("/bms/login");
  }

  return (
    <section className="fixed inset-0 z-50 overflow-y-auto bg-[#f6f4f0] text-zinc-950">
      <div className="min-h-full px-4 py-5 sm:px-6 lg:px-8">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 rounded-lg border border-black/10 bg-white px-4 py-3 shadow-sm shadow-black/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              StyleVerse Bangladesh
            </p>
            <h1 className="mt-1 text-xl font-black tracking-normal text-zinc-950">
              Admin Control Center
            </h1>
          </div>
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-950 shadow-sm shadow-black/5 transition hover:border-zinc-950"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </form>
        </header>

        <main className="mx-auto mt-5 grid w-full max-w-5xl gap-4 sm:mt-6">
          <section className="rounded-lg border border-black/10 bg-white p-5 shadow-xl shadow-black/5 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-500">
                  Logged in admin email
                </p>
                <p className="mt-1 break-words text-lg font-black text-zinc-950">
                  {admin.email}
                </p>
              </div>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Role
                </dt>
                <dd className="mt-2 text-base font-black text-zinc-950">
                  {admin.role.slug}
                </dd>
              </div>
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Status
                </dt>
                <dd className="mt-2 text-base font-black text-zinc-950">
                  Active
                </dd>
              </div>
            </dl>
          </section>
        </main>
      </div>
    </section>
  );
}
