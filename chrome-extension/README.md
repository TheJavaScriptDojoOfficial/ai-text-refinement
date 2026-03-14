## Local AI Text Refiner – Chrome Extension

This Chrome extension lets you refine text on any website using your **local LLM backend** from the AI Text Refinement Tool. It detects editable fields, shows a floating refine trigger and tone popup, calls your local backend to refine the text, and inserts the result into the field.

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

- The **content script** runs on all pages: it detects editable fields, shows the refine trigger and tone popup, and calls the backend when you select a tone. Check the page console for `[AI Refiner]` logs.
- The **background service worker** logs `"AI Text Refiner extension loaded"` in the extension’s background console.

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

The extension sends refinement requests when you select a tone; see **Step 5** below for the full flow.

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

The extension injects a **floating refine button** (✨) near the active editable field when that field has text. Clicking it opens the tone selection popup (Step 4). The backend is **not** connected yet.

#### Behavior

- **Show trigger:** When a supported field (textarea or text-like input) is focused **and** has at least one character of text (after trim), the trigger appears near the top-right (or bottom-right if there’s no room above) of the field.
- **Hide trigger:** When the field is cleared, blurred, or no longer eligible (e.g. disabled), or when the field is removed from the DOM, the trigger is hidden.
- **Positioning:** The button uses `position: fixed` and is repositioned on scroll and resize (with `requestAnimationFrame` throttling). It is clamped so it never goes outside the viewport.
- **Click:** Clicking the trigger opens the tone popup (see Step 4). Clicks use `preventDefault`/`stopPropagation` so the host page is not affected.

#### Supported fields

Same as Step 2: `textarea` and `input` types `text`, `search`, `email`, `url`, `tel` that are visible, enabled, not readonly, and meet the minimum size. Password and other input types are excluded; the extension root (trigger and popup) are ignored by field detection.

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

---

### Step 4: Tone selection popup

Clicking the floating trigger opens a **tone selection popup** anchored to the trigger. You can choose a tone (e.g. Professional, Friendly, Concise); the choice is logged and the popup closes. **Backend is not connected** and **refined text is not applied** yet—only the popup UI and selection state are implemented.

#### Behavior

- **Open:** Click the ✨ trigger → popup opens below (or above) the trigger with a list of tone options.
- **Close:** Popup closes when you click outside it, press **Escape**, click the trigger again, select a tone, or when the active field is cleared or changes.
- **Selection:** Click a tone option → it is marked selected, `[AI Refiner] Tone selected: <toneId>` is logged, and the popup closes.
- **Positioning:** Popup is viewport-clamped and repositions on scroll/resize while open.

#### Available tones

- **Professional** — Clear and work-appropriate  
- **Friendly** — Warm and approachable  
- **Polite** — Softer and more courteous  
- **Concise** — Shorter and more direct  
- **Stronger** — More confident and firm  
- **Grammar Fix** — Correct grammar and phrasing  

#### Current limitations

- **Backend is not connected.** Selecting a tone only updates UI state and logs to the console.
- **Refined text is not applied.** No API call or text replacement is performed.
- Loading state and result preview are not implemented.

#### How to test the popup manually

1. Build and load the extension; focus a supported field with some text so the trigger appears.
2. **Click the trigger** → tone popup opens near the trigger; console: `[AI Refiner] Tone popup opened`.
3. **Click the trigger again** → popup closes; console: `[AI Refiner] Tone popup closed`.
4. **Open popup, then click "Professional"** → console: `[AI Refiner] Tone selected: professional`; popup closes.
5. **Open popup, then click somewhere on the page** → popup closes.
6. **Open popup, then press Escape** → popup closes.
7. **Open popup, then delete all text in the field** → popup closes and trigger disappears.
8. **Open popup, then focus another text field** → popup closes; trigger updates for the new field.
9. **Scroll or resize with popup open** → popup stays anchored and within viewport.

---

### Step 5: Backend API integration

The extension calls your **local Python refinement backend** when you select a tone. It sends the current field text and selected tone, receives refined text, shows loading/error state in the popup, and **inserts the refined text into the active field** on success.

#### Backend contract

The extension expects these endpoints (configurable via Options). All paths and defaults are in `src/shared/constants.ts` and `src/content/backendClient.ts`; the client maps extension tone IDs to backend `mode` so validation passes. Adjust the mapping in `backendClient.ts` if your API differs.

**1. Health check**  
`GET /api/health`

- Success example: `{ "ok": true, "model_ready": true, "model": "qwen2.5-coder:14b" }`
- Used only for optional startup logging ("Backend healthy" / "Backend unreachable"). Refinement does not depend on a prior health check.

**2. Refine text**  
`POST /api/refine`

- Request body (actual payload sent by the extension):
  - `text`: string (current field content)
  - `tone`: **string[]** (e.g. `["professional"]`) — backend expects a list
  - `mode`: string — must be one of the backend’s valid modes (e.g. `"professional"`, `"grammar_only"`, `"clarity"`). The extension maps each tone option to a valid mode in `EXTENSION_TONE_TO_BACKEND_MODE` in `backendClient.ts`.
  - `preserve_entities`, `preserve_urls`, `preserve_ids`: boolean (defaults: true)
  - `length`: `"shorter"` | `"same"` | `"longer"` (default: `"same"`)
- Success: `{ "success": true, "refined_text": "...", "warnings": [], "meta": { ... } }`
- Error: `{ "success": false, "error": "..." }` or `"message"` field

#### Options page settings

- **Backend URL** — Base URL of the local backend (default: `http://127.0.0.1:8000`).
- **Request Timeout (ms)** — Timeout for health and refine requests (default: 30000; min 5000, max 120000).

#### Runtime flow

1. Focus a supported field with text → trigger appears.  
2. Click trigger → tone popup opens.  
3. Select a tone → popup shows "Refining...", tone buttons are disabled, request is sent.  
4. **Success** → Refined text is **inserted into the active field**; popup closes; console logs applied result.  
5. **Failure** → Popup stays open with an inline error (e.g. "Local refinement server is not running.", "The local refinement request timed out."). User can retry by choosing another tone or closing the popup.

#### Field identity and errors

- If the active field changes or is cleared before the request returns, the result is **discarded** and a short warning is logged.  
- Errors are normalized to user-facing messages (unreachable, timeout, generic failure, backend error message).  
- Invalid backend URL or missing `refined_text` in the response is handled without crashing.

#### Implementation notes

- **Refined text is inserted** into the active field via `createFieldAdapter` (value set + `input`/`change` events). If the active field changed before the request returns, the result is discarded and a warning is logged.

---

### Step 7: Options page and local settings

The extension has a full **Options** page and stores all settings in **chrome.storage.local** (no sync). You can configure the backend, refinement defaults, extension behavior, and a domain blacklist.

#### Available settings

| Setting | What it does |
|--------|----------------|
| **Backend URL** | Base URL of your local refinement API (e.g. `http://127.0.0.1:8000`). |
| **Request Timeout (ms)** | Timeout for health and refine requests (default 30000; min 5000, max 300000). |
| **Default Tone** | Pre-selected tone when the tone popup opens (e.g. Professional, Concise). |
| **Default Length** | Default length hint for refinement: shorter / same / longer. |
| **Preserve entities / URLs / IDs** | Checkboxes sent with refine requests to the backend. |
| **Enable extension** | When off, the content script does not activate on any page. |
| **Auto-show refine trigger** | When off, the floating trigger is never shown (popup still openable if you add another entry point later). |
| **Domain blacklist** | Hostnames (one per line). The extension stays **inactive** on these sites. |

#### Domain blacklist

- One hostname per line (or comma-separated). Examples:
  - `gmail.com`
  - `teams.microsoft.com`
  - `localhost`
- Matching is **exact** (after trim and lowercasing). The extension does not run on blacklisted domains and logs: `[AI Refiner] Extension inactive on blacklisted domain: <hostname>`.
- If **Enable extension** is off, it logs: `[AI Refiner] Extension disabled by settings`.

#### Test Backend Connection

- On the Options page, **Test Backend Connection** uses the **current form** Backend URL and timeout (not yet saved). It calls `GET /api/health` and shows success or an error (e.g. "Could not connect to backend.", "Connection timed out.").

#### Storage

- All settings are stored in **chrome.storage.local** under a single key. No sync storage or remote config. Values are validated and normalized when read so the runtime always gets safe defaults for missing or invalid data.

