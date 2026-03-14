import type { EditableFieldInfo } from "../shared/types";
import {
  MIN_TEXT_LENGTH_TO_BE_ACTIONABLE,
  POSITION_UPDATE_RAF,
  FLOATING_TRIGGER_SIZE,
  FLOATING_TRIGGER_ID,
  DEFAULT_TONE_OPTIONS,
  AI_REFINER_ROOT_SELECTOR,
  TONE_POPUP_MAX_WIDTH
} from "../shared/constants";
import { isVisibleElement } from "../shared/validators";
import type { EditableFieldDetector } from "./fieldDetector";
import { FloatingTriggerRenderer } from "./domRenderer";
import {
  getBestFloatingTriggerPosition,
  clampPositionToViewport,
  getPopupPositionFromTrigger,
  clampPopupToViewport
} from "./fieldPosition";
import { getSettings } from "../shared/storage";
import type { LocalRefinerApiClient } from "./backendClient";
import { buildRefinePayload } from "./backendClient";

const LOG_PREFIX = "[AI Refiner]";
/** Estimated popup height for viewport clamping before measure. */
const POPUP_ESTIMATED_HEIGHT = 320;

const TONE_OPTIONS: { id: string; label: string; description: string }[] =
  DEFAULT_TONE_OPTIONS.map((o) => ({
    id: o.id,
    label: o.label,
    description: o.description
  }));

export interface RefineSuccessResult {
  field: EditableFieldInfo;
  refinedText: string;
  toneId: string;
}

export interface RefineTriggerControllerConfig {
  apiClient: LocalRefinerApiClient;
  /** If false, trigger is never shown (default true). */
  autoShowTrigger?: boolean;
  /** Pre-selected tone when popup opens (e.g. from options). */
  defaultTone?: string | null;
  onRefineSuccess?: (result: RefineSuccessResult) => void;
}

export class RefineTriggerController {
  private readonly renderer: FloatingTriggerRenderer;
  private readonly apiClient: LocalRefinerApiClient;
  private readonly onRefineSuccess?: (result: RefineSuccessResult) => void;
  private readonly autoShowTrigger: boolean;
  private readonly defaultTone: string | null;
  private detector: EditableFieldDetector | null = null;
  private rafId: number | null = null;
  private scrollResizeScheduled = false;
  private started = false;
  private popupOpen = false;
  private selectedToneId: string | null = null;
  private extensionRoot: HTMLElement | null = null;
  private isLoading = false;
  private requestFieldRef: { element: EditableFieldInfo["element"] } | null =
    null;

  private readonly boundOnScroll: () => void;
  private readonly boundOnResize: () => void;
  private readonly boundOnTriggerClick: (e: MouseEvent) => void;
  private readonly boundOnDocumentPointer: (e: MouseEvent) => void;
  private readonly boundOnKeyDown: (e: KeyboardEvent) => void;
  private readonly boundOnRootClick: (e: MouseEvent) => void;
  private readonly boundOnRootMouseDown: (e: MouseEvent) => void;

  constructor(
    renderer: FloatingTriggerRenderer,
    config: RefineTriggerControllerConfig
  ) {
    this.renderer = renderer;
    this.apiClient = config.apiClient;
    this.onRefineSuccess = config.onRefineSuccess;
    this.autoShowTrigger = config.autoShowTrigger !== false;
    this.defaultTone = config.defaultTone ?? null;
    this.boundOnScroll = this.schedulePositionUpdate.bind(this);
    this.boundOnResize = this.schedulePositionUpdate.bind(this);
    this.boundOnTriggerClick = this.handleTriggerClick.bind(this);
    this.boundOnDocumentPointer = this.handleDocumentPointer.bind(this);
    this.boundOnKeyDown = this.handleKeyDown.bind(this);
    this.boundOnRootClick = this.handleRootClick.bind(this);
    this.boundOnRootMouseDown = this.handleRootMouseDown.bind(this);
  }

  start(detector: EditableFieldDetector): void {
    if (this.started) return;
    this.started = true;
    this.detector = detector;

    this.renderer.mountRoot();
    this.extensionRoot = document.querySelector(AI_REFINER_ROOT_SELECTOR);
    if (this.extensionRoot) {
      this.extensionRoot.addEventListener("click", this.boundOnRootClick, true);
      this.extensionRoot.addEventListener(
        "mousedown",
        this.boundOnRootMouseDown,
        true
      );
    }

    document.addEventListener("mousedown", this.boundOnDocumentPointer, true);
    document.addEventListener("keydown", this.boundOnKeyDown, true);

    window.addEventListener("scroll", this.boundOnScroll, true);
    window.addEventListener("resize", this.boundOnResize);

    this.updateTriggerState();
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.detector = null;

    if (this.extensionRoot) {
      this.extensionRoot.removeEventListener(
        "click",
        this.boundOnRootClick,
        true
      );
      this.extensionRoot.removeEventListener(
        "mousedown",
        this.boundOnRootMouseDown,
        true
      );
      this.extensionRoot = null;
    }

    document.removeEventListener(
      "mousedown",
      this.boundOnDocumentPointer,
      true
    );
    document.removeEventListener("keydown", this.boundOnKeyDown, true);

    window.removeEventListener("scroll", this.boundOnScroll, true);
    window.removeEventListener("resize", this.boundOnResize);

    this.cancelScheduledUpdate();
    this.closePopupIfOpen();
    this.renderer.hideTrigger();
  }

  /** Called when the active field changes (focus in/out). */
  handleActiveFieldChange(_fieldInfo: EditableFieldInfo | null): void {
    this.closePopupIfOpen();
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

    if (!this.autoShowTrigger) {
      this.closePopupIfOpen();
      this.renderer.hideTrigger();
      return;
    }

    const field = detector.getActiveField();
    const show = this.shouldShowTrigger(field);

    if (!show || !field) {
      this.closePopupIfOpen();
      this.renderer.hideTrigger();
      return;
    }

    if (!field.element.isConnected || !isVisibleElement(field.element)) {
      this.closePopupIfOpen();
      this.renderer.hideTrigger();
      return;
    }

    const position = getBestFloatingTriggerPosition(field.element);
    const clamped = clampPositionToViewport(position, FLOATING_TRIGGER_SIZE);
    this.renderer.showTrigger(clamped);
  }

  private openPopup(): void {
    const trigger = this.renderer.getTriggerElement();
    if (!trigger) return;

    const position = getPopupPositionFromTrigger(
      trigger,
      POPUP_ESTIMATED_HEIGHT
    );
    const clamped = clampPopupToViewport(
      position,
      TONE_POPUP_MAX_WIDTH,
      POPUP_ESTIMATED_HEIGHT
    );
    this.renderer.showPopup(
      clamped,
      TONE_OPTIONS,
      this.selectedToneId ?? this.defaultTone
    );
    this.renderer.setPopupError(null);
    this.popupOpen = true;
  }

  private closePopup(): void {
    if (!this.popupOpen) return;
    this.renderer.hidePopup();
    this.popupOpen = false;
  }

  private closePopupIfOpen(): void {
    if (this.popupOpen) this.closePopup();
  }

  private handleRootMouseDown(e: MouseEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const root =
      this.extensionRoot ?? document.querySelector(AI_REFINER_ROOT_SELECTOR);
    if (root && root.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  private handleTriggerClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    if (this.popupOpen) {
      this.closePopup();
    } else {
      this.openPopup();
    }
  }

  private handleDocumentPointer(e: MouseEvent): void {
    if (!this.popupOpen) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    const root =
      this.extensionRoot ?? document.querySelector(AI_REFINER_ROOT_SELECTOR);
    if (root && root.contains(target)) return;
    this.closePopup();
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key !== "Escape" || !this.popupOpen) return;
    this.closePopup();
  }

  private handleRootClick(e: MouseEvent): void {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const triggerEl = target.closest(`#${FLOATING_TRIGGER_ID}`);
    if (triggerEl) {
      e.preventDefault();
      e.stopPropagation();
      this.handleTriggerClick(e);
      return;
    }

    const option = target.closest(".ai-refiner-popup__option");
    if (!option || !(option instanceof HTMLButtonElement)) return;
    e.preventDefault();
    e.stopPropagation();
    const toneId = option.getAttribute("data-tone-id");
    if (toneId) this.handleToneOptionSelect(toneId);
  }

  private async handleToneOptionSelect(toneId: string): Promise<void> {
    if (this.isLoading) return;
    const detector = this.detector;
    if (!detector) return;
    const field = detector.getActiveField();
    if (!field || !this.shouldShowTrigger(field)) {
      this.renderer.setPopupError("No active field or field is empty.");
      return;
    }
    const text = field.value.trim();
    if (text.length < MIN_TEXT_LENGTH_TO_BE_ACTIONABLE) {
      this.renderer.setPopupError("Field has no text to refine.");
      return;
    }

    this.selectedToneId = toneId;
    this.renderer.setPopupSelectedTone(toneId);
    this.renderer.setPopupError(null);
    this.renderer.setPopupLoading(true, toneId);
    this.isLoading = true;
    this.requestFieldRef = { element: field.element };
    console.log(`${LOG_PREFIX} Starting refinement: ${toneId}`);

    try {
      const settings = await getSettings();
      const payload = buildRefinePayload(text, toneId, {
        preserve_entities: settings.preserveEntities,
        preserve_urls: settings.preserveUrls,
        preserve_ids: settings.preserveIds,
        length: settings.defaultLengthOption
      });
      const response = await this.apiClient.refineText(payload);
      const refinedText = response.refined_text;

      const currentField = this.detector?.getActiveField();
      if (
        !this.requestFieldRef ||
        currentField?.element !== this.requestFieldRef.element
      ) {
        console.warn(
          `${LOG_PREFIX} Active field changed during request; discarding result.`
        );
        return;
      }
      if (!currentField) {
        console.warn(`${LOG_PREFIX} No active field on success; discarding result.`);
        return;
      }
      console.log(`${LOG_PREFIX} Refinement succeeded`);
      this.onRefineSuccess?.({
        field: currentField,
        refinedText,
        toneId
      });
      this.closePopup();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Refinement failed. Please try again.";
      console.log(`${LOG_PREFIX} Refinement failed: ${message}`);
      this.renderer.setPopupError(message);
    } finally {
      this.requestFieldRef = null;
      this.isLoading = false;
      this.renderer.setPopupLoading(false);
    }
  }

  private schedulePositionUpdate(): void {
    if (!POSITION_UPDATE_RAF) {
      this.updateTriggerState();
      this.updatePopupPositionIfOpen();
      return;
    }
    if (this.scrollResizeScheduled) return;
    this.scrollResizeScheduled = true;

    this.rafId = requestAnimationFrame(() => {
      this.scrollResizeScheduled = false;
      this.rafId = null;
      this.updateTriggerState();
      this.updatePopupPositionIfOpen();
    });
  }

  private updatePopupPositionIfOpen(): void {
    if (!this.popupOpen) return;
    const trigger = this.renderer.getTriggerElement();
    if (!trigger) return;
    const position = getPopupPositionFromTrigger(
      trigger,
      POPUP_ESTIMATED_HEIGHT
    );
    const clamped = clampPopupToViewport(
      position,
      TONE_POPUP_MAX_WIDTH,
      POPUP_ESTIMATED_HEIGHT
    );
    this.renderer.updatePopupPosition(clamped);
  }

  private cancelScheduledUpdate(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.scrollResizeScheduled = false;
  }
}
