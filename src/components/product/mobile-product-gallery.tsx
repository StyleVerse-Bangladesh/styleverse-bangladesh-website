"use client";

import { useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import {
  defaultImagePlaceholders,
  getImageUrl,
} from "@/lib/constants/assets";
import { cn } from "@/lib/utils";

type MobileProductGalleryProps = {
  images: string[];
  productName: string;
};

const swipeThreshold = 36;
const dragClickThreshold = 4;

export function MobileProductGallery({
  images,
  productName,
}: MobileProductGalleryProps) {
  const galleryImages = images.length ? images : [defaultImagePlaceholders.product];
  const slideWidthPercent = 100 / galleryImages.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const pointerStateRef = useRef({
    isDragging: false,
    startX: 0,
    moved: false,
  });

  function goToImage(index: number) {
    setActiveIndex(Math.min(Math.max(index, 0), galleryImages.length - 1));
    setDragOffset(0);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (galleryImages.length <= 1) {
      return;
    }

    pointerStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      moved: false,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointerStateRef.current.isDragging) {
      return;
    }

    const distance = event.clientX - pointerStateRef.current.startX;

    if (Math.abs(distance) > dragClickThreshold) {
      pointerStateRef.current.moved = true;
      event.preventDefault();
    }

    setDragOffset(distance);
  }

  function finishSwipe(clientX: number) {
    if (!pointerStateRef.current.isDragging) {
      return;
    }

    const distance = clientX - pointerStateRef.current.startX;
    pointerStateRef.current.isDragging = false;
    setDragOffset(0);

    if (Math.abs(distance) < swipeThreshold) {
      return;
    }

    if (distance < 0) {
      goToImage(activeIndex + 1);
      return;
    }

    goToImage(activeIndex - 1);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    finishSwipe(event.clientX);
  }

  function cancelSwipe(event?: PointerEvent<HTMLDivElement>) {
    if (event?.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    pointerStateRef.current.isDragging = false;
    setDragOffset(0);
  }

  return (
    <div>
      <div
        className="relative aspect-square touch-pan-y select-none overflow-hidden bg-white"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={cancelSwipe}
        aria-roledescription="carousel"
        aria-label={`${productName} image gallery`}
      >
        <div
          className={cn(
            "flex h-full will-change-transform",
            pointerStateRef.current.isDragging
              ? "transition-none"
              : "transition-transform duration-300 ease-out",
          )}
          style={{
            width: `${galleryImages.length * 100}%`,
            transform: `translate3d(calc(${
              -activeIndex * slideWidthPercent
            }% + ${dragOffset}px), 0, 0)`,
          }}
        >
          {galleryImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative aspect-square h-full w-full shrink-0 bg-white"
              style={{ width: `${slideWidthPercent}%` }}
            >
              <Image
                src={getImageUrl(image, defaultImagePlaceholders.product)}
                alt={`${productName} view ${index + 1}`}
                fill
                priority={index === 0}
                className="object-contain"
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-black shadow-sm backdrop-blur-md">
          {activeIndex + 1} / {galleryImages.length}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {galleryImages.map((image, index) => {
          const active = activeIndex === index;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              className={cn(
                "relative aspect-square h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white transition",
                active
                  ? "border-black opacity-100 shadow-sm"
                  : "border-black/10 opacity-70 hover:opacity-100",
              )}
              onClick={() => goToImage(index)}
              aria-label={`Show ${productName} image ${index + 1}`}
              aria-current={active ? "true" : undefined}
            >
              <Image
                src={getImageUrl(image, defaultImagePlaceholders.product)}
                alt=""
                fill
                className="object-contain"
                sizes="56px"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
