"use client";

type FlyToCartOptions = {
  imageSrc: string;
  sourceElement: HTMLElement;
};

const cartTargetSelector = '[data-cart-animation-target="true"]';
const animationDuration = 2600;

function getCenter(rect: DOMRect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDesktopViewport() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function pulseCartTarget(target: Element) {
  if (prefersReducedMotion()) {
    return;
  }

  target.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.18)" },
      { transform: "scale(0.96)" },
      { transform: "scale(1)" },
    ],
    {
      duration: 300,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
  );
}

export function useFlyToCartAnimation() {
  function flyToCart({ imageSrc, sourceElement }: FlyToCartOptions) {
    if (
      typeof window === "undefined" ||
      prefersReducedMotion() ||
      isDesktopViewport()
    ) {
      return;
    }

    const target = document.querySelector(cartTargetSelector);

    if (!target) {
      return;
    }

    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    if (!sourceRect.width || !sourceRect.height || !targetRect.width) {
      return;
    }

    const sourceCenter = getCenter(sourceRect);
    const targetCenter = getCenter(targetRect);
    const size = Math.min(Math.max(sourceRect.height * 1.25, 58), 82);
    const startX = sourceCenter.x - size / 2;
    const startY = sourceCenter.y - size / 2;
    const endX = targetCenter.x - size / 2;
    const endY = targetCenter.y - size / 2;
    const midX = startX + (endX - startX) * 0.48;
    const midY = Math.min(startY, endY) - 86;

    const image = document.createElement("img");
    image.src = imageSrc;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    Object.assign(image.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "18px",
      objectFit: "cover",
      pointerEvents: "none",
      zIndex: "60",
      boxShadow: "0 18px 38px rgba(0, 0, 0, 0.26)",
      transform: `translate3d(${startX}px, ${startY}px, 0) scale(1)`,
      transformOrigin: "center",
      willChange: "transform, opacity, filter",
    });

    document.body.appendChild(image);

    const animation = image.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${startX}px, ${startY + 8}px, 0) scale(0.72) rotate(0deg)`,
          filter: "saturate(1)",
        },
        {
          offset: 0.12,
          opacity: 1,
          transform: `translate3d(${startX}px, ${startY}px, 0) scale(1) rotate(-2deg)`,
          filter: "saturate(1.04)",
        },
        {
          offset: 0.58,
          opacity: 0.92,
          transform: `translate3d(${midX}px, ${midY}px, 0) scale(0.74) rotate(-9deg)`,
          filter: "saturate(1.08)",
        },
        {
          offset: 0.86,
          opacity: 0.78,
          transform: `translate3d(${endX}px, ${endY - 14}px, 0) scale(0.32) rotate(5deg)`,
          filter: "saturate(1.02)",
        },
        {
          opacity: 0,
          transform: `translate3d(${endX}px, ${endY}px, 0) scale(0.14) rotate(8deg)`,
          filter: "saturate(1)",
        },
      ],
      {
        duration: animationDuration,
        easing: "cubic-bezier(0.18, 0.88, 0.2, 1)",
        fill: "forwards",
      },
    );

    animation.finished
      .then(() => pulseCartTarget(target))
      .catch(() => undefined)
      .finally(() => image.remove());
  }

  return { flyToCart };
}
