import type { ExtensionSettings, SupportedEditableElement } from "../shared/types";
import { EXTENSION_UI_ROOT_ATTR } from "../shared/constants";
import {
  isHTMLInputElement,
  isHTMLTextAreaElement,
  isSupportedInputType,
  isDisabledElement,
  isReadOnlyElement,
  isVisibleElement,
  isLargeEnoughElement
} from "../shared/validators";

/** Selector for the extension's own UI root (future popup/overlay). */
const EXTENSION_UI_ROOT_SELECTOR = `[${EXTENSION_UI_ROOT_ATTR}="true"]`;

/** Returns true if target is inside a node marked as our extension UI. */
export function isInsideExtensionUi(target: Element): boolean {
  return target.closest(EXTENSION_UI_ROOT_SELECTOR) !== null;
}

/** Returns true for inputs we must never touch (password, etc.). */
export function isSensitiveInput(target: Element): boolean {
  if (!isHTMLInputElement(target)) return false;
  const type = (target.type ?? "text").toLowerCase();
  const sensitive = [
    "password",
    "checkbox",
    "radio",
    "hidden",
    "file",
    "submit",
    "button",
    "image",
    "reset",
    "color",
    "date",
    "datetime-local",
    "month",
    "number",
    "range",
    "time",
    "week"
  ];
  return sensitive.includes(type);
}

/**
 * Type guard: true if target is a supported editable element and eligible
 * (not inside our UI, not sensitive, not disabled/readonly, visible, large enough).
 */
export function isEligibleEditableElement(
  target: EventTarget | null
): target is SupportedEditableElement {
  if (!target || !(target instanceof Element)) return false;
  if (isInsideExtensionUi(target)) return false;
  if (isSensitiveInput(target)) return false;

  if (isHTMLTextAreaElement(target)) {
    return (
      !isDisabledElement(target) &&
      !isReadOnlyElement(target) &&
      isVisibleElement(target) &&
      isLargeEnoughElement(target)
    );
  }

  if (isHTMLInputElement(target) && isSupportedInputType(target)) {
    return (
      !isDisabledElement(target) &&
      !isReadOnlyElement(target) &&
      isVisibleElement(target) &&
      isLargeEnoughElement(target)
    );
  }

  return false;
}

/** For URL/domain checks if needed later. */
export function isSiteSupported(url: string): boolean {
  return Boolean(url);
}

/** Exact hostname match (trimmed, lowercased). Empty entries in blacklist are ignored. */
export function isDomainBlacklisted(
  hostname: string,
  blacklist: string[]
): boolean {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized) return false;
  for (const entry of blacklist) {
    const e = entry.trim().toLowerCase();
    if (e && e === normalized) return true;
  }
  return false;
}

/** Whether the extension should activate on the current site (settings.enabled and not blacklisted). */
export function shouldActivateOnCurrentSite(
  settings: ExtensionSettings,
  hostname: string
): boolean {
  if (!settings.enabled) return false;
  if (isDomainBlacklisted(hostname, settings.domainBlacklist)) return false;
  return true;
}
