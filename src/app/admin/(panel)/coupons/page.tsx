import {
  CouponAdminPage,
  type CouponAdminItem,
} from "@/app/admin/(panel)/coupons/coupon-admin";
import { db } from "@/lib/db";

export const metadata = {
  title: "Admin Coupons",
};

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: [{ createdAt: "desc" }],
    select: {
      _count: {
        select: {
          orders: true,
          redemptions: true,
        },
      },
      code: true,
      createdAt: true,
      id: true,
      isActive: true,
      maxUses: true,
      maxUsesPerCustomer: true,
      minimumOrder: true,
      type: true,
      usedCount: true,
      validUntil: true,
      value: true,
    },
  });
  const items = coupons.map<CouponAdminItem>((coupon) => {
    const currentUsageCount = coupon.usedCount;
    const totalRedemptions = coupon._count.redemptions;
    const remainingUses =
      coupon.maxUses === null
        ? null
        : Math.max(coupon.maxUses - currentUsageCount, 0);

    return {
      code: coupon.code,
      createdAt: formatDate(coupon.createdAt),
      currentUsageCount,
      deletable:
        currentUsageCount === 0 &&
        coupon._count.orders === 0 &&
        totalRedemptions === 0,
      id: coupon.id,
      isActive: coupon.isActive,
      maxUses: coupon.maxUses,
      maxUsesPerCustomer: coupon.maxUsesPerCustomer,
      minimumOrder:
        coupon.minimumOrder === null ? null : Number(coupon.minimumOrder),
      remainingUses,
      totalRedemptions,
      type: coupon.type,
      validUntil: coupon.validUntil ? formatDate(coupon.validUntil) : null,
      validUntilInput: coupon.validUntil
        ? formatDateInput(coupon.validUntil)
        : "",
      value: Number(coupon.value),
    };
  });

  return <CouponAdminPage coupons={items} />;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDateInput(value: Date) {
  return value.toISOString().slice(0, 10);
}
