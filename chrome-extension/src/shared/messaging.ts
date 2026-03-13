export type MessageType = "REFINE_TEXT";

export interface BaseMessage {
  type: MessageType;
}

export interface RefineTextMessage extends BaseMessage {
  type: "REFINE_TEXT";
  text: string;
}

export type ExtensionMessage = RefineTextMessage;

export function sendMessageToBackground(message: ExtensionMessage): void {
  chrome.runtime.sendMessage(message);
}

