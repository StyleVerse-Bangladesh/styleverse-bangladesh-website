import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";

export async function getCurrentAdmin() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return db.adminUser.findUnique({
    where: { id: session.adminId },
    select: {
      email: true,
      id: true,
      isActive: true,
      name: true,
      role: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      roleId: true,
    },
  });
}

export async function requireSuperAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin?.isActive) {
    redirect("/admin/login");
  }

  if (admin.role.slug !== "SUPER_ADMIN") {
    redirect("/admin");
  }

  return admin;
}
