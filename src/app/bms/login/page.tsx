import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/app/bms/login/login-form";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "BMS Login",
};

export default async function AdminLoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/bms");
  }

  return (
    <section className="fixed inset-0 z-50 overflow-y-auto bg-[#f5f2ee] text-zinc-950">
      <div className="grid min-h-full px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.55fr)] lg:p-0">
        <div className="hidden min-h-full bg-zinc-950 text-white lg:grid">
          <div className="flex h-full flex-col justify-between p-10">
            <Image
              src="/logo/StyleVerse-Logo-Long-White.png"
              alt="StyleVerse"
              width={240}
              height={80}
              priority
              className="h-auto w-52"
            />
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/55">
                StyleVerse Bangladesh
              </p>
              <h1 className="mt-5 max-w-lg text-5xl font-black leading-[0.95] tracking-normal">
                Admin Control Center
              </h1>
            </div>
            <div className="h-px w-full bg-white/15" />
          </div>
        </div>

        <div className="flex min-h-full items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-black/10 bg-white p-5 shadow-2xl shadow-black/10 sm:p-7">
            <div className="mb-7 lg:hidden">
              <Image
                src="/logo/StyleVerse-Logo-Long-Black.png"
                alt="StyleVerse"
                width={220}
                height={72}
                priority
                className="h-auto w-44"
              />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              StyleVerse Bangladesh
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-normal text-zinc-950">
              Admin Control Center
            </h1>

            <div className="mt-8">
              <AdminLoginForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
