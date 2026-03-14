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

export interface BackendConfig {
  backendUrl: string;
}
