## Local AI Text Refiner – Chrome Extension

This Chrome extension lets you refine text on any website using your **local LLM backend** from the AI Text Refinement Tool.  
Right now this project is a scaffold: it is buildable and wired to your backend URL setting, but the actual refinement logic is not implemented yet.

### How to install dependencies

From the `chrome-extension` directory:

```bash
cd chrome-extension
npm install
```

### How to run a dev build

The extension uses **Vite** to bundle the TypeScript sources into a `dist/` folder.

```bash
cd chrome-extension
npm run dev   # builds once, then rebuilds on change (watch mode)
```

For a one‑off production build:

```bash
npm run build
```

The compiled extension assets (background, content script, options page, manifest, and icons) will be output into the `dist/` directory.

### How to load the extension in Chrome

1. Build the extension:
   - `cd chrome-extension`
   - `npm run build`
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top-right).
4. Click **"Load unpacked"**.
5. Select the `chrome-extension/dist` folder from this repository.

After loading:

- The **content script** runs on all pages and currently just logs:
  - `"AI Text Refiner content script active"` in the page console.
- The **background service worker** logs:
  - `"AI Text Refiner extension loaded"` in the extension’s background console.

### How it connects to the local backend

The extension is designed to talk to the existing **Python backend** that powers your local LLM:

- The backend is expected to run locally, by default at `http://127.0.0.1:8000`.
- You can configure the backend URL in the **Options** page.

#### Configuring the backend URL

1. Right‑click the extension icon or open it from `chrome://extensions/` and choose **"Extension options"** (or click **Details → Extension options**).
2. In **Local AI Text Refiner Settings**:
   - Set the **Backend URL** (e.g. `http://127.0.0.1:8000`).
   - Click **Save**.
3. The URL is persisted in `chrome.storage.sync`, and internal code (e.g. `backendClient.ts`) will read this value when making calls to the backend.

At this stage, the extension **does not yet send refinement requests**; the relevant modules (`backendClient.ts`, `content` utilities, etc.) are stubbed and ready for future implementation of the full refinement flow.

---

### Step 2: Editable field detection

The extension includes a **field detection engine** that tracks the currently focused editable field on the page. No refine popup, backend calls, or field replacement is implemented yet—only detection and active-field tracking.

#### What is supported

- **`textarea`** elements (visible, enabled, not readonly, meeting minimum size).
- **Text-like `input` types**: `text`, `search`, `email`, `url`, `tel`.
- Fields must be **visible** (not `display:none`, not `visibility:hidden`, non-zero size), **enabled** (not `disabled`), **editable** (not `readOnly`), and **large enough** (default min width 120px, min height 28px).
- Focus transitions (e.g. tabbing between fields) are handled with a short delay so the active field does not flicker.

#### What is excluded (for now)

- **Password** inputs are never considered eligible.
- **Other input types** (e.g. `checkbox`, `radio`, `hidden`, `file`, `number`, `date`, etc.) are ignored.
- **Contenteditable** elements are not supported in this step.
- Elements inside the extension’s own UI (marked with `data-ai-refiner-root="true"`) are ignored.

#### How to test detection manually

1. Load the extension from `chrome-extension/dist` (see above).
2. Open any page and open **DevTools → Console** (page context, not extension context).
3. You should see: `[AI Refiner] Content script active; field detector started.`
4. **Focus a `textarea`** (e.g. a comment box). You should see:  
   `[AI Refiner] Active field detected: { type: textarea, valueLength: N }`
5. **Type in that field.** You should see:  
   `[AI Refiner] Active field updated: { type: textarea, valueLength: N }`
6. **Focus an `input[type="text"]`** (e.g. a search box). You should see:  
   `[AI Refiner] Active field detected: { type: text-input, valueLength: N }`
7. **Focus a password input.** You should **not** see “Active field detected” for it (password is ignored).
8. **Focus a disabled or readonly field.** It should be ignored (no “Active field detected”).
9. **Blur the field** (click outside or tab away). You should see:  
   `[AI Refiner] Active field cleared`

---

### Step 3: Floating refine trigger

The extension injects a **floating refine button** (✨) near the active editable field when that field has text. The trigger is used only to indicate “refine here”; the popup and backend are **not** implemented yet.

#### Behavior

- **Show trigger:** When a supported field (textarea or text-like input) is focused **and** has at least one character of text (after trim), the trigger appears near the top-right (or bottom-right if there’s no room above) of the field.
- **Hide trigger:** When the field is cleared, blurred, or no longer eligible (e.g. disabled), or when the field is removed from the DOM, the trigger is hidden.
- **Positioning:** The button uses `position: fixed` and is repositioned on scroll and resize (with `requestAnimationFrame` throttling). It is clamped so it never goes outside the viewport.
- **Click:** Clicking the trigger logs `[AI Refiner] Refine trigger clicked` and does not open a popup or call the backend yet. Clicks use `preventDefault`/`stopPropagation` so the host page is not affected.

#### Supported fields

Same as Step 2: `textarea` and `input` types `text`, `search`, `email`, `url`, `tel` that are visible, enabled, not readonly, and meet the minimum size. Password and other input types are excluded; the extension root (and trigger) are ignored by field detection.

#### Current limitations

- **Popup is not implemented.** Clicking the trigger only logs to the console.
- **Backend is not connected.** No refinement requests are sent.
- Tone selection, refined-text replacement, and history are not implemented.

#### How to test the trigger manually

1. Build and load the extension from `chrome-extension/dist`.
2. Open a page that has a `textarea` or text input (e.g. a comment box or search field).
3. **Focus an empty field** → trigger should **not** appear.
4. **Type at least one character** → trigger should appear near the field (top-right or bottom-right).
5. **Scroll the page** (with the field still focused and with text) → trigger should move with the field.
6. **Resize the browser** → trigger should stay correctly positioned.
7. **Delete all text** → trigger should disappear.
8. **Blur the field** (click outside) → trigger should disappear.
9. **Focus a password field** → trigger should never appear.
10. On a page that dynamically removes the active field from the DOM, the trigger should disappear without errors.

