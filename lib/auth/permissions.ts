type PermissionLike = {
  slug: string;
};

type RoleLike = {
  slug: string;
};

type AdminAuthorizationContext = {
  role?: RoleLike | null;
  permissions?: PermissionLike[] | null;
};

export function hasPermission(
  context: AdminAuthorizationContext,
  permissionSlug: string,
) {
  return Boolean(
    context.permissions?.some((permission) => permission.slug === permissionSlug),
  );
}

export function hasAnyPermission(
  context: AdminAuthorizationContext,
  permissionSlugs: string[],
) {
  return permissionSlugs.some((permissionSlug) =>
    hasPermission(context, permissionSlug),
  );
}

export function hasRole(
  context: AdminAuthorizationContext,
  roleSlug: string,
) {
  return context.role?.slug === roleSlug;
}
