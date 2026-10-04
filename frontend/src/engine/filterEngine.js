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
 * Matches a candidate against a text search query
 */
export function matchesQuery(asset, query) {
  if (!query || !query.trim()) return true;
  const q = normalizeText(query);
  const terms = q.split(/\s+/).filter(Boolean);

  // Exact semantic tag match
  if (asset.semanticTags && asset.semanticTags.some(tag => tag.toLowerCase() === q)) {
    return true;
  }

  // Pre-compiled search corpus for asset
  const searchCorpus = [
    asset.title,
    asset.contentType,
    asset.documentSubType,
    asset.condition,
    asset.ocrText,
    asset.description,
    asset.approxDateLabel,
    asset.location?.city,
    asset.location?.placeName,
    asset.location?.category,
    asset.visualAttributes?.paperType,
    ...(asset.people || []),
    ...(asset.semanticTags || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Every search term should match somewhere in the corpus
  return terms.every(term => searchCorpus.includes(term));
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
