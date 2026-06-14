# Study Content — JSON format (as implemented)

This documents the **exact `formatted_content` object the editor currently loads and saves**, derived from the implemented types in `src/composables/useTopicContentEditor/types.ts`. Use this as the contract; it diverges from the original v1 spec in two important ways (see [§5](#5-differences-from-the-original-spec--what-the-server-must-change)).

---

## 1. Transport envelope

**Load** — `GET /public/cbt/study/topics/{topic_id}/content`

The editor reads `data.topic_content` and edits it as `content`. `data.topic_name` becomes the header title.

```jsonc
{
  "data": {
    "topic_id": 12,
    "topic_name": "Photosynthesis",
    "topic_content": { /* formatted_content — see §2 */ }
  }
}
```

**Save** — `PUT /public/cbt/study/topics/{topic_id}/content`

The editor sends the whole object back under `content`:

```jsonc
{ "content": { /* the full formatted_content, mutated */ } }
```

---

## 2. `formatted_content` shape

> ⚠️ Keys are **camelCase** and the rich-text fields hold **HTML strings**, not plain text. This is what the running code expects. See §5.

```jsonc
{
  "media": {
    "video": {                 // optional, 0 or 1 per topic
      "type": "video",
      "title": "Photosynthesis overview",
      "url": "https://…",
      "provider": "youtube",
      "duration": "6:42",
      "placement": null
    }
  },

  "contents": [                // SECTIONS (ordered)
    {
      "id": 1,
      "title": "Introduction", // plain string (shown in outline)
      "subsections": [
        {
          "id": 11,
          "title": "<p>What Photosynthesis Is</p>",   // rich-text HTML
          "diagramNeeded": false,
          "media": [
            { "type": "image", "url": "https://…/leaf.png", "alt": "Leaf diagram" }
          ],
          "cards": [ /* typed blocks — see §3 */ ]
        }
      ],
      "quiz": [ /* quiz items — see §4 */ ]            // SECTION quiz
    }
  ],

  "finalQuiz": [ /* quiz items — see §4 */ ]           // END-OF-LESSON quiz
}
```

**IDs & ordering**
- `section.id`, `subsection.id`, and `card.id` are unique within their parent.
- Array order **is** display order.
- New cards added in the editor get `id = max(existing card ids) + 1` within the subsection.

---

## 3. Card blocks (`subsection.cards[]`)

Every card has `id`, `type`, and `title`. `type` is one of (note camelCase):

`text` · `highlight` · `list` · `pairs` · `examTip` · `commonMistake` · `equation` · `workedExample`

Per-type fields:

| `type` | Extra fields | Notes |
|---|---|---|
| `text` | `body` | rich-text HTML |
| `highlight` | `body` | rich-text HTML |
| `examTip` | `body` | rich-text HTML |
| `workedExample` | `body` | rich-text HTML |
| `equation` | `body` | rich-text HTML (math nodes) |
| `list` | `items: string[]`, `ordered?: boolean` | each item is HTML (`<p>…</p>`); `ordered: true` → numbered |
| `pairs` | `items: Array<{ term, description }>` | `term`/`description` are HTML |
| `commonMistake` | `wrong`, `correct` | both rich-text HTML |

```jsonc
{ "id": 1, "type": "text", "title": "<p>Definition</p>",
  "body": "<p>Photosynthesis converts light into <strong>chemical energy</strong>.</p>" }

{ "id": 2, "type": "highlight", "title": "<p>Key idea</p>",
  "body": "<p>Light → food energy</p>" }

{ "id": 3, "type": "list", "title": "<p>What plants need</p>", "ordered": false,
  "items": ["<p>Sunlight</p>", "<p>Carbon dioxide</p>", "<p>Water</p>"] }

{ "id": 4, "type": "pairs", "title": "<p>Stages</p>",
  "items": [{ "term": "<p>Light reaction</p>", "description": "<p>Splits water</p>" }] }

{ "id": 5, "type": "commonMistake", "title": "<p>Watch out</p>",
  "wrong": "<p>Plants breathe in O₂</p>",
  "correct": "<p>Plants take in CO₂, release O₂</p>" }

{ "id": 6, "type": "equation", "title": "<p>Balanced equation</p>",
  "body": "<p><span data-type=\"inline-math\" data-latex=\"6CO_2 + 6H_2O \\rightarrow C_6H_{12}O_6 + 6O_2\"></span></p>" }
```

### Math
Math is stored inside the HTML as TipTap math nodes:

```html
<span data-type="inline-math" data-latex="x^{2}"></span>
```

**On load, the editor also accepts plain `$…$` / `$$…$$` inside any field** — it auto-migrates those to math nodes (`migrateMathStrings`). So the server *may* send `"body": "<p>Area is $\\pi r^2$</p>"` or even `"body": "Area is $\\pi r^2$"` and it will render. But once edited and saved, the editor returns the normalized math-node HTML shown above.

### Media
`subsection.media[]` holds image blocks: `{ "type": "image", "url": "…", "alt": "…" }`. Uploaded images currently produce a `data:` URL in `url` (local mock); when the upload endpoint is wired, `url` becomes the returned CDN URL.

---

## 4. Quiz items (`section.quiz[]` and `finalQuiz[]`)

```jsonc
{
  "id": 701,
  "questionText": "<p>What gas is released in photosynthesis?</p>",  // rich-text HTML
  "options": [
    { "text": "<p>Nitrogen</p>" },
    { "text": "<p>Oxygen</p>" }
  ],
  "correctAnswer": 1,            // 0-based index into options[]
  "explanation": "<p>Oxygen comes from splitting water.</p>",        // rich-text HTML
  "bloomLevel": "understand"     // remember|understand|apply|analyze|evaluate|create
}
```

- `correctAnswer` is the **0-based index** of the correct option (never expose the raw index in UI — the editor uses the radio).
- `questionText`, `option.text`, `explanation` are HTML (same rich-text + math rules as cards).

---

## 5. Differences from the original spec — what the server must change

The implemented editor does **not** match the original v1 spec verbatim. Two concrete divergences:

### 5.1 Key casing — **camelCase**, not snake_case
The editor binds directly to these keys. The original spec used snake_case. Mapping required (either the API serializes camelCase for this payload, or a normalize/denormalize layer sits between the API and the editor):

| Original spec (snake_case) | Editor expects (camelCase) |
|---|---|
| `final_quiz` | `finalQuiz` |
| `question_text` | `questionText` |
| `correct_answer` | `correctAnswer` |
| `bloom_level` | `bloomLevel` |
| `diagram_needed` | `diagramNeeded` |
| `exam_tip` (type) | `examTip` |
| `common_mistake` (type) | `commonMistake` |
| `worked_example` (type) | `workedExample` |

(`text`, `highlight`, `list`, `pairs`, `equation`, and `media`, `contents`, `subsections`, `cards`, `title`, `id`, `url`, `alt` are identical in both.)

### 5.2 Rich text — **HTML strings**, not plain text
Original spec treated `body`/`items`/`term`/`description`/`question_text`/`explanation` as plain text with optional `$…$`. The editor now stores **TipTap HTML** (bold/italic/underline/lists + math nodes).
- **Inbound:** plain text and `$…$` still work (auto-migrated), so existing AI-generated content renders fine.
- **Outbound (saved):** these fields come back as HTML. The student renderer / consumers must render HTML (and KaTeX for `data-latex` math spans), not plain text.

### Recommendation
Pick one and keep it consistent:
1. **Serve camelCase + accept HTML** for this endpoint (simplest given current code), or
2. Keep the server on snake_case/plain-text and add a thin **adapter** in the load/save path (`GET` → normalize to the shape above; `PUT` → denormalize back). The save seam is `saveContent()` in `useTopicContentEditor/index.ts`; the load seam is `loadDummyContent()` (to be replaced by the real `GET`).
