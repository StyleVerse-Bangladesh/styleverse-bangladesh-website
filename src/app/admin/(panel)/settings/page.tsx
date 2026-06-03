import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const metadata = {
  title: "Admin Store Settings",
};

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholderPage
      title="Store Settings"
      description="Store settings will live here, including operational preferences, storefront configuration, and admin account defaults."
    />
  );
}
