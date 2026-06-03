import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { destroySession, getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const admin = await db.adminUser.findUnique({
    where: { id: session.adminId },
    select: {
      email: true,
      isActive: true,
      role: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!admin?.isActive) {
    await destroySession();
    redirect("/admin/login");
  }

  return (
    <AdminShell
      admin={{
        email: admin.email,
        roleName: admin.role.name,
        roleSlug: admin.role.slug,
      }}
    >
      {children}
    </AdminShell>
  );
}
