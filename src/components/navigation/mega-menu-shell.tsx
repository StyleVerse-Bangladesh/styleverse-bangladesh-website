import Link from "next/link";
import type { MouseEventHandler } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { siteContainerClassName } from "@/lib/constants/layout";
import { findNavigationItemByMenuKey } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/navigation";

type MegaMenuShellProps = {
  activeMenuKey: string | null;
  navigation?: NavItem[];
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
};

export function MegaMenuShell({
  activeMenuKey,
  navigation,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuShellProps) {
  const activeItem = activeMenuKey
    ? findNavigationItemByMenuKey(activeMenuKey, navigation)
    : null;

  return (
    <AnimatePresence>
      {activeMenuKey ? (
        <motion.div
          className="hidden border-t bg-background shadow-sm md:block"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div
            className={cn(
              siteContainerClassName,
              "grid grid-cols-4 gap-8 py-8",
            )}
          >
            {activeItem?.children?.length ? (
              activeItem.children.map((category) => (
                <div key={category.href} className="text-sm">
                  <Link href={category.href} className="font-semibold hover:underline">
                    {category.label}
                  </Link>
                  {category.children?.length ? (
                    <div className="mt-3 grid gap-2 text-muted-foreground">
                      {category.children.map((child) => (
                        <Link key={child.href} href={child.href} className="hover:text-foreground">
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <>
                <div className="text-sm text-muted-foreground">Categories</div>
                <div className="text-sm text-muted-foreground">Featured edits</div>
                <div className="text-sm text-muted-foreground">Promotional module</div>
              </>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
