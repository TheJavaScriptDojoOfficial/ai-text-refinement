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

export interface ToneOption {
  id: string;
  label: string;
  description: string;
}

/** Viewport-relative position for the tone popup (position: fixed). */
export interface PopupPosition {
  top: number;
  left: number;
  placement: "below-trigger" | "above-trigger";
}

export interface PopupUiState {
  isOpen: boolean;
  selectedToneId: string | null;
  anchorField: EditableFieldInfo | null;
}

export interface BackendConfig {
  backendUrl: string;
  requestTimeoutMs?: number;
}

/** Tone id sent to backend (e.g. 'professional', 'friendly'). */
export type RefinementToneId = string;

export type RefineLengthOption = "shorter" | "same" | "longer";

export interface RefineRequestPayload {
  text: string;
  tone: string;
  mode: "refine";
  preserve_entities: boolean;
  preserve_urls: boolean;
  preserve_ids: boolean;
  length: RefineLengthOption;
}

export interface RefineSuccessResponse {
  success: true;
  refined_text: string;
  warnings?: string[];
  meta?: {
    tone?: string;
    model?: string;
  };
}

export interface RefineErrorResponse {
  success: false;
  error?: string;
  message?: string;
}

export type RefineApiResponse = RefineSuccessResponse | RefineErrorResponse;

export interface HealthResponse {
  ok: boolean;
  model_ready?: boolean;
  model?: string;
}

export type BackendStatus = "unknown" | "healthy" | "unreachable" | "error";

export interface RefineExecutionState {
  isLoading: boolean;
  activeToneId: string | null;
  errorMessage: string | null;
}
