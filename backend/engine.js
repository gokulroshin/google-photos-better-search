/**
 * Google Photos — Better Search MVP
 * Backend Clarification Engine (Phase 6)
 * Server-side implementation with full parity to frontend entropy and filter engine.
 */

const fs = require('fs');
const path = require('path');

const photoLibraryPath = path.join(__dirname, 'data', 'photoLibrary.json');
const allAssetsData = JSON.parse(fs.readFileSync(photoLibraryPath, 'utf8'));

// Candidate dimensions to evaluate for dynamic questioning
const EVALUABLE_DIMENSIONS = [
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
    extractor: asset => (asset.location && asset.location.category) || null
  },
  {
    key: 'visualAttributes.paperType',
    label: 'Visual Appearance / Paper Type',
    extractor: asset => (asset.visualAttributes && asset.visualAttributes.paperType) || null
  },
  {
    key: 'people',
    label: 'People Involved',
    extractor: asset => {
      if (!asset.people || !Array.isArray(asset.people) || asset.people.length === 0) {
        return null;
      }
      // Exclude Pradeep (the photo library owner)
      const otherPerson = asset.people.find(p => p !== 'Pradeep');
      return otherPerson || null;
    }
  }
];

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

function normalizeText(text) {
  if (!text) return '';
  return String(text).toLowerCase().trim();
}

function matchesQuery(asset, query) {
  if (!query || !query.trim()) return true;
  const q = normalizeText(query);
  const terms = q.split(/\s+/).filter(Boolean);

  if (asset.semanticTags && asset.semanticTags.some(tag => tag.toLowerCase() === q)) {
    return true;
  }

  const searchCorpus = [
    asset.title,
    asset.contentType,
    asset.documentSubType,
    asset.condition,
    asset.ocrText,
    asset.description,
    asset.approxDateLabel,
    asset.location && asset.location.city,
    asset.location && asset.location.placeName,
    asset.location && asset.location.category,
    asset.visualAttributes && asset.visualAttributes.paperType,
    ...(asset.people || []),
    ...(asset.semanticTags || [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return terms.every(term => searchCorpus.includes(term));
}

function matchesFilter(asset, filter) {
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
    case 'locationCategory':
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
      return asset.people.some(p => p.toLowerCase().includes(String(targetVal).toLowerCase()));
    }

    case 'description':
    case 'freeText': {
      const q = normalizeText(targetVal);
      const corpus = `${asset.description || ''} ${asset.ocrText || ''} ${(asset.semanticTags || []).join(' ')}`.toLowerCase();
      return corpus.includes(q);
    }

    default: {
      const propVal = asset[dim];
      if (propVal !== undefined) {
        return String(propVal).toLowerCase() === String(targetVal).toLowerCase();
      }
      return true;
    }
  }
}

function filterCandidates(allAssets, query, appliedFilters = []) {
  return allAssets.filter(asset => {
    if (!matchesQuery(asset, query)) return false;
    for (const filter of appliedFilters) {
      if (!matchesFilter(asset, filter)) return false;
    }
    return true;
  });
}

function calculateShannonEntropy(counts, total) {
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

function rankAttributes(candidates, answeredDimensions = [], unanswerableDimensions = []) {
  if (!Array.isArray(candidates) || candidates.length <= 1) {
    return [];
  }

  const answeredSet = new Set(answeredDimensions);
  const unanswerableSet = new Set(unanswerableDimensions);
  const totalCandidates = candidates.length;

  const results = [];

  for (const dim of EVALUABLE_DIMENSIONS) {
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

    if (distinctValues.length <= 1) {
      continue;
    }

    distinctValues.sort((a, b) => valueCounts[b] - valueCounts[a]);

    const rawEntropy = calculateShannonEntropy(valueCounts, nonNullCount);

    const top5Values = distinctValues.slice(0, 5);
    const top5Count = top5Values.reduce((sum, v) => sum + (valueCounts[v] || 0), 0);
    const top5Coverage = nonNullCount > 0 ? top5Count / nonNullCount : 0;

    const coverage = nonNullCount / totalCandidates;
    let effectiveEntropy = rawEntropy * top5Coverage;

    if (coverage < 0.6) {
      effectiveEntropy = effectiveEntropy * (coverage * coverage);
    }

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

  results.sort((a, b) => b.entropy - a.entropy);
  return results;
}

function generateQuestion(rankedAttribute, step = 1) {
  if (!rankedAttribute) return null;

  const { attribute, label, topValues } = rankedAttribute;
  const template = QUESTION_TEMPLATES[attribute] || {
    questionId: `q_${attribute.replace('.', '_')}`,
    prompt: `Which ${label || 'detail'} do you recall?`,
    formatOption: val => String(val)
  };

  const formattedOptions = [];
  const seenOptions = new Set();

  for (const rawVal of topValues) {
    const optLabel = template.formatOption(rawVal);
    if (!seenOptions.has(optLabel)) {
      seenOptions.add(optLabel);
      formattedOptions.push(optLabel);
    }
  }

  return {
    questionId: template.questionId,
    attribute,
    step: Math.min(step, 5),
    maxSteps: 5,
    prompt: template.prompt,
    options: formattedOptions.slice(0, 5),
    allowNotSure: true,
    allowFreeText: true
  };
}

function runClarificationPipeline({
  allAssets = allAssetsData,
  query,
  appliedFilters = [],
  answeredDimensions = [],
  unanswerableDimensions = [],
  questionIndex = 1,
  previousCount = null
}) {
  const candidates = filterCandidates(allAssets, query, appliedFilters);
  const candidateCount = candidates.length;

  const answeredSet = new Set(answeredDimensions);
  appliedFilters.forEach(f => {
    if (f.dimension) answeredSet.add(f.dimension);
  });

  let reductionLabel = `${candidateCount} possible matches`;
  if (previousCount !== null && previousCount !== candidateCount) {
    reductionLabel = `${previousCount} → ${candidateCount} matches`;
  }

  if (candidateCount <= 3) {
    return {
      candidates,
      candidateCount,
      previousCount,
      reductionLabel,
      isEarlyStop: true,
      earlyStopReason: 'isolated',
      nextQuestion: null
    };
  }

  if (questionIndex > 5) {
    return {
      candidates,
      candidateCount,
      previousCount,
      reductionLabel,
      isEarlyStop: true,
      earlyStopReason: 'budget_exhausted',
      nextQuestion: null
    };
  }

  const rankedAttrs = rankAttributes(candidates, Array.from(answeredSet), unanswerableDimensions);

  if (rankedAttrs.length === 0) {
    return {
      candidates,
      candidateCount,
      previousCount,
      reductionLabel,
      isEarlyStop: true,
      earlyStopReason: 'no_variance',
      nextQuestion: null
    };
  }

  const nextQuestion = generateQuestion(rankedAttrs[0], questionIndex);

  return {
    candidates,
    candidateCount,
    previousCount,
    reductionLabel,
    isEarlyStop: false,
    earlyStopReason: null,
    nextQuestion
  };
}

module.exports = {
  allAssetsData,
  filterCandidates,
  matchesQuery,
  matchesFilter,
  calculateShannonEntropy,
  rankAttributes,
  generateQuestion,
  runClarificationPipeline
};
