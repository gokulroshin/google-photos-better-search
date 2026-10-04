/**
 * Google Photos — Better Search MVP
 * Question Generator (Phase 2)
 * Converts high-entropy candidate attributes into conversational clarification questions.
 */

const QUESTION_TEMPLATES = {
  condition: {
    questionId: 'q_condition',
    prompt: 'What was the prescription for?',
    formatOption: val => val
  },
  year: {
    questionId: 'q_year',
    prompt: 'About when was this prescription?',
    formatOption: val => {
      if (String(val) === '2025') return 'Last year (2025)';
      if (String(val) === '2024') return '2024';
      if (String(val) <= '2023') return 'Earlier';
      return String(val);
    }
  },
  'location.category': {
    questionId: 'q_location_category',
    prompt: 'Do you remember where you were when you got it?',
    formatOption: val => val
  },
  'visualAttributes.paperType': {
    questionId: 'q_paper_type',
    prompt: 'What did the document look like?',
    formatOption: val => val
  },
  people: {
    questionId: 'q_people',
    prompt: 'Who was this doctor or family member?',
    formatOption: val => val
  }
};

/**
 * Fallback prompt generator for arbitrary non-prescription attributes
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
 * Generates a ClarificationQuestion object from the top-ranked attribute
 * @param {Object} rankedAttribute - Item from entropyCalculator.rankAttributes()
 * @param {number} step - Current question index (1 to 5)
 * @returns {Object} ClarificationQuestion
 */
export function generateQuestion(rankedAttribute, step = 1) {
  if (!rankedAttribute) return null;

  const { attribute, label, topValues } = rankedAttribute;
  const template = QUESTION_TEMPLATES[attribute] || {
    questionId: `q_${attribute.replace('.', '_')}`,
    prompt: getFallbackPrompt(attribute, label),
    formatOption: val => String(val)
  };

  // Format distinct options
  const formattedOptions = [];
  const seenOptions = new Set();

  for (const rawVal of topValues) {
    const optLabel = template.formatOption(rawVal);
    if (!seenOptions.has(optLabel)) {
      seenOptions.add(optLabel);
      formattedOptions.push(optLabel);
    }
  }

  // Ensure 3-5 options
  const options = formattedOptions.slice(0, 5);

  return {
    questionId: template.questionId,
    attribute,
    step: Math.min(step, 5),
    maxSteps: 5,
    prompt: template.prompt,
    options,
    allowNotSure: true,
    allowFreeText: true
  };
}
