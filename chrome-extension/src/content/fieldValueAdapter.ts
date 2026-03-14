import type {
  SupportedEditableElement,
  EditableFieldType,
  EditableFieldInfo
} from "../shared/types";
import {
  isDisabledElement,
  isReadOnlyElement,
  isVisibleElement
} from "../shared/validators";

export function getEditableFieldType(
  el: SupportedEditableElement
): EditableFieldType {
  return el instanceof HTMLTextAreaElement ? "textarea" : "text-input";
}

export function getEditableValue(el: SupportedEditableElement): string {
  return el.value ?? "";
}

export function buildEditableFieldInfo(
  el: SupportedEditableElement
): EditableFieldInfo {
  return {
    element: el,
    type: getEditableFieldType(el),
    value: getEditableValue(el),
    isVisible: isVisibleElement(el),
    isDisabled: isDisabledElement(el),
    isReadOnly: isReadOnlyElement(el)
  };
}

/** Adapter for getting/setting value and dispatching events (for future replacement). */
export interface FieldAdapter {
  getValue(): string;
  setValue(next: string): void;
}

export function createFieldAdapter(element: HTMLElement): FieldAdapter {
  if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLInputElement
  ) {
    return {
      getValue: () => element.value,
      setValue: (next: string) => {
        element.value = next;
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
  }

  if (element.isContentEditable) {
    return {
      getValue: () => element.textContent ?? "",
      setValue: (next: string) => {
        element.textContent = next;
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };
  }

  return {
    getValue: () => "",
    setValue: () => {}
  };
}
