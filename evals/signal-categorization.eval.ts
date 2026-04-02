/**
 * Eval: Signal Categorization
 * Tests that Claude Haiku correctly categorizes macro signals.
 */

type SignalCategory = 'labor_market' | 'monetary_policy' | 'fiscal_policy' | 'industry_trend' | 'geopolitical' | 'technology' | 'other';

interface EvalCase {
  input: string;
  expectedCategory: SignalCategory;
  expectedSentiment: 'positive' | 'negative' | 'neutral';
}

export const signalCategorizationCases: EvalCase[] = [
  {
    input: 'Tech layoffs surge: Microsoft cuts 1,000 roles in engineering divisions',
    expectedCategory: 'labor_market',
    expectedSentiment: 'negative',
  },
  {
    input: 'Fed holds rates steady at 5.25% as inflation cools to 2.1%',
    expectedCategory: 'monetary_policy',
    expectedSentiment: 'neutral',
  },
  {
    input: 'AI startup funding hits record $12B quarter as enterprise adoption accelerates',
    expectedCategory: 'industry_trend',
    expectedSentiment: 'positive',
  },
  {
    input: 'BLS: Software developer unemployment rate rises to 3.8% from 2.1% year ago',
    expectedCategory: 'labor_market',
    expectedSentiment: 'negative',
  },
  {
    input: 'Amazon Web Services announces 10,000 new cloud infrastructure jobs',
    expectedCategory: 'labor_market',
    expectedSentiment: 'positive',
  },
];

/**
 * Run signal categorization evals.
 * Usage: npx tsx evals/signal-categorization.eval.ts
 */
async function runEvals() {
  console.log(`Running ${signalCategorizationCases.length} signal categorization evals...\n`);

  let passed = 0;
  for (const testCase of signalCategorizationCases) {
    // Placeholder: replace with actual Claude haiku call via lib/prompts.ts
    console.log(`[TODO] Eval: "${testCase.input.slice(0, 60)}..."`);
    console.log(`  Expected category: ${testCase.expectedCategory}`);
    console.log(`  Expected sentiment: ${testCase.expectedSentiment}\n`);
    passed++;
  }

  console.log(`Evals complete: ${passed}/${signalCategorizationCases.length} defined`);
}

runEvals().catch(console.error);
