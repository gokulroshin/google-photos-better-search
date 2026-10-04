# Google Photos — Better Search (AI-Native Memory Retrieval MVP)

An AI-native retrieval prototype inspired by **Google Photos** that bridges the cognitive gap between human episodic memory and machine search. When users search for an old photo or document, they remember vague, sensory, situational, or contextual fragments rather than exact keywords.

**Better Search** progressively bridges this gap by prioritizing recall over precision initially (~50–55 photos), calculating attribute entropy to ask the single most useful missing clue, and narrowing down candidate photos dynamically on **ONE dynamic mobile screen**.

---

## 🌟 Key Product Features

1. **One Dynamic Screen Architecture**: Strictly zero page navigations or routes. A single reactive state-driven mobile interface (`390px` width) shifts states seamlessly.
2. **Dynamic Entropy-Driven Clarification**: Shannon entropy algorithm calculates variance across unresolved attributes (`condition`, `year`, `location.category`, `paperType`, etc.) to ask the highest information-gain question.
3. **Fluid Question Carousel**: Questions slide in smoothly from the **LEFT** (250–400 ms) while the photo grid reflows and result count updates.
4. **Processing Micro-State**: Snappy 300–700 ms Gemini sparkle pulse (*"Looking for patterns across your photos…"*) between narrowing steps.
5. **Early-Stop & Guardrails**:
   - Stops questioning early once candidates $\le 3$.
   - Hard budget cap at $\le 5$ questions.
   - Graceful uncertainty handling with *"I'm not sure"* (pivots to orthogonal clue without losing candidates).
   - *"Still not it?"* recovery path to resume questioning.
   - Auto-relaxation recovery on over-filtering (EC-12).
6. **OLED Immersive Viewer & North Star Metric Logging**: Tap any photo to open full-screen detail view with Google Photos actions and *"Did you find what you were looking for? [Yes] [No]"* logging to `/api/confirm`.
7. **Hybrid Architecture**: Fast local deterministic filtering for zero-latency UI interactions + backend Gemini 1.5/2.0 API for open-ended natural language memory parsing.

---

## 🚀 Quick Start & Running Locally

### Prerequisites
- Node.js (v18+)
- npm

### 1. Run the Backend API Server
```bash
cd backend
npm install
npm start
```
- Server runs on: `http://localhost:8080`
- Health check: `http://localhost:8080/health`
- Telemetry summary: `http://localhost:8080/api/telemetry`

### 2. Run the Frontend Development Server
```bash
cd frontend
npm install
npm run dev
```
- Web App runs on: `http://localhost:5173`

---

## 🧪 Testing & Validation

Run the comprehensive test suites across the engine, interactive flow, telemetry, and edge cases:

```bash
cd frontend
npm test
```

Or run individual suites:
- `npm run test:engine` — Shannon entropy, attribute ranking, early-stop logic
- `npm run test:flow` — Primary demo journey walkthrough (`53 → 18 → 6 → 2`), chip removal, pivot
- `npm run test:telemetry` — North Star metric confirmation logging and payload validation
- `npm run test:edge` — EC-05 (consecutive not sure), EC-09 (rapid tapping), EC-12 (over-filtering), EC-14 (null metadata)

Validate dataset integrity:
```bash
node scripts/validate_dataset.js
```

---

## 📱 Interactive Demo Walkthrough

Try the primary demo search query:
1. Search **`"prescription"`** in the search bar $\rightarrow$ Broad candidate pool of **53 matches** appears.
2. **Question 1**: *"What was the prescription for?"* $\rightarrow$ Select **`[Vomiting]`** $\rightarrow$ Narrows to **18 matches**.
3. **Question 2 (slides in from LEFT)**: *"About when was this prescription?"* $\rightarrow$ Select **`[2024]`** $\rightarrow$ Narrows to **6 matches**.
4. **Question 3 (slides in from LEFT)**: *"Do you remember where you were?"* $\rightarrow$ Select **`[Clinic]`** $\rightarrow$ Narrows to **2 matches** $\rightarrow$ Early-stop triggers!
5. Tap one of the candidate photos $\rightarrow$ Immersive OLED viewer opens $\rightarrow$ Tap **`[Yes]`** to confirm successful retrieval and record the North Star metric.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React (Vite), Material You design tokens, CSS Transitions & GPU-accelerated transforms, HTML5 semantic elements.
- **Backend**: Node.js, Express, REST API, In-Memory Session & Telemetry Store.
- **AI Integration**: Google Gemini API for free-text semantic clue extraction (`GEMINI_API_KEY`).
- **Data**: 120 curated mock photo assets with structured metadata, OCR text, and semantic tags.
