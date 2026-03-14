import type { EditableFieldInfo } from "../shared/types";
import { MIN_TEXT_LENGTH_TO_BE_ACTIONABLE } from "../shared/constants";
import { POSITION_UPDATE_RAF } from "../shared/constants";
import { FLOATING_TRIGGER_SIZE } from "../shared/constants";
import { isVisibleElement } from "../shared/validators";
import type { EditableFieldDetector } from "./fieldDetector";
import { FloatingTriggerRenderer } from "./domRenderer";
import {
  getBestFloatingTriggerPosition,
  clampPositionToViewport
} from "./fieldPosition";

const LOG_PREFIX = "[AI Refiner]";

export class RefineTriggerController {
  private readonly renderer: FloatingTriggerRenderer;
  private detector: EditableFieldDetector | null = null;
  private rafId: number | null = null;
  private scrollResizeScheduled = false;
  private started = false;
  private readonly boundOnScroll: () => void;
  private readonly boundOnResize: () => void;
  private readonly boundOnTriggerClick: (e: MouseEvent) => void;

  constructor(renderer: FloatingTriggerRenderer) {
    this.renderer = renderer;
    this.boundOnScroll = this.schedulePositionUpdate.bind(this);
    this.boundOnResize = this.schedulePositionUpdate.bind(this);
    this.boundOnTriggerClick = this.handleTriggerClick.bind(this);
  }

  start(detector: EditableFieldDetector): void {
    if (this.started) return;
    this.started = true;
    this.detector = detector;

    window.addEventListener("scroll", this.boundOnScroll, true);
    window.addEventListener("resize", this.boundOnResize);

    const trigger = this.renderer.getTriggerElement();
    if (trigger) {
      trigger.addEventListener("click", this.boundOnTriggerClick, true);
    }

    this.updateTriggerState();
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.detector = null;

    window.removeEventListener("scroll", this.boundOnScroll, true);
    window.removeEventListener("resize", this.boundOnResize);

    const trigger = this.renderer.getTriggerElement();
    if (trigger) {
      trigger.removeEventListener("click", this.boundOnTriggerClick, true);
    }

    this.cancelScheduledUpdate();
    this.renderer.hideTrigger();
  }

  /** Called when the active field changes (focus in/out). */
  handleActiveFieldChange(_fieldInfo: EditableFieldInfo | null): void {
    this.updateTriggerState();
  }

  /** Called when the active field value changes (input). */
  handleActiveFieldValueChange(_fieldInfo: EditableFieldInfo | null): void {
    this.updateTriggerState();
  }

  private shouldShowTrigger(field: EditableFieldInfo | null): boolean {
    if (!field) return false;
    const trimmedLength = field.value.trim().length;
    if (trimmedLength < MIN_TEXT_LENGTH_TO_BE_ACTIONABLE) return false;
    if (field.isDisabled || field.isReadOnly || !field.isVisible) return false;
    if (!field.element.isConnected) return false;
    if (!isVisibleElement(field.element)) return false;
    return true;
  }

  private updateTriggerState(): void {
    const detector = this.detector;
    if (!detector) return;

    const field = detector.getActiveField();
    const show = this.shouldShowTrigger(field);

    if (!show || !field) {
      this.renderer.hideTrigger();
      return;
    }

    if (!field.element.isConnected || !isVisibleElement(field.element)) {
      this.renderer.hideTrigger();
      return;
    }

    const position = getBestFloatingTriggerPosition(field.element);
    const clamped = clampPositionToViewport(position, FLOATING_TRIGGER_SIZE);
    this.renderer.showTrigger(clamped);
  }

  private schedulePositionUpdate(): void {
    if (!POSITION_UPDATE_RAF) {
      this.updateTriggerState();
      return;
    }
    if (this.scrollResizeScheduled) return;
    this.scrollResizeScheduled = true;

    this.rafId = requestAnimationFrame(() => {
      this.scrollResizeScheduled = false;
      this.rafId = null;
      this.updateTriggerState();
    });
  }

  private cancelScheduledUpdate(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.scrollResizeScheduled = false;
  }

  private handleTriggerClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    console.log(`${LOG_PREFIX} Refine trigger clicked`);
  }
}
