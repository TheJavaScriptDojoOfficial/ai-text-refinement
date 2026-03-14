import type { FloatingTriggerPosition, PopupPosition, ToneOption } from "../shared/types";
import {
  AI_REFINER_ROOT_ATTR,
  AI_REFINER_ROOT_VALUE,
  AI_REFINER_ROOT_SELECTOR,
  FLOATING_TRIGGER_ID,
  TONE_POPUP_ID,
  TONE_POPUP_CLASS,
  TONE_POPUP_HIDDEN_CLASS,
  TONE_POPUP_MIN_WIDTH,
  TONE_POPUP_MAX_WIDTH
} from "../shared/constants";

const TRIGGER_CLASS = "ai-refiner-trigger";
const TRIGGER_HIDDEN_CLASS = "ai-refiner-trigger--hidden";

const POPUP_HEADER_CLASS = "ai-refiner-popup__header";
const POPUP_TITLE_CLASS = "ai-refiner-popup__title";
const POPUP_LIST_CLASS = "ai-refiner-popup__list";
const POPUP_OPTION_CLASS = "ai-refiner-popup__option";
const POPUP_OPTION_LABEL_CLASS = "ai-refiner-popup__option-label";
const POPUP_OPTION_DESC_CLASS = "ai-refiner-popup__option-description";
const POPUP_OPTION_SELECTED_CLASS = "ai-refiner-popup__option--selected";
const POPUP_OPTION_LOADING_CLASS = "ai-refiner-popup__option--loading";
const POPUP_STATUS_CLASS = "ai-refiner-popup__status";
const POPUP_STATUS_ERROR_CLASS = "ai-refiner-popup__status--error";
const POPUP_STATUS_LOADING_CLASS = "ai-refiner-popup__status--loading";

export class FloatingTriggerRenderer {
  private root: HTMLElement | null = null;
  private trigger: HTMLButtonElement | null = null;
  private popup: HTMLElement | null = null;
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
    button.setAttribute("tabindex", "-1");
    button.textContent = "✨";
    button.style.position = "fixed";
    this.root.appendChild(button);
    this.trigger = button;
  }

  private ensurePopup(toneOptions: ToneOption[]): void {
    if (!this.root) return;
    const existing = this.root.querySelector(`#${TONE_POPUP_ID}`);
    if (existing && existing instanceof HTMLElement) {
      this.popup = existing;
      return;
    }

    const panel = document.createElement("div");
    panel.id = TONE_POPUP_ID;
    panel.className = `${TONE_POPUP_CLASS} ${TONE_POPUP_HIDDEN_CLASS}`;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-labelledby", `${TONE_POPUP_ID}-title`);
    panel.style.position = "fixed";
    panel.style.minWidth = `${TONE_POPUP_MIN_WIDTH}px`;
    panel.style.maxWidth = `${TONE_POPUP_MAX_WIDTH}px`;

    const header = document.createElement("div");
    header.className = POPUP_HEADER_CLASS;
    const title = document.createElement("h2");
    title.id = `${TONE_POPUP_ID}-title`;
    title.className = POPUP_TITLE_CLASS;
    title.textContent = "Refine tone";
    header.appendChild(title);
    panel.appendChild(header);

    const list = document.createElement("div");
    list.className = POPUP_LIST_CLASS;
    list.setAttribute("role", "listbox");

    for (const opt of toneOptions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = POPUP_OPTION_CLASS;
      button.setAttribute("data-tone-id", opt.id);
      button.setAttribute("role", "option");
      const label = document.createElement("span");
      label.className = POPUP_OPTION_LABEL_CLASS;
      label.textContent = opt.label;
      const desc = document.createElement("span");
      desc.className = POPUP_OPTION_DESC_CLASS;
      desc.textContent = opt.description;
      button.appendChild(label);
      button.appendChild(desc);
      list.appendChild(button);
    }
    panel.appendChild(list);

    const status = document.createElement("div");
    status.className = POPUP_STATUS_CLASS;
    status.setAttribute("aria-live", "polite");
    status.setAttribute("role", "status");
    panel.appendChild(status);

    this.root.appendChild(panel);
    this.popup = panel;
  }

  private getPopupStatusElement(): HTMLElement | null {
    if (!this.popup) return null;
    const el = this.popup.querySelector(`.${POPUP_STATUS_CLASS}`);
    return el instanceof HTMLElement ? el : null;
  }

  setPopupLoading(isLoading: boolean, activeToneId?: string | null): void {
    if (!this.popup) return;
    const options = this.popup.querySelectorAll(`.${POPUP_OPTION_CLASS}`);
    const statusEl = this.getPopupStatusElement();
    if (isLoading) {
      options.forEach((el) => {
        const btn = el as HTMLButtonElement;
        btn.disabled = true;
        const id = btn.getAttribute("data-tone-id");
        if (id === activeToneId) {
          btn.classList.add(POPUP_OPTION_LOADING_CLASS);
        } else {
          btn.classList.remove(POPUP_OPTION_LOADING_CLASS);
        }
      });
      if (statusEl) {
        statusEl.textContent = "Refining...";
        statusEl.className = `${POPUP_STATUS_CLASS} ${POPUP_STATUS_LOADING_CLASS}`;
        statusEl.classList.remove(POPUP_STATUS_ERROR_CLASS);
      }
    } else {
      options.forEach((el) => {
        const btn = el as HTMLButtonElement;
        btn.disabled = false;
        btn.classList.remove(POPUP_OPTION_LOADING_CLASS);
      });
      if (statusEl) {
        statusEl.textContent = "";
        statusEl.className = POPUP_STATUS_CLASS;
        statusEl.classList.remove(POPUP_STATUS_LOADING_CLASS, POPUP_STATUS_ERROR_CLASS);
      }
    }
  }

  setPopupError(message: string | null): void {
    const statusEl = this.getPopupStatusElement();
    if (!statusEl) return;
    if (message) {
      statusEl.textContent = message;
      statusEl.className = `${POPUP_STATUS_CLASS} ${POPUP_STATUS_ERROR_CLASS}`;
      statusEl.classList.remove(POPUP_STATUS_LOADING_CLASS);
    } else {
      statusEl.textContent = "";
      statusEl.className = POPUP_STATUS_CLASS;
      statusEl.classList.remove(POPUP_STATUS_ERROR_CLASS);
    }
  }

  clearPopupFeedback(): void {
    this.setPopupLoading(false);
    this.setPopupError(null);
  }

  showPopup(
    position: PopupPosition,
    toneOptions: ToneOption[],
    selectedToneId?: string | null
  ): void {
    const root = this.mountRoot();
    if (!root) return;
    this.ensurePopup(toneOptions);
    if (!this.popup) return;

    this.popup.style.top = `${position.top}px`;
    this.popup.style.left = `${position.left}px`;
    this.popup.classList.remove(TONE_POPUP_HIDDEN_CLASS);

    const options = this.popup.querySelectorAll(`.${POPUP_OPTION_CLASS}`);
    options.forEach((el) => {
      const btn = el as HTMLButtonElement;
      const id = btn.getAttribute("data-tone-id");
      btn.setAttribute("aria-selected", id === selectedToneId ? "true" : "false");
      if (id === selectedToneId) {
        btn.classList.add(POPUP_OPTION_SELECTED_CLASS);
      } else {
        btn.classList.remove(POPUP_OPTION_SELECTED_CLASS);
      }
    });
  }

  hidePopup(): void {
    if (this.popup) {
      this.popup.classList.add(TONE_POPUP_HIDDEN_CLASS);
    }
  }

  updatePopupPosition(position: PopupPosition): void {
    if (!this.popup) return;
    this.popup.style.top = `${position.top}px`;
    this.popup.style.left = `${position.left}px`;
  }

  setPopupSelectedTone(toneId: string | null): void {
    if (!this.popup) return;
    const options = this.popup.querySelectorAll(`.${POPUP_OPTION_CLASS}`);
    options.forEach((el) => {
      const btn = el as HTMLButtonElement;
      const id = btn.getAttribute("data-tone-id");
      const selected = id === toneId;
      btn.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) {
        btn.classList.add(POPUP_OPTION_SELECTED_CLASS);
      } else {
        btn.classList.remove(POPUP_OPTION_SELECTED_CLASS);
      }
    });
  }

  getPopupElement(): HTMLElement | null {
    return this.popup ?? null;
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
    this.hidePopup();
    if (this.root?.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.root = null;
    this.trigger = null;
    this.popup = null;
  }
}
