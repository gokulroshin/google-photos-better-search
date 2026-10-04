# Google Photos — AI-Native Memory Retrieval MVP ("Better Search")
## Edge Cases & Corner Scenarios Specification (`edgecase.md`)

---

## 1. Overview & Edge Case Philosophy

In an AI-native memory retrieval prototype operating on **one dynamic screen with state-driven transitions**, edge cases emerge from the intersection of **human memory imperfections**, **rapid mobile micro-interactions**, and **data variance anomalies**.

### Core Edge-Case Principles (Updated Problem Statement Alignment)
1. **Never Dead-End the User**: The system must never trap the user on a blank screen with `"0 results found"`. Every narrowing step maintains an instant recovery path.
2. **One Dynamic Screen Stability**: State transitions (e.g., question sliding from left, photo grid re-ranking, candidate count badge updating) must happen seamlessly without component tearing, full-page reloads, or losing scroll position.
3. **Lightweight Deterministic Resilience**: Because candidate filtering and question selection execute locally over mock metadata to ensure sub-50ms responsiveness, all attribute calculations must gracefully handle `null`, `undefined`, or unpopulated metadata fields.
4. **Preserve User Agency**: The user can dismiss the AI question carousel at any time, tap *"I'm not sure"*, enter unprompted memory fragments in free text, remove active chips, or trigger *"Still not it?"* if the final shortlist misses the mark.

---

## 2. Updated Edge Case Matrix & Taxonomy

```text
Single Dynamic Screen State Transitions:
[Initial Query] ──> [Broad Pool ~53] ──> [Slide-In Question Carousel (Max 5)] ──> [Early Stop (<=3)] ──> [Detail Viewer & Confirm]
                                                        │                                      ▲
                                                        └───> "Still not it?" ─────────────────┘
```

| ID | Category | Scenario / Failure Mode | Severity | Primary Handling Mechanism |
| :--- | :--- | :--- | :--- | :--- |
| **EC-01** | Query | Ultra-Short or Incomplete Input (`"p"`, `"dr"`) | Medium | Enforce min 3 chars + suggest starter chips (e.g. `"Try searching for a prescription..."`). |
| **EC-02** | Query | Gibberish or Emoji-Only Input (`"asdf123"`, `"💊🏥"`) | Low | Emojis mapped to concepts; gibberish displays friendly guidance banner + broad feed. |
| **EC-03** | Query | Premature High Precision Query (e.g. full patient & clinic name) | Low | Detects pool $\le 3$ immediately; skips questioning and directly presents Shortlist View. |
| **EC-04** | Retrieval | Initial Match Set $< 50$ Candidates in 100–150 Asset Library | High | Category Neighbour & Visual Distractor injection to guarantee ~50–55 initial pool. |
| **EC-05** | Question | Repeated `"I'm not sure"` (3+ consecutive selections) | High | Skips unanswerable dimensions; terminates questioning early and displays organized clusters. |
| **EC-06** | Question | Max 5 Questions Reached with $> 3$ Candidates Remaining | Medium | Hard budget cap at 5; stops questions and surfaces top 3 ranked candidates + browsable list. |
| **EC-07** | Shortlist | User Clicks `"Still not it?"` Secondary Action | High | Re-evaluates remaining candidate pool; identifies next unresolved attribute; slides in fresh question. |
| **EC-08** | Shortlist | `"Still not it?"` Clicked with Zero Remaining Variance | Medium | Explains all clues are exhausted; displays full candidate pool with manual filter reset. |
| **EC-09** | Animation | Rapid Tapping During Question Slide-In (250–400 ms) | Low | Client-side pointer event lock and state debounce during transitions. |
| **EC-10** | Processing | Network or Local Latency Exceeding 700 ms Budget | Medium | Sparkle shimmer micro-state times out at 700ms; reveals results without visual freezing. |
| **EC-11** | Narrowing | User Misremembers Detail (Conflict with Reality) | High | Soft probabilistic scoring prevents dropping near-matches; highlights similar photos. |
| **EC-12** | Narrowing | Pool Over-Filtered to 0 Matches | Critical | Auto-relaxes the most recent conflicting filter; displays `"Undo"` toast. |
| **EC-13** | Chips | User Removes Memory Chip (`[Vomiting ✕]`) | Medium | Instantly re-expands candidate pool; recalculates next best question for expanded set. |
| **EC-14** | Data | Missing Metadata Attributes (`condition: null`, `year: undefined`) | Medium | Null-coalescing in entropy calculator; assets with missing fields categorized under `"Other"`. |
| **EC-15** | Confirmation | User Taps `"No"` on Photo Confirmation Dialog | High | Logs negative retrieval; offers `"Remove last clue"` or returns to grid with target deprioritized. |
| **EC-16** | Confirmation | User Dwells on Photo without Answering Confirmation | Medium | Implicit confirmation heuristic logs success if dwell time $> 15\text{s}$ with high-intent action (Share/Zoom). |

---

## 3. Deep Dive: "Still Not It?" Secondary Action Handling

### EC-07: User Clicks "Still not it?" on the Final Shortlist
* **Trigger**: The candidate pool narrowed to 2 photos (e.g. `53 → 18 → 6 → 2`). The UI shows: *"I think I found what you're looking for. 2 photos match the details you remembered."* The user inspects them, realizes neither is the intended photo, and taps **`Still not it?`**.
* **System Handling Logic**:
  1. The session state recognizes that the 2 current candidates are rejected.
  2. The system **relaxes the most restrictive soft filter** (e.g., expands the set back to the previous 6 candidates from Step 2, excluding the 2 rejected ones).
  3. The entropy calculator evaluates the remaining 4 candidates for unresolved attributes (e.g., `visualAttributes.paperType` or `location.category`).
  4. The next question slides in from the **LEFT** (250–400 ms):
     - *"Let's try another detail: What did the document look like?"*
     - Options: `[White paper]`, `[Pink slip]`, `[Printed form]`, `[I'm not sure]`.
  5. The questioning session continues seamlessly without losing prior context or forcing the user to retype their search.

### EC-08: "Still Not It?" with Zero Remaining Attribute Variance
* **Trigger**: User clicks *"Still not it?"*, but all remaining candidates share identical metadata (no further differentiating attributes exist).
* **System Handling Logic**:
  1. System stops generating redundant questions.
  2. Displays an honest, helpful message on the dynamic screen:
     - *"We've checked all available details for this memory. Here are all photos matching your search for manual browsing:"*
  3. Reflows the photo grid to show all candidates from that broader category, with a prominent **`[ Clear all filters ]`** button.

---

## 4. Deep Dive: Continuous Question Carousel & Micro-State Transitions

### EC-09: Rapid Multi-Tapping During Carousel Slide-In (250–400 ms)
* **Trigger**: User rapidly double-taps an option chip (`[Vomiting]`) or taps another option while the next question is sliding in from the left.
* **Failure Mode**: State desynchronization, double reduction calls, or corrupt counter badges (`53 → 18 → 18`).
* **Handling Strategy**:
  1. **Pointer Lock on Click**: The instant an option is tapped, the carousel container sets `pointer-events: none`.
  2. **Micro-State Lock (300–700 ms)**: `isProcessing = true` activates the Gemini sparkle shimmer (*"Looking for patterns across your photos..."*).
  3. **Unlock on Animation Complete**: `pointer-events` are restored only after the CSS transition (`transform: translateX(0)`) triggers its `transitionend` event.

### EC-10: Processing Micro-State Exceeding 700 ms Budget
* **Trigger**: A complex query or slower device causes local filtering to lag past 700 ms.
* **Handling Strategy**:
  1. The shimmer state is bound to a strict `setTimeout(..., 700)` fallback.
  2. If filtering computation is still in progress, the UI remains responsive, smoothly fading out the shimmer and rendering available candidate thumbnails progressively using CSS `content-visibility: auto`.

---

## 5. Deep Dive: Question Budget Boundary & Early Stopping

### EC-06: Question Budget Cap (Max 5 Questions)
* **Trigger**: The system has asked 5 questions, but 5 candidates still remain in the pool.
* **Handling Strategy**:
  1. The system enforces the **hard limit of 5 questions maximum**.
  2. Rather than asking a 6th question, the question carousel smoothly transitions out to the right.
  3. The **Shortlist View** is activated:
     - Header: *"Here are the 5 best matches for what you remembered:"*
     - Shows the top 3 cards prominently, with a clean scroll anchor to inspect the other 2 candidates below.

### EC-14: Missing or Incomplete Metadata Fields in Mock Library
* **Trigger**: A candidate photo in `photoLibrary.json` lacks an attribute being evaluated (e.g. `condition` is `undefined` or `location.category` is `null`).
* **Handling Strategy**:
  1. In the entropy engine, `null` and `undefined` are grouped into an internal `"Unspecified"` bucket.
  2. The system avoids generating an option chip named `"null"` or `"undefined"`. If `"Unspecified"` represents $> 40\%$ of the candidates, the engine discounts that attribute's information gain to avoid presenting an ambiguous question.

---

## 6. Deep Dive: Memory Fallibility & Filter Recovery

### EC-11: False Memory (User Selects Wrong Year or Condition)
* **Trigger**: The actual prescription was for **Vomiting**, but the user mistakenly selects **`[Fever]`**.
* **Handling Strategy**:
  1. **Soft Scoring**: The engine applies a positive score boost ($+0.8$) to candidates matching `Fever`, but does not permanently delete candidates matching other criteria (e.g. `Prescription` + `August 2024` + `Clinic`).
  2. If the user later realizes their mistake, removing the chip (`[Fever ✕]`) instantly recalculates candidate weights and restores the true prescription to the top of the grid.

### EC-12: Over-Filtering Resulting in 0 Matches
* **Trigger**: User selects a combination of chips with zero co-occurrences in the 100–150 mock dataset (e.g. `Prescription` + `Cold` + `Home` = 0).
* **Recovery UI Flow**:

```text
+---------------------------------------------------------------+
|  ⚠️ No photos found matching [Cold] at [Home]                 |
|  We relaxed [Home] so you can keep finding your photo.        |
|                                                               |
|  [ Undo last step ]          [ Reset all filters ]            |
+---------------------------------------------------------------+
```
  1. Never display a blank empty grid.
  2. Automatically drop the conflicting attribute (`Home`) and keep `Prescription` + `Cold`.
  3. Offer one-tap `Undo` to restore prior state.

### EC-13: Filter Chip Removal (`[Vomiting ✕]`)
* **Trigger**: User taps the `✕` on an active context chip.
* **Handling Strategy**:
  1. The selected filter is removed from `appliedFilters`.
  2. The candidate pool re-expands (e.g. `18 → 53`).
  3. The counter badge updates smoothly to `53 possible matches`.
  4. The question carousel slides in a question re-evaluating the expanded pool.

---

## 7. Deep Dive: Retrieval Confirmation & Telemetry Edge Cases

### EC-15: User Taps "No" on Confirmation Prompt
* **Trigger**: On Figma Screen 18, user opens a photo in the OLED dark viewer, sees the prompt *"Did you find what you were looking for?"*, and clicks **`[ No ]`**.
* **Handling Strategy**:
  1. Log `isSuccess: false` to session telemetry.
  2. Closes the viewer and returns to the dynamic grid.
  3. Displays a helpful banner:
     - *"Not the right one? Tap 'Still not it?' to try another clue, or browse other matches below."*
  4. Temporarily lowers the visual rank of the rejected photo to prevent repeat clicks.

### EC-16: Implicit Confirmation (Dwell Time & High-Intent Actions)
* **Trigger**: User opens the photo, spends 35 seconds zooming in and reading the doctor's handwriting, taps the native Google Photos **Share** button, but never clicks "Yes" on the confirmation prompt before exiting.
* **Handling Strategy**:
  1. If `dwellTimeSeconds >= 15` AND user performs high-intent action (`share`, `edit`, `zoom`):
     - The telemetry system logs `implicitSuccess: true`.
  2. This ensures the North Star Metric (*Successful Vague-Memory Retrieval Rate*) accurately captures real retrieval success without suffering from user survey fatigue.
