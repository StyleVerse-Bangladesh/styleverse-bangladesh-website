"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { HomeProductCard } from "@/components/home/home-product-card";
import { HomeSectionHeading } from "@/components/home/home-section-heading";
import { getProductBySlug } from "@/data/catalog";
import { assets } from "@/lib/constants/assets";
import { siteContainerClassName } from "@/lib/constants/layout";

const newArrivalProducts = [
  {
    wishlistId: "svb-001",
    name: "Half Sleeve Printed Casual Shirt For Men",
    image: assets.productImage("half-sleeve-printed-casual-shirt-black.webp"),
    price: 990,
    compareAtPrice: 1490,
    href: "/products/structured-cotton-shirt",
  },
  {
    wishlistId: "svb-001",
    name: "Half Sleeve Printed Casual Shirt For Men",
    image: assets.productImage("half-sleeve-printed-casual-shirt-white.webp"),
    price: 990,
    compareAtPrice: 1490,
    href: "/products/structured-cotton-shirt",
  },
  {
    wishlistId: "svb-002",
    name: "Premium Knitted Polo Shirt For Men",
    image: assets.productImage("premium-knitted-polo-shirt-black.webp"),
    price: 1190,
    compareAtPrice: 1500,
    href: "/products/relaxed-linen-dress",
  },
  {
    wishlistId: "svb-004",
    name: "Premium Knitted Polo Shirt For Men",
    image: assets.productImage("premium-knitted-polo-shirt-cream.webp"),
    price: 1190,
    compareAtPrice: 1500,
    href: "/products/performance-knit-sneaker",
  },
  {
    wishlistId: "svb-003",
    name: "Premium Knit Casual Polo",
    image: assets.productImage("premium-knit-casual-polo-olive.webp"),
    price: 1190,
    compareAtPrice: 1500,
    href: "/products/kids-everyday-hoodie",
  },
  {
    wishlistId: "svb-001",
    name: "Relaxed Everyday Fashion Shirt",
    image: assets.productImage("relaxed-everyday-fashion-shirt-sand.webp"),
    price: 1290,
    compareAtPrice: 1690,
    href: "/products/structured-cotton-shirt",
  },
];

const carouselCopies = 3;
const startCopyIndex = 1;
const autoplayDelayMs = 3500;
const dragClickThreshold = 8;
const snapTransitionMs = 380;
const newArrivalImageSizes =
  "(max-width: 767px) calc(50vw - 1.375rem), (max-width: 1023px) calc(33vw - 2rem), (max-width: 1279px) calc(25vw - 2rem), calc(20vw - 2rem)";

type NewArrivalProduct = (typeof newArrivalProducts)[number];

type CarouselProduct = NewArrivalProduct & {
  cloneKey: string;
  originalIndex: number;
};

function getProductByHref(href: string) {
  const slug = href.split("/").filter(Boolean).at(-1);

  return slug ? getProductBySlug(slug) : undefined;
}

function getSlideStep(track: HTMLDivElement) {
  const firstSlide = track.firstElementChild;
  const slideWidth =
    firstSlide instanceof HTMLElement ? firstSlide.offsetWidth : track.clientWidth;
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;

  return slideWidth + gap;
}

function getLogicalSlideIndex(slideIndex: number, productCount: number) {
  return ((slideIndex % productCount) + productCount) % productCount;
}

function normalizeSlideIndex(slideIndex: number, productCount: number) {
  if (slideIndex >= productCount && slideIndex < productCount * 2) {
    return slideIndex;
  }

  return productCount + getLogicalSlideIndex(slideIndex, productCount);
}

function getRenderedTranslate(track: HTMLElement, fallbackTranslate: number) {
  const transform = window.getComputedStyle(track).transform;

  if (!transform || transform === "none") {
    return fallbackTranslate;
  }

  try {
    return new DOMMatrixReadOnly(transform).m41;
  } catch {
    const matrixValues = transform.match(/matrix.*\((.+)\)/)?.[1].split(",");
    const translateX = matrixValues?.[4] ? Number.parseFloat(matrixValues[4]) : NaN;

    return Number.isFinite(translateX) ? translateX : fallbackTranslate;
  }
}

export function NewArrivalsSection() {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pendingTranslateRef = useRef<number | null>(null);
  const currentSlideIndexRef = useRef(newArrivalProducts.length * startCopyIndex);
  const slideStepRef = useRef(0);
  const translateRef = useRef(0);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startTranslate: 0,
    dragOffset: 0,
    moved: false,
  });

  const carouselProducts = useMemo<CarouselProduct[]>(
    () =>
      Array.from({ length: carouselCopies }, (_, copyIndex) =>
        newArrivalProducts.map((product, productIndex) => ({
          ...product,
          cloneKey: `${copyIndex}-${productIndex}`,
          originalIndex: productIndex,
        })),
      ).flat(),
    [],
  );

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const carouselTrack = track;
    const productCount = newArrivalProducts.length;

    function setTrackTransition(enabled: boolean) {
      carouselTrack.style.transition = enabled
        ? `transform ${snapTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : "none";
    }

    function applyTranslate(translate: number) {
      translateRef.current = translate;
      carouselTrack.style.transform = `translate3d(${translate}px, 0, 0)`;
    }

    function moveToSlide(slideIndex: number, animated: boolean) {
      currentSlideIndexRef.current = slideIndex;
      setTrackTransition(animated);
      applyTranslate(-slideIndex * slideStepRef.current);
    }

    function refreshMeasurements() {
      slideStepRef.current = getSlideStep(carouselTrack);
      const middleCopyIndex =
        productCount +
        getLogicalSlideIndex(currentSlideIndexRef.current, productCount);

      moveToSlide(middleCopyIndex, false);
    }

    function normalizeAfterTransition(event?: TransitionEvent) {
      if (event && event.target !== carouselTrack) {
        return;
      }

      const normalizedSlideIndex = normalizeSlideIndex(
        currentSlideIndexRef.current,
        productCount,
      );

      if (normalizedSlideIndex !== currentSlideIndexRef.current) {
        moveToSlide(normalizedSlideIndex, false);
      }
    }

    const rafId = window.requestAnimationFrame(refreshMeasurements);
    const autoplayTimer = window.setInterval(() => {
      if (dragState.current.isDragging) {
        return;
      }

      const normalizedSlideIndex = normalizeSlideIndex(
        currentSlideIndexRef.current,
        productCount,
      );

      if (normalizedSlideIndex !== currentSlideIndexRef.current) {
        moveToSlide(normalizedSlideIndex, false);
      }

      moveToSlide(normalizedSlideIndex + 1, true);
    }, autoplayDelayMs);

    carouselTrack.addEventListener("transitionend", normalizeAfterTransition);
    window.addEventListener("resize", refreshMeasurements);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearInterval(autoplayTimer);
      carouselTrack.removeEventListener("transitionend", normalizeAfterTransition);
      window.removeEventListener("resize", refreshMeasurements);

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function setTrackTransition(enabled: boolean) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.style.transition = enabled
      ? `transform ${snapTransitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : "none";
  }

  function applyTranslate(translate: number) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    translateRef.current = translate;
    track.style.transform = `translate3d(${translate}px, 0, 0)`;
  }

  function scheduleTranslate(translate: number) {
    pendingTranslateRef.current = translate;

    if (animationFrameRef.current) {
      return;
    }

    animationFrameRef.current = window.requestAnimationFrame(() => {
      if (pendingTranslateRef.current !== null) {
        applyTranslate(pendingTranslateRef.current);
      }

      pendingTranslateRef.current = null;
      animationFrameRef.current = null;
    });
  }

  function cancelPendingTranslate() {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }

    pendingTranslateRef.current = null;
    animationFrameRef.current = null;
  }

  function moveToSlide(slideIndex: number, animated: boolean) {
    cancelPendingTranslate();
    currentSlideIndexRef.current = slideIndex;
    setTrackTransition(animated);
    applyTranslate(-slideIndex * slideStepRef.current);
  }

  function refreshSlideStep() {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    slideStepRef.current = getSlideStep(track);
  }

  function snapAfterDrag() {
    refreshSlideStep();

    if (!slideStepRef.current) {
      return;
    }

    const productCount = newArrivalProducts.length;
    const rawSlideDelta = -dragState.current.dragOffset / slideStepRef.current;
    const dragThreshold = Math.min(
      Math.max(slideStepRef.current * 0.18, 36),
      90,
    );
    const slideShift =
      Math.abs(dragState.current.dragOffset) > dragThreshold
        ? Math.sign(rawSlideDelta) * Math.max(1, Math.round(Math.abs(rawSlideDelta)))
        : 0;
    const maxSlideIndex = productCount * carouselCopies - 1;
    const targetSlideIndex = Math.min(
      Math.max(currentSlideIndexRef.current + slideShift, 0),
      maxSlideIndex,
    );

    moveToSlide(targetSlideIndex, true);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) {
      return;
    }

    refreshSlideStep();
    cancelPendingTranslate();
    const renderedTranslate = getRenderedTranslate(track, translateRef.current);

    setTrackTransition(false);
    applyTranslate(renderedTranslate);
    dragState.current = {
      isDragging: true,
      startX: event.clientX,
      startTranslate: renderedTranslate,
      dragOffset: 0,
      moved: false,
    };
    viewport.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current.isDragging) {
      return;
    }

    const distance = event.clientX - dragState.current.startX;
    dragState.current.dragOffset = distance;

    if (Math.abs(distance) > dragClickThreshold) {
      dragState.current.moved = true;
      event.preventDefault();
    }

    scheduleTranslate(dragState.current.startTranslate + distance);
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;

    if (!dragState.current.isDragging) {
      return;
    }

    dragState.current.isDragging = false;
    if (viewport?.hasPointerCapture?.(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId);
    }

    snapAfterDrag();

    if (dragState.current.moved) {
      window.setTimeout(() => {
        dragState.current.moved = false;
      }, 0);
    }
  }

  function handleProductClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (dragState.current.moved) {
      event.preventDefault();
      dragState.current.moved = false;
    }
  }

  return (
    <section className="bg-white pb-8 pt-0 sm:pb-12 sm:pt-2" aria-label="New arrivals">
      <div className={siteContainerClassName}>
        <div className="relative border-b border-black/10 pb-2.5 text-center sm:pb-5">
          <HomeSectionHeading>New Arrival Products</HomeSectionHeading>
          <span className="mx-auto mt-2 block h-px w-32 bg-black/35 sm:mt-4 sm:h-0.5 sm:w-56 sm:bg-black" />
          <Link
            href="/products"
            className="absolute right-0 top-2 hidden text-sm font-medium text-black transition-opacity hover:opacity-60 sm:block"
          >
            See All
          </Link>
        </div>

        <div
          ref={viewportRef}
          className="relative mt-3 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing sm:mt-6"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <div
            ref={trackRef}
            aria-roledescription="carousel"
            className="flex gap-3 pb-3 will-change-transform md:gap-5 lg:gap-6"
          >
            {carouselProducts.map((product) => (
              <HomeProductCard
                key={product.cloneKey}
                product={product}
                cartProduct={getProductByHref(product.href)}
                imageSizes={newArrivalImageSizes}
                draggable={false}
                onProductClick={handleProductClick}
                className="group relative w-[calc((100%_-_0.75rem)_/_2)] shrink-0 overflow-hidden rounded-md bg-white shadow-lg shadow-black/10 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-black/15 md:w-[calc((100%_-_2.5rem)_/_3)] lg:w-[calc((100%_-_4.5rem)_/_4)] xl:w-[calc((100%_-_6rem)_/_5)]"
              />
            ))}
          </div>
        </div>

        <div className="mt-3 text-center sm:hidden">
          <Link href="/products" className="text-sm font-medium text-black">
            See All
          </Link>
        </div>
      </div>
    </section>
  );
}
