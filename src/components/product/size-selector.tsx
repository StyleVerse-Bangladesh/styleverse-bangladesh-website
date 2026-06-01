"use client";

import { cn } from "@/lib/utils";

type SizeSelectorProps = {
  sizes: string[];
  value?: string;
  onChange?: (size: string) => void;
};

export function SizeSelector({ sizes, value, onChange }: SizeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          aria-pressed={value === size}
          onClick={() => onChange?.(size)}
          className={cn(
            "h-10 min-h-11 rounded-md border px-3 text-sm font-medium transition hover:bg-accent sm:min-h-0",
            value === size && "border-primary bg-primary text-primary-foreground",
          )}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
