"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

type Unit = "inch" | "cm";

type ProductInfoAccordionProps = {
  product?: Product;
};

const inchRows = [
  { size: "M", chest: 39, length: 27.5, sleeve: 8.5 },
  { size: "L", chest: 40.5, length: 28, sleeve: 8.75 },
  { size: "XL", chest: 43, length: 29, sleeve: 9 },
  { size: "2XL", chest: 45, length: 30, sleeve: 9.25 },
];

function toCentimeters(value: number) {
  return Number((value * 2.54).toFixed(1));
}

function formatMeasurement(value: number, unit: Unit) {
  if (unit === "inch") {
    return value.toString();
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function ProductInfoAccordion({ product: _product }: ProductInfoAccordionProps) {
  void _product;

  const [unit, setUnit] = useState<Unit>("inch");
  const rows =
    unit === "inch"
      ? inchRows
      : inchRows.map((row) => ({
          size: row.size,
          chest: toCentimeters(row.chest),
          length: toCentimeters(row.length),
          sleeve: toCentimeters(row.sleeve),
        }));

  return (
    <section className="bg-white py-6 text-black">
      <div className="space-y-6 text-sm leading-6">
        {/* Static for now; later this content should come from product admin data. */}
        <p className="text-zinc-800">
          StyleVerse Bangladesh men&apos;s premium quality products are smooth,
          comfortable, and designed for everyday fashion. Made with quality
          fabric and modern finishing, they are perfect for casual wear, smart
          outings, or regular use.
        </p>

        <div>
          <h2 className="text-sm font-extrabold text-black">
            Detailed Specification:
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-6 text-zinc-800">
            <li>Premium quality fabric</li>
            <li>Comfortable regular fit</li>
            <li>Soft and breathable material</li>
            <li>Long-lasting stitching and finishing</li>
            <li>Easy to style for casual and smart looks</li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-black">
            Size chart - In inches (Expected Deviation &lt; 3%)
          </h2>

          <div className="mt-4 flex border-b border-zinc-200">
            <UnitTab active={unit === "inch"} onClick={() => setUnit("inch")}>
              INCH
            </UnitTab>
            <UnitTab active={unit === "cm"} onClick={() => setUnit("cm")}>
              CM
            </UnitTab>
          </div>

          <div className="overflow-hidden">
            <table className="w-full table-fixed border-collapse text-left text-xs">
              <thead>
                <tr className="border-b-2 border-white bg-zinc-100 text-black">
                  <th className="w-[20%] px-2 py-2 font-extrabold">Size</th>
                  <th className="w-[34%] px-2 py-2 font-extrabold">
                    Chest (round)
                  </th>
                  <th className="w-[23%] px-2 py-2 font-extrabold">Length</th>
                  <th className="w-[23%] px-2 py-2 font-extrabold">Sleeve</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.size}
                    className="border-b-2 border-white bg-zinc-100 last:border-b-0"
                  >
                    <td className="px-2 py-2 font-medium text-zinc-800">
                      {row.size}
                    </td>
                    <td className="border-l-2 border-white px-2 py-2 text-zinc-800">
                      {formatMeasurement(row.chest, unit)}
                    </td>
                    <td className="border-l-2 border-white px-2 py-2 text-zinc-800">
                      {formatMeasurement(row.length, unit)}
                    </td>
                    <td className="border-l-2 border-white px-2 py-2 text-zinc-800">
                      {formatMeasurement(row.sleeve, unit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function UnitTab({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-11 min-w-16 border border-b-0 border-zinc-200 px-4 text-xs font-medium text-black transition-colors",
        active ? "bg-white" : "bg-zinc-50 hover:bg-white",
      )}
      onClick={onClick}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
