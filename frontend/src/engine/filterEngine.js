/**
 * Google Photos — Better Search MVP
 * Filter Engine (Phase 2)
 * High-performance deterministic candidate filtering over mock library assets.
 */

/**
 * Normalizes query string for fuzzy/substring search
 */
function normalizeText(text) {
  if (!text) return '';
  return String(text).toLowerCase().trim();
}

/**
 * Set of lifestyle and photographic search concepts that should NOT
 * match Document assets purely via incidental OCR or description notes
 * (e.g. 'take after food' or 'avoid oily food' on a prescription).
 */
const NON_DOC_VISUAL_TERMS = new Set([
  'food', 'foods', 'meal', 'meals', 'dish', 'dishes', 'breakfast', 'lunch', 'dinner',
  'snack', 'snacks', 'dessert', 'desserts', 'cuisine', 'dosa', 'pizza', 'pasta', 'ramen', 'burger',
  'beach', 'beaches', 'sunset', 'sunsets', 'sunrise', 'ocean', 'sea', 'sand',
  'cat', 'cats', 'dog', 'dogs', 'pet', 'pets', 'puppy', 'kitten',
  'car', 'cars', 'shoes', 'shoe', 'hiking', 'hike', 'travel', 'trip', 'vacation', 'holiday',
  'nature', 'mountain', 'mountains', 'lake', 'waterfall', 'concert', 'party'
]);

/**
 * Terms indicating explicit document / medical intent
 */
const DOC_INTENT_TERMS = new Set([
  'prescription', 'prescriptions', 'rx', 'doctor', 'dr', 'medicine', 'medicines',
  'medication', 'medications', 'clinic', 'hospital', 'receipt', 'bill', 'invoice',
  'report', 'poisoning', 'medical', 'pharma', 'pharmacy', 'vomiting', 'fever',
  'cold', 'cough', 'pain', 'skin', 'dose', 'dosage', 'tablet', 'discharge', 'printed', 'slip'
]);

/**
 * Query term alias expansion for natural search
 */
const QUERY_ALIASES = {
  trip: ['travel', 'trip', 'vacation'],
  trips: ['travel', 'trip', 'vacation'],
  vacation: ['travel', 'trip', 'vacation'],
  vacations: ['travel', 'trip', 'vacation'],
  holiday: ['travel', 'trip', 'holiday'],
  holidays: ['travel', 'trip', 'holiday'],
  rx: ['prescription'],
  prescriptions: ['prescription'],
  medicine: ['prescription', 'medicine', 'medication'],
  medicines: ['prescription', 'medicine', 'medication'],
  kitty: ['cat'],
  kitten: ['cat'],
  puppy: ['dog']
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a word exists in text with whole-word boundary
 */
function matchesTermInText(text, term) {
  if (!text) return false;
  const pattern = new RegExp('\\b' + escapeRegex(term) + '(?:s|es)?\\b', 'i');
  return pattern.test(text);
}

function matchesAnyTermInText(text, terms) {
  return terms.some(t => matchesTermInText(text, t));
}

/**
 * Matches a candidate against a text search query
 */
export function matchesQuery(asset, query) {
  if (!query || !query.trim()) return true;
  const q = normalizeText(query);
  const rawTerms = q.split(/[\s,]+/).map(t => t.replace(/^[^\w]+|[^\w]+$/g, '')).filter(Boolean);

  if (rawTerms.length === 0) return true;

  // Exact semantic tag match
  if (asset.semanticTags && asset.semanticTags.some(tag => tag.toLowerCase() === q)) {
    return true;
  }

  const hasDocIntent = rawTerms.some(t => DOC_INTENT_TERMS.has(t));

  return rawTerms.every(term => {
    const candidateTerms = QUERY_ALIASES[term] || [term];

    // 1. Primary fields (Title, tags, contentType, category, condition, people, city)
    const primaryFields = [
      asset.title,
      asset.contentType,
      asset.documentSubType,
      asset.condition,
      asset.approxDateLabel,
      asset.location?.city,
      asset.location?.placeName,
      asset.location?.category,
      asset.visualAttributes?.paperType,
      ...(asset.people || []),
      ...(asset.semanticTags || [])
    ].filter(Boolean).join(' ');

    if (matchesAnyTermInText(primaryFields, candidateTerms)) {
      return true;
    }

    // 2. Secondary OCR & Description:
    // If asset is a Document and the user searched a lifestyle/visual photo term (e.g. 'food', 'cat'),
    // do NOT match documents based merely on incidental OCR instructions ('take with food')
    // unless the query explicitly indicates document/medical intent.
    if (asset.contentType === 'Document' && NON_DOC_VISUAL_TERMS.has(term) && !hasDocIntent) {
      return false;
    }

    const secondaryFields = [asset.ocrText, asset.description].filter(Boolean).join(' ');
    return matchesAnyTermInText(secondaryFields, candidateTerms);
  });
}

/**
 * Checks if a candidate satisfies a specific filter chip
 */
export function matchesFilter(asset, filter) {
  if (!filter || !filter.dimension) return true;
  const dim = filter.dimension;
  const targetVal = filter.value;

  switch (dim) {
    case 'condition':
      return asset.condition && asset.condition.toLowerCase() === String(targetVal).toLowerCase();

    case 'year': {
      if (typeof targetVal === 'number') {
        return asset.year === targetVal;
      }
      const strVal = String(targetVal).toLowerCase();
      if (strVal.includes('2025') || strVal.includes('last year')) {
        return asset.year === 2025;
      }
      if (strVal.includes('2024')) {
        return asset.year === 2024;
      }
      if (strVal.includes('earlier') || strVal.includes('2023')) {
        return asset.year <= 2023;
      }
      const parsedYear = parseInt(strVal, 10);
      return !isNaN(parsedYear) ? asset.year === parsedYear : true;
    }

    case 'location.category':
    case 'location': {
      if (!asset.location || !asset.location.category) return false;
      const cat = asset.location.category.toLowerCase();
      const target = String(targetVal).toLowerCase();
      if (target === 'somewhere else') {
        return cat !== 'clinic' && cat !== 'hospital' && cat !== 'home';
      }
      return cat === target;
    }

    case 'visualAttributes.paperType':
    case 'paperType': {
      if (!asset.visualAttributes || !asset.visualAttributes.paperType) return false;
      return asset.visualAttributes.paperType.toLowerCase() === String(targetVal).toLowerCase();
    }

    case 'people': {
      if (!asset.people || !Array.isArray(asset.people)) return false;
      return asset.people.some(p => p.toLowerCase() === String(targetVal).toLowerCase());
    }

    case 'contentType':
      return asset.contentType && asset.contentType.toLowerCase() === String(targetVal).toLowerCase();

    default: {
      // Generic nested property lookup
      const keys = dim.split('.');
      let val = asset;
      for (const k of keys) {
        if (val === undefined || val === null) return false;
        val = val[k];
      }
      return String(val).toLowerCase() === String(targetVal).toLowerCase();
    }
  }
}

/**
 * Filters all assets based on query and array of applied filters
 * @param {Array} allAssets - Full photo library
 * @param {string} query - Free text search query
 * @param {Array} appliedFilters - Active FilterChip objects
 * @returns {Array} Filtered candidate PhotoAsset objects
 */
export function filterCandidates(allAssets, query, appliedFilters = []) {
  if (!Array.isArray(allAssets)) return [];

  return allAssets.filter(asset => {
    // 1. Initial query match
    if (!matchesQuery(asset, query)) {
      return false;
    }

    // 2. All applied filter chips must match
    for (const filter of appliedFilters) {
      if (!matchesFilter(asset, filter)) {
        return false;
      }
    }

    return true;
  });
}
