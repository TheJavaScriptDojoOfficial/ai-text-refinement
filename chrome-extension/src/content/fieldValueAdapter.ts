export interface FieldAdapter {
  getValue(): string;
  setValue(next: string): void;
}

export function createFieldAdapter(element: HTMLElement): FieldAdapter {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
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
    setValue: () => {
      // no-op placeholder
    }
  };
}

