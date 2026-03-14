import { EditableFieldDetector } from "./fieldDetector";
import { FloatingTriggerRenderer } from "./domRenderer";
import { RefineTriggerController } from "./popupController";
import { LocalRefinerApiClient } from "./backendClient";
import { createFieldAdapter } from "./fieldValueAdapter";

const LOG_PREFIX = "[AI Refiner]";

function logActiveFieldDetected(type: string, valueLength: number): void {
  console.log(
    `${LOG_PREFIX} Active field detected: { type: ${type}, valueLength: ${valueLength} }`
  );
}

function logActiveFieldUpdated(type: string, valueLength: number): void {
  console.log(
    `${LOG_PREFIX} Active field updated: { type: ${type}, valueLength: ${valueLength} }`
  );
}

function logActiveFieldCleared(): void {
  console.log(`${LOG_PREFIX} Active field cleared`);
}

function runContentScript(): void {
  const apiClient = new LocalRefinerApiClient();
  const renderer = new FloatingTriggerRenderer();
  const controller = new RefineTriggerController(renderer, {
    apiClient,
    onRefineSuccess(result) {
      const adapter = createFieldAdapter(result.field.element);
      adapter.setValue(result.refinedText);
      console.log(
        `${LOG_PREFIX} Refined result applied: { type: ${result.field.type}, toneId: ${result.toneId} }`
      );
    }
  });

  const detector = new EditableFieldDetector({
    onActiveFieldChange(fieldInfo) {
      if (fieldInfo) {
        logActiveFieldDetected(fieldInfo.type, fieldInfo.value.length);
      } else {
        logActiveFieldCleared();
      }
      controller.handleActiveFieldChange(fieldInfo);
    },
    onActiveFieldValueChange(fieldInfo) {
      if (fieldInfo) {
        logActiveFieldUpdated(fieldInfo.type, fieldInfo.value.length);
      }
      controller.handleActiveFieldValueChange(fieldInfo);
    }
  });

  detector.start();
  controller.start(detector);

  console.log(
    `${LOG_PREFIX} Content script active; field detector and trigger started.`
  );

  void apiClient.checkHealth().then(
    () => {
      console.log(`${LOG_PREFIX} Backend healthy`);
    },
    () => {
      console.log(`${LOG_PREFIX} Backend unreachable`);
    }
  );

  (window as unknown as { __aiRefinerDetector?: EditableFieldDetector }).__aiRefinerDetector =
    detector;
}

runContentScript();
