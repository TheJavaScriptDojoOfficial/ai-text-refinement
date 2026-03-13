// Placeholder DOM renderer for injected controls.

export function createRootContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.id = "ai-text-refiner-root";
  return container;
}

