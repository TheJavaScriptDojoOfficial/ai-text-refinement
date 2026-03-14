import { EditableFieldDetector } from "./fieldDetector";

const LOG_PREFIX = "[AI Refiner]";

function logActiveFieldDetected(
  type: string,
  valueLength: number
): void {
  console.log(`${LOG_PREFIX} Active field detected: { type: ${type}, valueLength: ${valueLength} }`);
}

function logActiveFieldUpdated(
  type: string,
  valueLength: number
): void {
  console.log(`${LOG_PREFIX} Active field updated: { type: ${type}, valueLength: ${valueLength} }`);
}

function logActiveFieldCleared(): void {
  console.log(`${LOG_PREFIX} Active field cleared`);
}

function runContentScript(): void {
  const detector = new EditableFieldDetector({
    onActiveFieldChange(fieldInfo) {
      if (fieldInfo) {
        logActiveFieldDetected(fieldInfo.type, fieldInfo.value.length);
      } else {
        logActiveFieldCleared();
      }
    },
    onActiveFieldValueChange(fieldInfo) {
      if (fieldInfo) {
        logActiveFieldUpdated(fieldInfo.type, fieldInfo.value.length);
      }
    }
  });

  detector.start();

  console.log(`${LOG_PREFIX} Content script active; field detector started.`);

  // Expose detector for future use (e.g. icon/popup) without touching global scope heavily.
  // Content script runs in isolated world; we can attach to a small bridge later if needed.
  (window as unknown as { __aiRefinerDetector?: EditableFieldDetector }).__aiRefinerDetector = detector;
}

runContentScript();
