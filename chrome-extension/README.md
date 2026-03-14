## Local AI Text Refiner – Chrome Extension

Refine text on any website using your **local LLM backend**. The extension detects supported editable fields, shows a floating refine trigger and tone popup, sends text to your local backend, and replaces the field content with the refined result.

### What it does

- **Detects** supported text fields (textarea and text-like inputs) when focused.
- **Shows** a floating refine trigger (✨) when the field has text.
- **Opens** a tone popup (Professional, Friendly, Concise, etc.) on trigger click.
- **Sends** the current field text and selected tone to your local backend API.
- **Replaces** the field text with the refined result on success.

### Current MVP support

- **Fields:** `textarea`, `input` types: text, search, email, url, tel (visible, enabled, not readonly).
- **Backend:** Local Python API (health + refine endpoints); configurable URL and timeout.
- **Settings:** Options page; all settings stored in `chrome.storage.local` (backend URL, timeout, default tone/length, preserve flags, enabled, auto-show trigger, domain blacklist).
- **Error handling:** Unreachable, timeout, model not ready, invalid response; loading and stale-request guards.

### Not supported yet

- Contenteditable / rich editors (Gmail, Slack, Teams, etc.).
- Diff preview, refinement history, or undo stack.
- Sync storage, per-site custom settings, or live settings sync across tabs.

---

### Local development

#### Install dependencies

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

#### Demo page for manual testing

A static demo page with various field types is in `dev/demo.html`. It is **not** part of the build output. To use it:

- Serve it over HTTP (e.g. `npx serve dev --port 3000` from the `chrome-extension` directory) and open the shown URL, or
- Use any test page (e.g. [Evil Tester form](https://testpages.eviltester.com/pages/forms/html-form/)) that has text inputs and textareas.

The demo page includes: a text input, a textarea, a password input (ignored by the extension), a readonly textarea, a disabled input, and a long textarea for scroll/position testing.

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
3. The URL is persisted in `chrome.storage.local`, and the extension reads it when making backend calls.

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
3. You should see: `[AI Refiner] Initialized successfully`
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

- On the Options page, **Test Backend Connection** uses the **current form** Backend URL and timeout (not yet saved). It calls `GET /api/health` and shows: "Backend connection successful.", "Backend reachable, but model is not ready.", "Could not connect to backend.", "Request timed out.", or "Invalid backend URL." The test button is disabled while the request is in progress.

#### Storage

- All settings are stored in **chrome.storage.local** under a single key. No sync storage or remote config. Values are validated and normalized when read so the runtime always gets safe defaults for missing or invalid data.

---

### Step 8: Loading state, error handling, and health checks

Step 8 hardens the extension when the backend is unavailable, slow, or returns malformed responses. **Existing behavior is unchanged** when the backend is healthy: field detection, trigger, popup, refine, and text replacement all work as before.

#### Health check behavior

- **Startup health check** (optional, non-blocking): After the content script initializes on an allowed site, it may run a single health check in the background. Results are logged only: "Backend healthy", "Backend not ready", or "Backend unreachable". This does **not** block the detector or popup; refinement remains available even if the startup check fails.
- **Cached health results**: The backend client caches the last health result for a short period (e.g. 30 seconds). Repeated health checks within that window reuse the cache.
- **Health result normalization**: The client maps backend responses to a consistent shape: `healthy`, `not-ready` (ok but model not ready), `unreachable`, `timeout`, or `error`. Malformed JSON or non-2xx responses are treated as `error` or `unreachable` without crashing.

#### Loading and error handling

- **Popup**: While a refine request is in progress, tone buttons are disabled and a loading state is shown. When the request finishes (success or failure), loading always clears. Errors are shown inline in the popup; the user can retry by choosing another tone or closing and reopening the popup.
- **Stale request guards**: If the user triggers a new refinement (or the popup closes, or the field changes) before an in-flight request completes, the old result is **ignored**. A request ID ensures only the latest result is applied; duplicate or stale results are discarded and logged briefly.
- **Replacement failure**: If the backend returns refined text but applying it to the field fails (e.g. DOM no longer valid), the extension logs "Replacement failed: …" and does not throw. The popup is already closed at that point.

#### How backend failures are surfaced

- **Unreachable**: "Local refinement server is not running."
- **Timeout**: "The local refinement request timed out."
- **Model not ready**: "The local model is not ready yet." (when health returns ok but model_ready false).
- **Invalid response**: "The backend returned an invalid response."
- **Other**: Backend error message or "Refinement failed. Please try again."

All of these appear as inline popup errors so the user can retry or adjust settings.

#### Troubleshooting

| Symptom | What to check |
|--------|----------------|
| **Backend unreachable** | Backend URL in options (e.g. `http://127.0.0.1:8000`). Server running and CORS allows the request. |
| **Model not ready** | Backend may be still loading the model. Wait and retry, or check backend logs. |
| **Timeout** | Increase "Request Timeout (ms)" in options. Default 30000; min 1000, max 300000. |
| **Invalid backend URL** | Use `http://` or `https://` and a valid host/port. No trailing path unless your API lives under a subpath. |
| **Trigger not showing** | Focus a supported field (textarea or text input), ensure it has at least one character, and that the field is not disabled/readonly. Check that "Auto-show refine trigger" is on in options. |
| **Site blacklisted / extension disabled** | In options, ensure "Enable extension" is on and the current site’s hostname is not in the blacklist. Reload the page after changing these settings. |

---

### Manual testing checklist (QA)

Use this to verify the extension after changes.

**Happy path**

- [ ] Supported field detected (focus textarea or text input → console shows active field).
- [ ] Trigger appears when field has text.
- [ ] Popup opens on trigger click.
- [ ] Tone selected → backend request sent, loading state shown.
- [ ] Successful response → refined text applied to field, popup closes.

**Failure path**

- [ ] Backend unreachable → popup shows error, remains usable.
- [ ] Backend timeout → loading clears, timeout error shown, retry works.
- [ ] Model not ready → appropriate error shown.
- [ ] Invalid backend URL → error shown (options test or refine).
- [ ] Replacement failure (e.g. field removed) → logged, no crash.

**Settings path**

- [ ] Save settings → values persist after reloading options page.
- [ ] Reset to defaults → form and storage reset.
- [ ] Test Backend Connection → clear success/failure message, button disabled during test.
- [ ] Blacklist current hostname → after reload, extension inactive on that site.
- [ ] Disable extension → after reload, content script inactive.

**Note:** Changes to **Enable extension** or **Domain blacklist** apply after you reload the tab or navigate; already-open tabs do not update live.

---

### Packaging

- **Build output:** `chrome-extension/dist/` contains the compiled extension (manifest, background, content script, options, CSS, icons from `public/`).
- **Load unpacked:** In Chrome go to `chrome://extensions/` → Developer mode → Load unpacked → select the `dist` folder.
- **Release zip (optional):** Run `npm run package:zip` to produce `chrome-extension-release.zip` from the contents of `dist/`. Requires `zip` on the path (macOS/Linux). Useful for sharing the extension without the repo.

---

### MVP acceptance checklist

- [ ] Build completes (`npm run build`).
- [ ] Extension loads unpacked in Chrome from `dist/` with no missing assets.
- [ ] No console errors on startup on an allowed page.
- [ ] Supported fields work (trigger, popup, refine, replacement).
- [ ] Options page loads and save/reset/test work.
- [ ] Backend integration works when backend is running.
- [ ] Error handling is stable (unreachable, timeout, invalid response).
- [ ] README explains setup, use, and troubleshooting.
- [ ] Existing behavior has not regressed.

---

### Step 9: MVP polish and packaging

Step 9 adds testing support, packaging readiness, and stability polish without changing working behavior.

- **Duplicate-init guard:** Content script skips initialization if already running (single root, no double injection).
- **Console logs:** Stable `[AI Refiner]` prefix; "Initialized successfully", "Inactive: extension disabled by settings", "Inactive: blacklisted domain", "Backend healthy / not ready / unreachable", "Refinement succeeded / failed", "Ignoring stale refine result", "Replacement failed".
- **Scripts:** `npm run clean` (remove `dist/`), `npm run package:zip` (build then zip `dist` into `chrome-extension-release.zip`; requires `zip` on PATH).
- **Demo page:** `dev/demo.html` for manual testing (serve over HTTP; not included in extension build).
- **Options:** Helper text notes that enabled/blacklist changes may require a page reload on already-open tabs.
- **README:** What it does, MVP support, not supported, local dev, manual testing checklist, packaging, troubleshooting, and MVP acceptance checklist.

