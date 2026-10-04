/**
 * Google Photos — Better Search MVP
 * Question Generator (Phase 2)
 * Converts high-entropy candidate attributes into conversational clarification questions.
 */

const CATEGORY_PROMPTS = {
  Document: {
    condition: 'What was the prescription for?',
    year: 'About when was this prescription?',
    'location.category': 'Do you remember where you were when you got it?',
    'visualAttributes.paperType': 'What did the document look like?',
    people: 'Who was this doctor or family member?'
  },
  Food: {
    condition: 'What kind of food or meal was it?',
    year: 'About when did you have this meal?',
    'location.category': 'Where did you have this food?',
    'visualAttributes.paperType': 'What kind of dish was it?',
    people: 'Who were you dining or eating with?'
  },
  Travel: {
    condition: 'What kind of trip was this?',
    year: 'About when was this trip?',
    'location.category': 'What kind of destination or setting was it?',
    'visualAttributes.paperType': 'What did the view look like?',
    people: 'Who were you traveling with?'
  },
  People: {
    condition: 'What was the occasion or celebration?',
    year: 'About when was this photo taken?',
    'location.category': 'Where was this event or gathering held?',
    'visualAttributes.paperType': 'What was the photo style?',
    people: 'Who was in the photo or celebration?'
  },
  Pet: {
    condition: 'What was your pet doing?',
    year: 'About when was this photo taken?',
    'location.category': 'Where was your pet at the time?',
    'visualAttributes.paperType': 'What did the photo look like?',
    people: 'Which pet or person was in the photo?'
  },
  General: {
    condition: 'What was this for?',
    year: 'About when was this photo taken?',
    'location.category': 'Where was this photo taken?',
    'visualAttributes.paperType': 'What did it look like?',
    people: 'Who was in the photo or with you?'
  }
};

const OPTION_FORMATTERS = {
  year: val => {
    if (String(val) === '2025') return 'Last year (2025)';
    if (String(val) === '2024') return '2024';
    if (String(val) <= '2023') return 'Earlier';
    return String(val);
  }
};

/**
 * Detects the dominant content type from candidate photos
 */
export function detectDominantCategory(candidates = [], query = '') {
  if (Array.isArray(candidates) && candidates.length > 0) {
    const counts = {};
    for (const c of candidates) {
      const type = c.contentType || 'General';
      counts[type] = (counts[type] || 0) + 1;
    }
    let dominant = 'Document';
    let max = 0;
    for (const [type, count] of Object.entries(counts)) {
      if (count > max) {
        max = count;
        dominant = type;
      }
    }
    return dominant;
  }

  const q = String(query || '').toLowerCase();
  if (/food|dining|meal|lunch|dinner|breakfast|cafe|restaurant|coffee|dessert|pizza|dosa/.test(q)) return 'Food';
  if (/travel|trip|vacation|beach|flight|holiday|paris|goa|manali|lake/.test(q)) return 'Travel';
  if (/pet|dog|cat|puppy|kitten/.test(q)) return 'Pet';
  if (/people|party|celebration|friends|family|wedding|birthday|bbq/.test(q)) return 'People';
  return 'Document';
}

/**
 * Fallback prompt generator for arbitrary attributes
 */
function getFallbackPrompt(attribute, label) {
  switch (attribute) {
    case 'location.city':
      return 'Which city or place was this in?';
    case 'foodType':
      return 'What kind of food or meal was it?';
    default:
      return `Which ${label || 'detail'} do you recall?`;
  }
}

/**
 * Resolves the conversational question prompt based on dimension and candidate category
 */
export function getPromptForAttribute(attribute, dominantCategory = 'Document', label = '') {
  const catPrompts = CATEGORY_PROMPTS[dominantCategory] || CATEGORY_PROMPTS.Document;
  if (catPrompts && catPrompts[attribute]) {
    return catPrompts[attribute];
  }
  if (CATEGORY_PROMPTS.Document[attribute]) {
    return CATEGORY_PROMPTS.Document[attribute];
  }
  return getFallbackPrompt(attribute, label);
}

/**
 * Generates a ClarificationQuestion object from the top-ranked attribute
 * @param {Object} rankedAttribute - Item from entropyCalculator.rankAttributes()
 * @param {number} step - Current question index (1 to 5)
 * @param {Array} [candidates] - Current candidate assets to adapt prompt context
 * @param {string} [query] - Current query text
 * @returns {Object} ClarificationQuestion
 */
export function generateQuestion(rankedAttribute, step = 1, candidates = [], query = '') {
  if (!rankedAttribute) return null;

  const { attribute, label, topValues } = rankedAttribute;
  const dominantCategory = rankedAttribute.dominantCategory || detectDominantCategory(candidates, query);
  const prompt = getPromptForAttribute(attribute, dominantCategory, label);
  const formatOption = OPTION_FORMATTERS[attribute] || (val => String(val));
  const questionId = `q_${attribute.replace('.', '_')}`;

  // Format distinct options
  const formattedOptions = [];
  const seenOptions = new Set();

  for (const rawVal of topValues) {
    const optLabel = formatOption(rawVal);
    if (!seenOptions.has(optLabel)) {
      seenOptions.add(optLabel);
      formattedOptions.push(optLabel);
    }
  }

  // Ensure 3-5 options
  const options = formattedOptions.slice(0, 5);

  return {
    questionId,
    attribute,
    step: Math.min(step, 5),
    maxSteps: 5,
    prompt,
    options,
    allowNotSure: true,
    allowFreeText: true
  };
}
