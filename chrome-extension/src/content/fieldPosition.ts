export interface FieldPosition {
  top: number;
  left: number;
  width: number;
  height: number;
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

