/**
 * Eval: Recommendation Quality
 * Tests that Claude Sonnet recommendations are specific, actionable, and signal-grounded.
 */

interface RecommendationQualityCheck {
  name: string;
  description: string;
  check: (recommendation: string) => boolean;
}

export const qualityChecks: RecommendationQualityCheck[] = [
  {
    name: 'no_hedging',
    description: 'Recommendation must not use hedging language (might, could, maybe, perhaps)',
    check: (rec) => !/(might|could consider|maybe|perhaps|it depends)/i.test(rec),
  },
  {
    name: 'specific_names',
    description: 'Recommendation must include specific company, role, or skill names — not generalities',
    check: (rec) => rec.length > 100, // proxy: short recs are usually too vague
  },
  {
    name: 'signal_reference',
    description: 'Recommendation must reference at least one signal headline or data point',
    check: (rec) => /according to|based on|signal|report|data|study|index/i.test(rec),
  },
  {
    name: 'income_mentioned',
    description: 'Recommendation must address income trajectory',
    check: (rec) => /income|salary|compensation|pay|earnings|\$/i.test(rec),
  },
];

/**
 * Evaluate a recommendation string against quality rubric.
 */
export function evaluateRecommendation(recommendation: string): {
  passed: number;
  total: number;
  failures: string[];
} {
  const failures: string[] = [];
  for (const check of qualityChecks) {
    if (!check.check(recommendation)) {
      failures.push(`FAIL [${check.name}]: ${check.description}`);
    }
  }
  return {
    passed: qualityChecks.length - failures.length,
    total: qualityChecks.length,
    failures,
  };
}

// Example usage
const sampleRec = `
Based on the Anthropic Economic Index signal showing 67% exposure for software developers,
you should accelerate your skills in AI/ML infrastructure (specifically MLOps and model serving).
Target roles at companies like Databricks, Scale AI, or Anyscale where demand is growing 40% YoY.
This positions you for $180K–$220K TC within 18 months vs. your current trajectory of $145K.
`;

const result = evaluateRecommendation(sampleRec);
console.log(`Recommendation quality: ${result.passed}/${result.total}`);
if (result.failures.length) console.log(result.failures.join('\n'));
