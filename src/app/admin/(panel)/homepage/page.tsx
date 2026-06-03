import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const metadata = {
  title: "Admin Homepage CMS",
};

export default function AdminHomepagePage() {
  return (
    <AdminPlaceholderPage
      title="Homepage CMS"
      description="Homepage content management will live here, including hero banners, featured sections, merchandising slots, and publish scheduling."
    />
  );
}
