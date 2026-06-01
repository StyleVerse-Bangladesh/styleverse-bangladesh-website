"use client";

import { cn } from "@/lib/utils";
import type { ProductColor } from "@/types/product";

type ColorSelectorProps = {
  colors: ProductColor[];
  value?: string;
  onChange?: (color: string) => void;
};

export function ColorSelector({ colors, value, onChange }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.name}
          type="button"
          aria-label={color.name}
          aria-pressed={value === color.name}
          onClick={() => onChange?.(color.name)}
          className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              "h-7 w-7 rounded-full border ring-offset-background transition",
              value === color.name && "ring-2 ring-ring ring-offset-2",
            )}
            style={{ backgroundColor: color.value }}
          />
        </button>
      ))}
    </div>
  );
}
