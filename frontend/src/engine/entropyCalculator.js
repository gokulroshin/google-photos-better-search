/**
 * Google Photos — Better Search MVP
 * Entropy Calculator (Phase 2)
 * Computes Shannon Information Gain across unresolved candidate attributes.
 */

// Available candidate dimensions to evaluate for dynamic questioning
export const EVALUABLE_DIMENSIONS = [
  {
    key: 'condition',
    label: 'Medical Condition',
    extractor: asset => asset.condition || null
  },
  {
    key: 'year',
    label: 'Year / Approximate Date',
    extractor: asset => (asset.year ? String(asset.year) : null)
  },
  {
    key: 'location.category',
    label: 'Location Setting',
    extractor: asset => asset.location?.category || null
  },
  {
    key: 'visualAttributes.paperType',
    label: 'Visual Appearance / Paper Type',
    extractor: asset => asset.visualAttributes?.paperType || null
  },
  {
    key: 'people',
    label: 'People Involved',
    extractor: asset => {
      if (!asset.people || !Array.isArray(asset.people) || asset.people.length === 0) {
        return null;
      }
      // Pick first non-user person if available (Pradeep is the photo library owner)
      const otherPerson = asset.people.find(p => p !== 'Pradeep');
      return otherPerson || null;
    }
  }
];

/**
 * Calculates Shannon Entropy for an array of category counts
 * H(A) = - sum( P(v) * log2(P(v)) )
 */
export function calculateShannonEntropy(counts, total) {
  if (!total || total <= 0) return 0;
  let entropy = 0;
  for (const count of Object.values(counts)) {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

/**
 * Evaluates variance and Shannon entropy for all unresolved candidate attributes
 * @param {Array} candidates - Current candidate subset
 * @param {Array<string>} answeredDimensions - Dimensions already filtered or answered
 * @param {Array<string>} unanswerableDimensions - Dimensions marked "I'm not sure"
 * @returns {Array} Ranked list of attributes sorted by descending information gain
 */
export function rankAttributes(candidates, answeredDimensions = [], unanswerableDimensions = []) {
  if (!Array.isArray(candidates) || candidates.length <= 1) {
    return [];
  }

  const answeredSet = new Set(answeredDimensions);
  const unanswerableSet = new Set(unanswerableDimensions);
  const totalCandidates = candidates.length;

  const results = [];

  for (const dim of EVALUABLE_DIMENSIONS) {
    // Skip if already answered or explicitly skipped by user
    if (answeredSet.has(dim.key) || unanswerableSet.has(dim.key)) {
      continue;
    }

    const valueCounts = {};
    let nonNullCount = 0;

    for (const asset of candidates) {
      const val = dim.extractor(asset);
      if (val !== null && val !== undefined && String(val).trim() !== '') {
        const normVal = String(val).trim();
        valueCounts[normVal] = (valueCounts[normVal] || 0) + 1;
        nonNullCount++;
      }
    }

    const distinctValues = Object.keys(valueCounts);

    // If 0 or only 1 distinct value exists, entropy is 0 (cannot split candidates)
    if (distinctValues.length <= 1) {
      continue;
    }

    // Sort distinct values by frequency descending (top 3-5 chips)
    distinctValues.sort((a, b) => valueCounts[b] - valueCounts[a]);

    // Compute raw Shannon entropy over populated values
    const rawEntropy = calculateShannonEntropy(valueCounts, nonNullCount);

    // Top-5 coverage mass: In mobile UX with max 5 option chips, an attribute whose
    // top 5 values only cover a small fraction of items has poor question utility.
    const top5Values = distinctValues.slice(0, 5);
    const top5Count = top5Values.reduce((sum, v) => sum + (valueCounts[v] || 0), 0);
    const top5Coverage = nonNullCount > 0 ? (top5Count / nonNullCount) : 0;

    // EC-14: Penalty for missing/null values if coverage is low across candidate set
    const coverage = nonNullCount / totalCandidates;
    let effectiveEntropy = rawEntropy * top5Coverage;

    if (coverage < 0.6) {
      // More than 40% missing values reduces attribute priority
      effectiveEntropy = effectiveEntropy * (coverage * coverage);
    }

    // High singleton ratio penalty: Attributes where almost every candidate has a distinct value
    // (e.g. 5 distinct doctor names for 6 patients) are open-ended entity identifiers, not grouping categories.
    const singletonRatio = distinctValues.length / nonNullCount;
    if (singletonRatio > 0.6 && distinctValues.length > 2) {
      effectiveEntropy = effectiveEntropy * 0.5;
    }

    results.push({
      attribute: dim.key,
      label: dim.label,
      entropy: effectiveEntropy,
      rawEntropy,
      coverage,
      top5Coverage,
      valueCounts,
      topValues: top5Values,
      distinctCount: distinctValues.length
    });
  }

  // Sort by effective entropy descending (highest information gain first)
  results.sort((a, b) => b.entropy - a.entropy);

  return results;
}
