"use client";

import type { MouseEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CategoryGroupCard,
  type CategoryGroup,
} from "@/components/home/category-group-card";

const carouselCopies = 3;
const startCopyIndex = 1;
const autoplayDelayMs = 5000;
const dragClickThreshold = 8;
const snapTransitionMs = 380;

type MobileCategoryGroupsCarouselProps = {
  groups: CategoryGroup[];
};

type CarouselGroup = CategoryGroup & {
  cloneKey: string;
  originalIndex: number;
};

function getSlideStep(track: HTMLDivElement) {
  const firstSlide = track.firstElementChild;
  const slideWidth =
    firstSlide instanceof HTMLElement ? firstSlide.offsetWidth : track.clientWidth;
  const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;

  return slideWidth + gap;
}

function getLogicalSlideIndex(slideIndex: number, groupCount: number) {
  return ((slideIndex % groupCount) + groupCount) % groupCount;
}

function normalizeSlideIndex(slideIndex: number, groupCount: number) {
  if (slideIndex >= groupCount && slideIndex < groupCount * 2) {
    return slideIndex;
  }

  return groupCount + getLogicalSlideIndex(slideIndex, groupCount);
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

export function MobileCategoryGroupsCarousel({
  groups,
}: MobileCategoryGroupsCarouselProps) {
  const groupCount = groups.length;
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const autoplayTimerRef = useRef<number | null>(null);
  const autoplayRestartTimerRef = useRef<number | null>(null);
  const scheduleAutoplayRef = useRef<() => void>(() => undefined);
  const pendingTranslateRef = useRef<number | null>(null);
  const currentSlideIndexRef = useRef(groupCount * startCopyIndex);
  const slideStepRef = useRef(0);
  const translateRef = useRef(0);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startTranslate: 0,
    dragOffset: 0,
    moved: false,
  });

  const carouselGroups = useMemo<CarouselGroup[]>(() => {
    if (groupCount <= 1) {
      return groups.map((group, groupIndex) => ({
        ...group,
        cloneKey: `0-${group.title}`,
        originalIndex: groupIndex,
      }));
    }

    return Array.from({ length: carouselCopies }, (_, copyIndex) =>
      groups.map((group, groupIndex) => ({
        ...group,
        cloneKey: `${copyIndex}-${group.title}`,
        originalIndex: groupIndex,
      })),
    ).flat();
  }, [groupCount, groups]);

  function clearAutoplayTimer() {
    if (autoplayTimerRef.current) {
      window.clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
  }

  function clearAutoplayRestartTimer() {
    if (autoplayRestartTimerRef.current) {
      window.clearTimeout(autoplayRestartTimerRef.current);
      autoplayRestartTimerRef.current = null;
    }
  }

  function clearAutoplayTimers() {
    clearAutoplayTimer();
    clearAutoplayRestartTimer();
  }

  function scheduleAutoplay() {
    clearAutoplayTimer();

    if (groupCount <= 1 || dragState.current.isDragging) {
      return;
    }

    autoplayTimerRef.current = window.setTimeout(() => {
      autoplayTimerRef.current = null;

      if (dragState.current.isDragging) {
        return;
      }

      const normalizedSlideIndex = normalizeSlideIndex(
        currentSlideIndexRef.current,
        groupCount,
      );

      if (normalizedSlideIndex !== currentSlideIndexRef.current) {
        moveToSlide(normalizedSlideIndex, false);
      }

      moveToSlide(normalizedSlideIndex + 1, true);
      scheduleAutoplayRef.current();
    }, autoplayDelayMs);
  }

  scheduleAutoplayRef.current = scheduleAutoplay;

  function restartAutoplayAfterInteraction() {
    clearAutoplayTimers();

    if (groupCount <= 1) {
      return;
    }

    autoplayRestartTimerRef.current = window.setTimeout(() => {
      autoplayRestartTimerRef.current = null;
      scheduleAutoplay();
    }, snapTransitionMs);
  }

  useEffect(() => {
    const track = trackRef.current;

    if (!track || groupCount <= 1) {
      return;
    }

    currentSlideIndexRef.current = groupCount * startCopyIndex;

    const carouselTrack = track;

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
      setActiveSlideIndex(getLogicalSlideIndex(slideIndex, groupCount));
      setTrackTransition(animated);
      applyTranslate(-slideIndex * slideStepRef.current);
    }

    function refreshMeasurements() {
      slideStepRef.current = getSlideStep(carouselTrack);
      const middleCopyIndex =
        groupCount + getLogicalSlideIndex(currentSlideIndexRef.current, groupCount);

      moveToSlide(middleCopyIndex, false);
    }

    function normalizeAfterTransition(event?: TransitionEvent) {
      if (event && event.target !== carouselTrack) {
        return;
      }

      const normalizedSlideIndex = normalizeSlideIndex(
        currentSlideIndexRef.current,
        groupCount,
      );

      if (normalizedSlideIndex !== currentSlideIndexRef.current) {
        moveToSlide(normalizedSlideIndex, false);
      }
    }

    const rafId = window.requestAnimationFrame(() => {
      refreshMeasurements();
      scheduleAutoplayRef.current();
    });

    carouselTrack.addEventListener("transitionend", normalizeAfterTransition);
    window.addEventListener("resize", refreshMeasurements);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (autoplayTimerRef.current) {
        window.clearTimeout(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }

      if (autoplayRestartTimerRef.current) {
        window.clearTimeout(autoplayRestartTimerRef.current);
        autoplayRestartTimerRef.current = null;
      }

      carouselTrack.removeEventListener("transitionend", normalizeAfterTransition);
      window.removeEventListener("resize", refreshMeasurements);

      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [groupCount]);

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
    setActiveSlideIndex(getLogicalSlideIndex(slideIndex, groupCount));
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

    if (!slideStepRef.current || groupCount <= 1) {
      return;
    }

    const rawSlideDelta = -dragState.current.dragOffset / slideStepRef.current;
    const dragThreshold = Math.min(
      Math.max(slideStepRef.current * 0.18, 36),
      90,
    );
    const slideShift =
      Math.abs(dragState.current.dragOffset) > dragThreshold
        ? Math.sign(rawSlideDelta) * Math.max(1, Math.round(Math.abs(rawSlideDelta)))
        : 0;
    const maxSlideIndex = groupCount * carouselCopies - 1;
    const targetSlideIndex = Math.min(
      Math.max(currentSlideIndexRef.current + slideShift, 0),
      maxSlideIndex,
    );

    moveToSlide(targetSlideIndex, true);
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || groupCount <= 1) {
      return;
    }

    clearAutoplayTimers();
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

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
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

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
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

    restartAutoplayAfterInteraction();
  }

  function handleCategoryLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (dragState.current.moved) {
      event.preventDefault();
      dragState.current.moved = false;
    }
  }

  function handleDotClick(index: number) {
    if (groupCount <= 1) {
      return;
    }

    refreshSlideStep();
    clearAutoplayTimers();
    const normalizedSlideIndex = normalizeSlideIndex(
      currentSlideIndexRef.current,
      groupCount,
    );

    if (normalizedSlideIndex !== currentSlideIndexRef.current) {
      moveToSlide(normalizedSlideIndex, false);
    }

    moveToSlide(groupCount + index, true);
    restartAutoplayAfterInteraction();
  }

  if (groupCount === 0) {
    return null;
  }

  return (
    <div>
      <div
        ref={viewportRef}
        className="relative cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <div
          ref={trackRef}
          aria-roledescription="carousel"
          className="flex items-stretch gap-4 pb-1 will-change-transform"
        >
          {carouselGroups.map((group) => (
            <div key={group.cloneKey} className="flex w-full shrink-0">
              <CategoryGroupCard
                group={group}
                animationDelayMs={group.originalIndex * 90}
                className="h-full w-full"
                itemDraggable={false}
                onItemClick={handleCategoryLinkClick}
              />
            </div>
          ))}
        </div>
      </div>

      {groupCount > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {groups.map((group, index) => (
            <button
              key={group.title}
              type="button"
              aria-label={`Show ${group.title}`}
              aria-pressed={activeSlideIndex === index}
              className="flex h-6 w-6 items-center justify-center rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black"
              onClick={() => handleDotClick(index)}
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                  activeSlideIndex === index
                    ? "w-5 bg-black"
                    : "w-1.5 bg-black/25"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
