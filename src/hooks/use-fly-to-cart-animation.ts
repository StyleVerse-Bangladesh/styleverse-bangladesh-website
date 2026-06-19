"use client";

type FlyToCartOptions = {
  imageSrc: string;
  sourceElement: HTMLElement;
};

export type FlyToCartLaunchResult =
  | {
      started: true;
      animation: Animation;
    }
  | {
      started: false;
      reason:
        | "missing-target"
        | "invalid-source-rect"
        | "invalid-target-rect"
        | "unsupported-animation"
        | "animation-error";
    };

const cartTargetSelector = '[data-cart-animation-target="true"]';
const cartPulseTargetSelector = '[data-cart-animation-pulse-target="true"]';
const animationDuration = 1050;
const reducedAnimationDuration = 420;

function getCenter(rect: DOMRect) {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isVisibleElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);

  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth &&
    styles.display !== "none" &&
    styles.visibility !== "hidden" &&
    styles.opacity !== "0"
  );
}

function getVisibleCartTarget() {
  const targets = document.querySelectorAll<HTMLElement>(cartTargetSelector);

  return Array.from(targets).find(isVisibleElement);
}

function getSourceImage(sourceElement: HTMLElement) {
  if (
    sourceElement instanceof HTMLImageElement &&
    isVisibleElement(sourceElement)
  ) {
    return sourceElement;
  }

  const localImage = Array.from(
    sourceElement.querySelectorAll<HTMLImageElement>("img"),
  ).find(isVisibleElement);

  if (localImage) {
    return localImage;
  }

  return Array.from(
    sourceElement
      .closest("article")
      ?.querySelectorAll<HTMLImageElement>("img") ?? [],
  ).find(isVisibleElement);
}

function createFlyingElement(
  imageSrc: string,
  sourceImage: HTMLImageElement | undefined,
  size: number,
) {
  const flyingElement = document.createElement("div");
  flyingElement.setAttribute("aria-hidden", "true");

  Object.assign(flyingElement.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${size}px`,
    height: `${size}px`,
    overflow: "hidden",
    border: "2px solid rgba(255, 253, 249, 0.96)",
    borderRadius: "16px",
    background:
      "linear-gradient(145deg, rgba(39, 39, 42, 0.98), rgba(9, 9, 11, 0.98))",
    pointerEvents: "none",
    zIndex: "2147483647",
    boxShadow:
      "0 18px 44px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(185, 168, 143, 0.3)",
    transformOrigin: "center",
    willChange: "transform, opacity, filter",
    isolation: "isolate",
  });

  const image = document.createElement("img");
  image.src = sourceImage?.currentSrc || sourceImage?.src || imageSrc;
  image.alt = "";
  image.decoding = "async";

  Object.assign(image.style, {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: sourceImage
      ? window.getComputedStyle(sourceImage).objectFit || "cover"
      : "cover",
  });

  flyingElement.appendChild(image);

  return flyingElement;
}

function pulseCartTarget(target: Element, reducedMotion: boolean) {
  const pulseTarget =
    target.querySelector(cartPulseTargetSelector) ?? target;

  pulseTarget.animate(
    reducedMotion
      ? [
          { filter: "brightness(1)" },
          {
            filter:
              "brightness(1.16) drop-shadow(0 0 8px rgba(214, 199, 176, 0.55))",
          },
          { filter: "brightness(1)" },
        ]
      : [
          { transform: "scale(1)", filter: "brightness(1)" },
          {
            transform: "scale(1.07)",
            filter:
              "brightness(1.22) drop-shadow(0 0 10px rgba(214, 199, 176, 0.65))",
          },
          { transform: "scale(0.99)", filter: "brightness(1.04)" },
          { transform: "scale(1)", filter: "brightness(1)" },
        ],
    {
      duration: reducedMotion ? 220 : 360,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    },
  );
}

function launchFlyToCart({
  imageSrc,
  sourceElement,
}: FlyToCartOptions): FlyToCartLaunchResult {
  if (typeof window === "undefined") {
    return { started: false, reason: "unsupported-animation" };
  }

  const reducedMotion = prefersReducedMotion();
  const target = getVisibleCartTarget();

  if (!target) {
    return { started: false, reason: "missing-target" };
  }

  const sourceImage = getSourceImage(sourceElement);
  const sourceRect = (
    sourceImage && isVisibleElement(sourceImage)
      ? sourceImage
      : sourceElement
  ).getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  if (!sourceRect.width || !sourceRect.height) {
    return { started: false, reason: "invalid-source-rect" };
  }

  if (!targetRect.width || !targetRect.height) {
    return { started: false, reason: "invalid-target-rect" };
  }

  if (typeof Element.prototype.animate !== "function") {
    return { started: false, reason: "unsupported-animation" };
  }

  const sourceCenter = getCenter(sourceRect);
  const targetCenter = getCenter(targetRect);
  const size = Math.min(
    Math.max(Math.min(sourceRect.width, sourceRect.height) * 0.34, 58),
    88,
  );
  const startX = sourceCenter.x - size / 2;
  const startY = sourceCenter.y - size / 2;
  const endX = targetCenter.x - size / 2;
  const endY = targetCenter.y - size / 2;
  const midX = startX + (endX - startX) * 0.52;
  const verticalLift = Math.min(
    110,
    Math.max(52, Math.abs(endX - startX) * 0.12),
  );
  const midY = Math.min(startY, endY) - verticalLift;
  const distanceToTarget = Math.hypot(endX - startX, endY - startY);
  const reducedTravelProgress =
    distanceToTarget > 0 ? Math.min(28 / distanceToTarget, 1) : 0;
  const reducedEndX = startX + (endX - startX) * reducedTravelProgress;
  const reducedEndY =
    startY + (endY - startY) * reducedTravelProgress - 8;

  const flyingElement = createFlyingElement(imageSrc, sourceImage, size);
  flyingElement.style.transform = `translate3d(${startX}px, ${startY}px, 0) scale(1)`;
  document.body.appendChild(flyingElement);

  let animation: Animation;

  try {
    animation = flyingElement.animate(
      reducedMotion
        ? [
            {
              opacity: 0.94,
              transform: `translate3d(${startX}px, ${startY}px, 0) scale(0.96)`,
            },
            {
              offset: 0.18,
              opacity: 1,
              transform: `translate3d(${startX}px, ${startY - 4}px, 0) scale(1)`,
            },
            {
              offset: 0.78,
              opacity: 1,
              transform: `translate3d(${reducedEndX}px, ${reducedEndY}px, 0) scale(0.88)`,
            },
            {
              opacity: 0,
              transform: `translate3d(${reducedEndX}px, ${reducedEndY - 2}px, 0) scale(0.85)`,
            },
          ]
        : [
            {
              opacity: 0.72,
              transform: `translate3d(${startX}px, ${startY + 4}px, 0) scale(0.9) rotate(0deg)`,
              filter: "saturate(1)",
            },
            {
              offset: 0.12,
              opacity: 1,
              transform: `translate3d(${startX}px, ${startY}px, 0) scale(1) rotate(-1deg)`,
              filter: "saturate(1.05)",
            },
            {
              offset: 0.56,
              opacity: 0.96,
              transform: `translate3d(${midX}px, ${midY}px, 0) scale(0.68) rotate(-7deg)`,
              filter: "saturate(1.08)",
            },
            {
              offset: 0.88,
              opacity: 0.82,
              transform: `translate3d(${endX}px, ${endY - 10}px, 0) scale(0.28) rotate(4deg)`,
              filter: "saturate(1.02)",
            },
            {
              opacity: 0,
              transform: `translate3d(${endX}px, ${endY}px, 0) scale(0.1) rotate(6deg)`,
              filter: "saturate(1)",
            },
          ],
      {
        duration: reducedMotion
          ? reducedAnimationDuration
          : animationDuration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );
  } catch {
    flyingElement.remove();
    return { started: false, reason: "animation-error" };
  }

  try {
    animation.finished
      .then(() => pulseCartTarget(target, reducedMotion))
      .catch(() => undefined)
      .finally(() => flyingElement.remove());
  } catch {
    flyingElement.remove();
    animation.cancel();
    return { started: false, reason: "animation-error" };
  }

  return { started: true, animation };
}

export function useFlyToCartAnimation() {
  function flyToCart(options: FlyToCartOptions): FlyToCartLaunchResult {
    try {
      return launchFlyToCart(options);
    } catch {
      return { started: false, reason: "animation-error" };
    }
  }

  return { flyToCart };
}
