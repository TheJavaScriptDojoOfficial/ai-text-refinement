/** Elements we support for refinement: textarea and supported text-like inputs only. */
export type SupportedEditableElement = HTMLTextAreaElement | HTMLInputElement;

export type EditableFieldType = "textarea" | "text-input";

export interface EditableFieldInfo {
  element: SupportedEditableElement;
  type: EditableFieldType;
  value: string;
  isVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
}

/** Called when the active editable field changes (gained focus or lost focus). */
export type OnActiveFieldChange = (fieldInfo: EditableFieldInfo | null) => void;

/** Called when the value of the current active field changes. */
export type OnActiveFieldValueChange = (fieldInfo: EditableFieldInfo | null) => void;

/** Viewport-relative position for the floating trigger (position: fixed). */
export interface FloatingTriggerPosition {
  top: number;
  left: number;
  placement: "top-right" | "bottom-right";
}

/** Whether the trigger should be shown for the current active field. */
export interface ActiveFieldUiState {
  field: EditableFieldInfo | null;
  shouldShowTrigger: boolean;
}

export interface BackendConfig {
  backendUrl: string;
}
