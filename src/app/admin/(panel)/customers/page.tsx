import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const metadata = {
  title: "Admin Customers",
};

export default function AdminCustomersPage() {
  return (
    <AdminPlaceholderPage
      title="Customers"
      description="Customer support tools will live here, including customer lookup, order history review, and account status context."
    />
  );
}
