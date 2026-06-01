import Image from "next/image";
import {
  defaultImagePlaceholders,
  getImageUrl,
  imageSizes,
} from "@/lib/constants/assets";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  className?: string;
  priorityFirstImage?: boolean;
};

export function ProductGallery({
  images,
  productName,
  className,
  priorityFirstImage = false,
}: ProductGalleryProps) {
  return (
    <div className={cn("grid gap-3", className)}>
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted"
        >
          <Image
            src={getImageUrl(image, defaultImagePlaceholders.product)}
            alt={`${productName} view ${index + 1}`}
            fill
            className="object-cover"
            sizes={imageSizes.productGallery}
            priority={priorityFirstImage && index === 0}
          />
        </div>
      ))}
    </div>
  );
}
