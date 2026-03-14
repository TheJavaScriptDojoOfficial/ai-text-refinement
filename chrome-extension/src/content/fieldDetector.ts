import type {
  EditableFieldInfo,
  OnActiveFieldChange,
  OnActiveFieldValueChange,
  SupportedEditableElement
} from "../shared/types";
import { isEligibleEditableElement, isInsideExtensionUi } from "./siteGuards";
import { buildEditableFieldInfo } from "./fieldValueAdapter";

const FOCUSOUT_CLEAR_DELAY_MS = 50;
/** When relatedTarget is null, check activeElement after this delay (focus may have moved to extension UI). */
const FOCUSOUT_ACTIVE_ELEMENT_CHECK_MS = 20;

export interface EditableFieldDetectorCallbacks {
  onActiveFieldChange?: OnActiveFieldChange;
  onActiveFieldValueChange?: OnActiveFieldValueChange;
}

export class EditableFieldDetector {
  private activeFieldInfo: EditableFieldInfo | null = null;
  private focusoutClearTimer: ReturnType<typeof setTimeout> | null = null;
  private started = false;
  private readonly callbacks: EditableFieldDetectorCallbacks;
  private readonly boundFocusIn: (e: FocusEvent) => void;
  private readonly boundFocusOut: (e: FocusEvent) => void;
  private readonly boundInput: (e: Event) => void;

  constructor(callbacks: EditableFieldDetectorCallbacks = {}) {
    this.callbacks = callbacks;
    this.boundFocusIn = this.handleFocusIn.bind(this);
    this.boundFocusOut = this.handleFocusOut.bind(this);
    this.boundInput = this.handleInput.bind(this);
  }

  start(): void {
    if (this.started) return;
    this.started = true;
    document.addEventListener("focusin", this.boundFocusIn, true);
    document.addEventListener("focusout", this.boundFocusOut, true);
    document.addEventListener("input", this.boundInput, true);
  }

  stop(): void {
    if (!this.started) return;
    this.started = false;
    this.clearFocusOutTimer();
    document.removeEventListener("focusin", this.boundFocusIn, true);
    document.removeEventListener("focusout", this.boundFocusOut, true);
    document.removeEventListener("input", this.boundInput, true);
    this.setActiveField(null);
  }

  getActiveField(): EditableFieldInfo | null {
    return this.activeFieldInfo;
  }

  private clearFocusOutTimer(): void {
    if (this.focusoutClearTimer !== null) {
      clearTimeout(this.focusoutClearTimer);
      this.focusoutClearTimer = null;
    }
  }

  private setActiveField(info: EditableFieldInfo | null): void {
    if (this.activeFieldInfo === info) return;
    const prev = this.activeFieldInfo;
    this.activeFieldInfo = info;
    if (prev !== info) {
      this.callbacks.onActiveFieldChange?.(info);
    }
  }

  private updateActiveFieldValue(): void {
    if (!this.activeFieldInfo) return;
    const updated = buildEditableFieldInfo(this.activeFieldInfo.element);
    this.activeFieldInfo = updated;
    this.callbacks.onActiveFieldValueChange?.(updated);
  }

  private handleFocusIn(e: FocusEvent): void {
    this.clearFocusOutTimer();
    // When focus moves into an element inside Shadow DOM, e.target is retargeted to the host.
    // Use document.activeElement as fallback so we still detect the actual input.
    let candidate: SupportedEditableElement | null = null;
    if (e.target && isEligibleEditableElement(e.target)) {
      candidate = e.target;
    } else if (
      document.activeElement &&
      isEligibleEditableElement(document.activeElement)
    ) {
      candidate = document.activeElement;
    }
    if (!candidate) {
      this.setActiveField(null);
      return;
    }
    const info = buildEditableFieldInfo(candidate);
    this.setActiveField(info);
  }

  private handleFocusOut(e: FocusEvent): void {
    const relatedTarget = e.relatedTarget;
    if (relatedTarget && isEligibleEditableElement(relatedTarget)) {
      this.clearFocusOutTimer();
      return;
    }
    if (
      relatedTarget &&
      relatedTarget instanceof Element &&
      isInsideExtensionUi(relatedTarget)
    ) {
      this.clearFocusOutTimer();
      return;
    }
    if (relatedTarget === null || relatedTarget === undefined) {
      this.clearFocusOutTimer();
      this.focusoutClearTimer = setTimeout(() => {
        this.focusoutClearTimer = null;
        const activeEl = document.activeElement;
        if (
          activeEl &&
          activeEl instanceof Element &&
          isInsideExtensionUi(activeEl)
        ) {
          return;
        }
        this.setActiveField(null);
      }, FOCUSOUT_ACTIVE_ELEMENT_CHECK_MS);
      return;
    }
    this.clearFocusOutTimer();
    this.focusoutClearTimer = setTimeout(() => {
      this.focusoutClearTimer = null;
      this.setActiveField(null);
    }, FOCUSOUT_CLEAR_DELAY_MS);
  }

  private handleInput(e: Event): void {
    if (!this.activeFieldInfo) return;
    const target = e.target;
    const activeEl = this.activeFieldInfo.element;
    // When input is from inside Shadow DOM, e.target may be retargeted to the host.
    const isFromActiveField =
      target === activeEl ||
      document.activeElement === activeEl;
    if (!isFromActiveField) return;
    this.updateActiveFieldValue();
  }
}
