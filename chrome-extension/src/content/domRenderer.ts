import type { FloatingTriggerPosition } from "../shared/types";
import {
  AI_REFINER_ROOT_ATTR,
  AI_REFINER_ROOT_VALUE,
  AI_REFINER_ROOT_SELECTOR,
  FLOATING_TRIGGER_ID
} from "../shared/constants";

const TRIGGER_CLASS = "ai-refiner-trigger";
const TRIGGER_HIDDEN_CLASS = "ai-refiner-trigger--hidden";

export class FloatingTriggerRenderer {
  private root: HTMLElement | null = null;
  private trigger: HTMLButtonElement | null = null;
  private destroyed = false;

  /** Ensures the extension root exists; creates it if not. Returns null if document.body is unavailable. */
  mountRoot(): HTMLElement | null {
    if (this.destroyed) return null;
    if (this.root?.isConnected) return this.root;

    const existing = document.body?.querySelector(AI_REFINER_ROOT_SELECTOR);
    if (existing && existing instanceof HTMLElement) {
      this.root = existing;
      this.ensureTrigger();
      return this.root;
    }

    if (!document.body) return null;

    const root = document.createElement("div");
    root.setAttribute(AI_REFINER_ROOT_ATTR, AI_REFINER_ROOT_VALUE);
    document.body.appendChild(root);
    this.root = root;
    this.ensureTrigger();
    return this.root;
  }

  private ensureTrigger(): void {
    if (!this.root || this.trigger?.isConnected) return;
    const existing = this.root.querySelector(`#${FLOATING_TRIGGER_ID}`);
    if (existing && existing instanceof HTMLButtonElement) {
      this.trigger = existing;
      return;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.id = FLOATING_TRIGGER_ID;
    button.className = `${TRIGGER_CLASS} ${TRIGGER_HIDDEN_CLASS}`;
    button.title = "Refine text";
    button.setAttribute("aria-label", "Refine text");
    button.textContent = "✨";
    button.style.position = "fixed";
    this.root.appendChild(button);
    this.trigger = button;
  }

  showTrigger(position: FloatingTriggerPosition): void {
    const root = this.mountRoot();
    if (!root || !this.trigger) return;
    this.trigger.style.top = `${position.top}px`;
    this.trigger.style.left = `${position.left}px`;
    this.trigger.classList.remove(TRIGGER_HIDDEN_CLASS);
  }

  hideTrigger(): void {
    if (this.trigger) {
      this.trigger.classList.add(TRIGGER_HIDDEN_CLASS);
    }
  }

  updateTriggerPosition(position: FloatingTriggerPosition): void {
    if (!this.trigger) return;
    this.trigger.style.top = `${position.top}px`;
    this.trigger.style.left = `${position.left}px`;
  }

  getTriggerElement(): HTMLButtonElement | null {
    return this.trigger ?? null;
  }

  destroy(): void {
    this.destroyed = true;
    this.hideTrigger();
    if (this.root?.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.trigger = null;
  }
}
