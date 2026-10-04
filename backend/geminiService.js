require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-3.8-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

// In-memory cache for parsed prompts
const parsingCache = new Map();

/**
 * Heuristic fallback for query parsing when Gemini API is unavailable or offline
 */
function heuristicParseQuery(query) {
  const q = (query || '').toLowerCase();
  const clues = {
    query: query || '',
    contentType: null,
    documentSubType: null,
    condition: null,
    year: null,
    locationCategory: null,
    paperType: null,
    people: []
  };

  if (q.includes('prescription') || q.includes('rx') || q.includes('medicine') || q.includes('doctor')) {
    clues.contentType = 'Document';
    clues.documentSubType = 'Prescription';
  } else if (q.includes('receipt') || q.includes('bill') || q.includes('invoice')) {
    clues.contentType = 'Document';
    clues.documentSubType = 'Receipt';
  }

  // Conditions
  if (q.includes('vomit')) clues.condition = 'Vomiting';
  else if (q.includes('fever')) clues.condition = 'Fever';
  else if (q.includes('cold') || q.includes('cough')) clues.condition = 'Cold';
  else if (q.includes('pain') || q.includes('ache')) clues.condition = 'Pain';
  else if (q.includes('skin') || q.includes('rash')) clues.condition = 'Skin';

  // Year
  if (q.includes('2025') || q.includes('last year')) clues.year = 2025;
  else if (q.includes('2024')) clues.year = 2024;
  else if (q.includes('2023') || q.includes('earlier')) clues.year = 2023;

  // Location
  if (q.includes('clinic')) clues.locationCategory = 'Clinic';
  else if (q.includes('hospital')) clues.locationCategory = 'Hospital';
  else if (q.includes('home')) clues.locationCategory = 'Home';
  else if (q.includes('beach')) clues.locationCategory = 'Beach';

  // Paper type
  if (q.includes('pink')) clues.paperType = 'Pink slip';
  else if (q.includes('white')) clues.paperType = 'White paper';
  else if (q.includes('printed')) clues.paperType = 'Printed form';
  else if (q.includes('pad')) clues.paperType = 'Prescription pad';

  // People
  if (q.includes('dr. rao') || q.includes('rao')) clues.people.push('Dr. Rao');
  if (q.includes('pradeep')) clues.people.push('Pradeep');

  return clues;
}

/**
 * Heuristic fallback for free-text refinement clue
 */
function heuristicParseRefinementClue(clueText, currentAttribute) {
  const text = (clueText || '').toLowerCase();

  // Condition matches
  if (text.includes('vomit')) return { dimension: 'condition', value: 'Vomiting', label: 'Vomiting' };
  if (text.includes('fever') || text.includes('temperature')) return { dimension: 'condition', value: 'Fever', label: 'Fever' };
  if (text.includes('cold') || text.includes('cough') || text.includes('flu')) return { dimension: 'condition', value: 'Cold', label: 'Cold' };
  if (text.includes('pain') || text.includes('back') || text.includes('sprain')) return { dimension: 'condition', value: 'Pain', label: 'Pain' };
  if (text.includes('skin') || text.includes('rash') || text.includes('allergy')) return { dimension: 'condition', value: 'Skin', label: 'Skin' };

  // Year matches
  if (text.includes('2025') || text.includes('last year')) return { dimension: 'year', value: 2025, label: 'Last year (2025)' };
  if (text.includes('2024')) return { dimension: 'year', value: 2024, label: '2024' };
  if (text.includes('2023') || text.includes('earlier') || text.includes('years ago')) return { dimension: 'year', value: 2023, label: 'Earlier' };

  // Location category
  if (text.includes('clinic')) return { dimension: 'location.category', value: 'Clinic', label: 'Clinic' };
  if (text.includes('hospital')) return { dimension: 'location.category', value: 'Hospital', label: 'Hospital' };
  if (text.includes('home') || text.includes('house')) return { dimension: 'location.category', value: 'Home', label: 'Home' };
  if (text.includes('beach') || text.includes('coast') || text.includes('ocean')) return { dimension: 'location.category', value: 'Beach', label: 'Beach' };
  if (text.includes('park') || text.includes('garden')) return { dimension: 'location.category', value: 'Park', label: 'Park' };

  // Paper type
  if (text.includes('pink')) return { dimension: 'visualAttributes.paperType', value: 'Pink slip', label: 'Pink slip' };
  if (text.includes('white')) return { dimension: 'visualAttributes.paperType', value: 'White paper', label: 'White paper' };
  if (text.includes('printed') || text.includes('computer')) return { dimension: 'visualAttributes.paperType', value: 'Printed form', label: 'Printed form' };
  if (text.includes('pad') || text.includes('handwritten')) return { dimension: 'visualAttributes.paperType', value: 'Prescription pad', label: 'Prescription pad' };

  // Doctor/People
  if (text.includes('rao')) return { dimension: 'people', value: 'Dr. Rao', label: 'Dr. Rao' };
  if (text.includes('pradeep')) return { dimension: 'people', value: 'Pradeep', label: 'Pradeep' };

  // Fallback to active attribute if present
  if (currentAttribute) {
    return {
      dimension: currentAttribute,
      value: clueText.trim(),
      label: clueText.trim()
    };
  }

  return {
    dimension: 'freeText',
    value: clueText.trim(),
    label: clueText.trim()
  };
}

/**
 * Call Gemini API with JSON output mode and a 5-second abort timeout
 */
async function callGemini(promptText) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textPart = candidate?.content?.parts?.[0]?.text;

    if (!textPart) {
      throw new Error('No text generated by Gemini');
    }

    return JSON.parse(textPart);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Parse an initial user query into structured clues
 * @param {string} query
 * @returns {Promise<Object>} Extracted clues
 */
async function parseSearchQuery(query) {
  if (!query || !query.trim()) {
    return heuristicParseQuery('');
  }

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  if (parsingCache.has(cacheKey)) {
    return parsingCache.get(cacheKey);
  }

  const prompt = `
You are the natural language intent parser for Google Photos "Better Search".
Analyze this user query: "${query}"

Extract structured memory attributes into valid JSON with this exact schema:
{
  "query": "string (cleaned search keywords e.g. prescription, trip, receipt)",
  "contentType": "string or null ('Document', 'Photo', 'Screenshot')",
  "documentSubType": "string or null ('Prescription', 'Receipt', 'Bill')",
  "condition": "string or null ('Vomiting', 'Fever', 'Cold', 'Pain', 'Skin')",
  "year": "number or null (e.g. 2023, 2024, 2025)",
  "locationCategory": "string or null ('Clinic', 'Hospital', 'Home', 'Beach', 'Park', etc.)",
  "paperType": "string or null ('Pink slip', 'White paper', 'Printed form', 'Prescription pad')",
  "people": ["array of names detected or empty array"]
}
`;

  try {
    const result = await callGemini(prompt);
    parsingCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[GeminiService] parseSearchQuery falling back to heuristic:', err.message);
    const fallback = heuristicParseQuery(query);
    parsingCache.set(cacheKey, fallback);
    return fallback;
  }
}

/**
 * Parse a free-text memory refinement clue into a structured filter predicate
 * @param {string} clueText
 * @param {string} currentAttribute
 * @returns {Promise<Object>} Filter predicate { dimension, value, label }
 */
async function parseRefinementClue(clueText, currentAttribute = null) {
  if (!clueText || !clueText.trim()) {
    return heuristicParseRefinementClue('', currentAttribute);
  }

  const cacheKey = `refine_${currentAttribute || 'any'}_${clueText.trim().toLowerCase()}`;
  if (parsingCache.has(cacheKey)) {
    return parsingCache.get(cacheKey);
  }

  const prompt = `
You are the natural language memory parser for Google Photos Clarification Carousel.
The user was asked about attribute "${currentAttribute || 'photo memory'}" and typed: "${clueText}"

Identify what memory dimension and target value they specified.
Available dimensions:
- "condition": values like "Vomiting", "Fever", "Cold", "Pain", "Skin"
- "year": number like 2023, 2024, 2025
- "location.category": values like "Clinic", "Hospital", "Home", "Beach", "Park"
- "visualAttributes.paperType": values like "Pink slip", "White paper", "Printed form", "Prescription pad"
- "people": doctor or person name like "Dr. Rao", "Pradeep"

Return valid JSON with this exact schema:
{
  "dimension": "string (the matching dimension, or 'description' if general)",
  "value": "string or number (the extracted value)",
  "label": "string (concise label for filter chip, max 20 chars)"
}
`;

  try {
    const result = await callGemini(prompt);
    parsingCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('[GeminiService] parseRefinementClue falling back to heuristic:', err.message);
    const fallback = heuristicParseRefinementClue(clueText, currentAttribute);
    parsingCache.set(cacheKey, fallback);
    return fallback;
  }
}

module.exports = {
  parseSearchQuery,
  parseRefinementClue,
  heuristicParseQuery,
  heuristicParseRefinementClue
};
