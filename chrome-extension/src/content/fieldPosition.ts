import type {
  SupportedEditableElement,
  FloatingTriggerPosition
} from "../shared/types";
import {
  FLOATING_TRIGGER_SIZE,
  FLOATING_TRIGGER_OFFSET_X,
  FLOATING_TRIGGER_OFFSET_Y
} from "../shared/constants";

export interface FieldPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Viewport-relative rect (e.g. from getBoundingClientRect). */
export function getViewportRect(el: HTMLElement): DOMRect {
  return el.getBoundingClientRect();
}

/**
 * Compute viewport-relative position for the floating trigger.
 * Prefer top-right of the field; if not enough room above, use bottom-right.
 * Coordinates are for position: fixed (same as getBoundingClientRect).
 */
export function getBestFloatingTriggerPosition(
  el: SupportedEditableElement
): FloatingTriggerPosition {
  const rect = getViewportRect(el);
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const topRightY = rect.top - FLOATING_TRIGGER_OFFSET_Y - FLOATING_TRIGGER_SIZE;
  const bottomRightY = rect.bottom + FLOATING_TRIGGER_OFFSET_Y;

  const hasRoomAbove = topRightY >= 0;
  const hasRoomBelow = bottomRightY + FLOATING_TRIGGER_SIZE <= viewportHeight;

  const left = rect.right - FLOATING_TRIGGER_SIZE - FLOATING_TRIGGER_OFFSET_X;

  if (hasRoomAbove) {
    return {
      top: rect.top - FLOATING_TRIGGER_SIZE - FLOATING_TRIGGER_OFFSET_Y,
      left,
      placement: "top-right"
    };
  }
  if (hasRoomBelow) {
    return {
      top: rect.bottom + FLOATING_TRIGGER_OFFSET_Y,
      left,
      placement: "bottom-right"
    };
  }
  return {
    top: rect.top,
    left,
    placement: "top-right"
  };
}

/** Clamp position so the trigger stays within the viewport. */
export function clampPositionToViewport(
  position: FloatingTriggerPosition,
  triggerSize: number
): FloatingTriggerPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = position.left;
  let top = position.top;

  if (left < 0) left = 0;
  if (left + triggerSize > viewportWidth) left = viewportWidth - triggerSize;
  if (top < 0) top = 0;
  if (top + triggerSize > viewportHeight) top = viewportHeight - triggerSize;

  return {
    top,
    left,
    placement: position.placement
  };
}

export function getFieldPosition(element: HTMLElement): FieldPosition | null {
  const rect = element.getBoundingClientRect();

  if (!rect) return null;

  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
}
