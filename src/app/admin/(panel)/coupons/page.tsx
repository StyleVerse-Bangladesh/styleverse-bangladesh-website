import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export const metadata = {
  title: "Admin Coupons",
};

export default function AdminCouponsPage() {
  return (
    <AdminPlaceholderPage
      title="Coupons"
      description="Coupon and promotion controls will live here, including discount rules, usage limits, campaign timing, and eligibility."
    />
  );
}
