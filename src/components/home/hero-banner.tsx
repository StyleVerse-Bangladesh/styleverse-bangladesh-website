"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import { motion, type PanInfo } from "framer-motion";
import { assets, imageSizes } from "@/lib/constants/assets";

type HeroSlide = {
  alt: string;
  category: string;
  height: number;
  href: string;
  id: string;
  image: string;
  width: number;
};

const heroSlides: HeroSlide[] = [
  {
    id: "hero-banner-1",
    image: assets.heroImage("hero-1.webp"),
    width: 1920,
    height: 690,
    alt: "StyleVerse Bangladesh hero banner 1",
    href: "#",
    category: "Hero Banner 1",
  },
  {
    id: "hero-banner-2",
    image: assets.heroImage("hero-2.webp"),
    width: 1920,
    height: 690,
    alt: "StyleVerse Bangladesh hero banner 2",
    href: "#",
    category: "Hero Banner 2",
  },
  {
    id: "hero-banner-3",
    image: assets.heroImage("hero-3.webp"),
    width: 1920,
    height: 690,
    alt: "StyleVerse Bangladesh hero banner 3",
    href: "#",
    category: "Hero Banner 3",
  },
  {
    id: "hero-banner-4",
    image: assets.heroImage("hero-4.webp"),
    width: 1920,
    height: 690,
    alt: "StyleVerse Bangladesh hero banner 4",
    href: "#",
    category: "Hero Banner 4",
  },
  {
    id: "hero-banner-5",
    image: assets.heroImage("hero-5.webp"),
    width: 1920,
    height: 690,
    alt: "StyleVerse Bangladesh hero banner 5",
    href: "#",
    category: "Hero Banner 5",
  },
];

const autoplayInterval = 5000;

type HeroBannerProps = {
  slides?: HeroSlide[];
};

export function HeroBanner({ slides = heroSlides }: HeroBannerProps) {
  const renderedSlides = slides.length ? slides : heroSlides;
  const loopedHeroSlides = [
    renderedSlides[renderedSlides.length - 1],
    ...renderedSlides,
    renderedSlides[0],
  ];
  const [activeSlide, setActiveSlide] = useState(0);
  const [visualSlide, setVisualSlide] = useState(1);
  const [bannerWidth, setBannerWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);
  const [isTrackTransitionEnabled, setIsTrackTransitionEnabled] = useState(true);
  const bannerRef = useRef<HTMLElement | null>(null);
  const didSwipe = useRef(false);
  const isDraggingRef = useRef(false);
  const snapFrameRef = useRef<number | null>(null);
  const minDragSlide = Math.max(0, visualSlide - 1);
  const maxDragSlide = Math.min(loopedHeroSlides.length - 1, visualSlide + 1);

  useEffect(() => {
    const banner = bannerRef.current;

    if (!banner) {
      return;
    }

    const observedBanner = banner;

    function updateBannerWidth() {
      setBannerWidth(observedBanner.getBoundingClientRect().width);
    }

    updateBannerWidth();

    const observer = new ResizeObserver(updateBannerWidth);
    observer.observe(observedBanner);

    return () => observer.disconnect();
  }, []);

  const resetAutoplayTimer = useCallback(() => {
    setAutoplayResetKey((current) => current + 1);
  }, []);

  const goToPreviousSlide = useCallback(() => {
    setIsTrackTransitionEnabled(true);
    setActiveSlide(
      (current) => (current - 1 + renderedSlides.length) % renderedSlides.length,
    );
    setVisualSlide((current) => current - 1);
  }, [renderedSlides.length]);

  const goToNextSlide = useCallback(() => {
    setIsTrackTransitionEnabled(true);
    setActiveSlide((current) => (current + 1) % renderedSlides.length);
    setVisualSlide((current) => current + 1);
  }, [renderedSlides.length]);

  useEffect(() => {
    if (isDragging) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!isDraggingRef.current) {
        goToNextSlide();
      }
    }, autoplayInterval);

    return () => window.clearTimeout(timer);
  }, [autoplayResetKey, goToNextSlide, isDragging]);

  useEffect(() => {
    return () => {
      if (snapFrameRef.current !== null) {
        window.cancelAnimationFrame(snapFrameRef.current);
      }
    };
  }, []);

  function snapToVisualSlide(slide: number) {
    setIsTrackTransitionEnabled(false);
    setVisualSlide(slide);

    if (snapFrameRef.current !== null) {
      window.cancelAnimationFrame(snapFrameRef.current);
    }

    snapFrameRef.current = window.requestAnimationFrame(() => {
      setIsTrackTransitionEnabled(true);
      snapFrameRef.current = null;
    });
  }

  function handleTrackAnimationComplete() {
    if (visualSlide === 0) {
      snapToVisualSlide(heroSlides.length);
      return;
    }

    if (visualSlide === renderedSlides.length + 1) {
      snapToVisualSlide(1);
    }
  }

  function handleDragStart() {
    didSwipe.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;
    const threshold = Math.max(80, bannerWidth * 0.12);

    isDraggingRef.current = false;
    setIsDragging(false);
    resetAutoplayTimer();

    if (info.offset.x < -threshold || swipePower < -8000) {
      didSwipe.current = true;
      goToNextSlide();
      return;
    }

    if (info.offset.x > threshold || swipePower > 8000) {
      didSwipe.current = true;
      goToPreviousSlide();
    }
  }

  function handleSlideClick(
    event: ReactMouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (didSwipe.current || href === "#") {
      event.preventDefault();
    }

    didSwipe.current = false;
  }

  function handleDotClick(index: number) {
    resetAutoplayTimer();
    setIsTrackTransitionEnabled(true);
    setActiveSlide(index);
    setVisualSlide(index + 1);
  }

  return (
    <section
      ref={bannerRef}
      className="relative w-full overflow-hidden bg-[#dedbd6]"
      style={{ aspectRatio: "1920 / 690" }}
      aria-label="Featured fashion banners"
    >
      <motion.div
        className="flex h-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        initial={{ x: "-100%" }}
        animate={{ x: bannerWidth > 0 ? -visualSlide * bannerWidth : "-100%" }}
        transition={
          isTrackTransitionEnabled
            ? { type: "spring", stiffness: 260, damping: 34 }
            : { duration: 0 }
        }
        drag="x"
        dragConstraints={{
          left: -maxDragSlide * bannerWidth,
          right: -minDragSlide * bannerWidth,
        }}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onAnimationComplete={handleTrackAnimationComplete}
      >
        {loopedHeroSlides.map((item, index) => (
          <motion.a
            key={`${item.id}-${index}`}
            href={item.href}
            draggable={false}
            className="relative h-full w-full min-w-full shrink-0"
            onDragStart={(event) => event.preventDefault()}
            onClick={(event) => handleSlideClick(event, item.href)}
            aria-label={`Open ${item.category} banner`}
          >
            <Image
              src={item.image}
              alt={item.alt}
              fill
              priority={index === 1}
              quality={95}
              className="object-contain object-center"
              draggable={false}
              sizes={imageSizes.hero}
            />
          </motion.a>
        ))}
      </motion.div>

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/25 px-2 py-1 shadow-sm backdrop-blur-sm sm:bottom-4">
          {renderedSlides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`relative h-1.5 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
                activeSlide === index ? "w-4 bg-black" : "w-1.5 bg-black/35"
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to banner ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
