import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { computeBriefDiff } from "@/lib/data/brief-diff";

type RecommendationRow = {
  biggestOpportunities: string[];
  biggestRisks: string[];
  skillsToAccelerate: { skill: string; reason: string; urgency: string }[];
};

// ── Unit tests ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function main() {
// Test 1: identical briefs → no diff
console.log("\nTest 1: identical briefs → no diff");
{
  const rec: RecommendationRow = {
    biggestOpportunities: ["Opportunity A", "Opportunity B"],
    biggestRisks: ["Risk X"],
    skillsToAccelerate: [{ skill: "Python", reason: "high demand", urgency: "now" }],
  };
  const diff = computeBriefDiff(rec, rec);
  assert("newOpportunities is empty", diff.newOpportunities.length === 0);
  assert("removedOpportunities is empty", diff.removedOpportunities.length === 0);
  assert("newRisks is empty", diff.newRisks.length === 0);
  assert("newSkills is empty", diff.newSkills.length === 0);
}

// Test 2: new opportunity added, old one removed
console.log("\nTest 2: opportunity change");
{
  const current: RecommendationRow = {
    biggestOpportunities: ["Opportunity A", "Opportunity C (new)"],
    biggestRisks: ["Risk X"],
    skillsToAccelerate: [{ skill: "Python", reason: "", urgency: "now" }],
  };
  const previous = {
    biggestOpportunities: ["Opportunity A", "Opportunity B (old)"],
    biggestRisks: ["Risk X"],
    skillsToAccelerate: [{ skill: "Python" }],
  };
  const diff = computeBriefDiff(current, previous);
  assert("detects 1 new opportunity", diff.newOpportunities.length === 1);
  assert("new opportunity is correct", diff.newOpportunities[0] === "Opportunity C (new)");
  assert("detects 1 removed opportunity", diff.removedOpportunities.length === 1);
  assert("removed opportunity is correct", diff.removedOpportunities[0] === "Opportunity B (old)");
}

// Test 3: skill change
console.log("\nTest 3: skill change");
{
  const current: RecommendationRow = {
    biggestOpportunities: ["Opp A"],
    biggestRisks: [],
    skillsToAccelerate: [
      { skill: "Python", reason: "", urgency: "now" },
      { skill: "Rust", reason: "", urgency: "6mo" },
    ],
  };
  const previous = {
    biggestOpportunities: ["Opp A"],
    biggestRisks: [],
    skillsToAccelerate: [{ skill: "Python" }, { skill: "Go" }],
  };
  const diff = computeBriefDiff(current, previous);
  assert("detects 1 new skill (Rust)", diff.newSkills.length === 1 && diff.newSkills[0] === "Rust");
  assert("detects 1 removed skill (Go)", diff.removedSkills.length === 1 && diff.removedSkills[0] === "Go");
}

// Test 4: captured data from two recommendations generated today
console.log("\nTest 4: captured data from today's two recommendations");
{
  const current: RecommendationRow = {
    biggestOpportunities: [
      "AI/ML roles are up 340% YoY (Signal 15) with $265K median TC; you're at 4/5 in LLM/AI tools and can move into this market within 6 months, leapfrogging years of traditional engineering career progression. Land one AI infrastructure role and you're on track for $200K+ by year 2.",
      "Anthropic is heavily investing in open-source developer ecosystem (Signals 1, 3); your technical writing (4/5) and open-source contribution potential position you as a rare engineer-plus-developer-relations hybrid. This role type (staff engineer at developer-first AI company) pays $220–$260K and aligns with your values and skills.",
      "Cognitive debt and code comprehension are recognized structural problems (Signals 7, 14: 453+ points and 201+ comments indicating urgent practitioner need); if you build expertise in AI-augmented code quality systems, you'll have low competition and high demand at any engineering-heavy company ($200K+ justified quickly).",
    ],
    biggestRisks: [
      "Middle management and program management roles are contracting (Signal 18: 18% headcount reduction at Fortune 500 over 24 months); if you move into TPM without clear technical credibility, you risk displacement in 3–5 years. Mitigate by staying IC-track or moving to startup where flatter orgs are stable.",
    ],
    skillsToAccelerate: [
      { skill: "LLM/AI systems architecture and prompt engineering", reason: "", urgency: "now" },
      { skill: "Systems programming (Rust/C++)", reason: "", urgency: "now" },
      { skill: "Technical program management and systems thinking", reason: "", urgency: "now" },
    ],
  };
  const previous = {
    biggestOpportunities: [
      "AI/ML roles are up 340% YoY with median TC $265K+ (Signal 15), and AI startups captured 38% of all VC dollars (Signal 17)—your existing LLM expertise (level 4/5) is your highest-leverage asset; move immediately into an AI company and stack base salary + equity to hit $200K+ within 12 months.",
      "Anthropic's investment in open-source developer ecosystem (Signal 1-3) signals a wave of AI developer tool startups being founded in the next 12-24 months—position yourself as a founding engineer or early employee (#3-10) at 2-3 of these companies; even a 10% equity stake in a $100M+ exit yields $10M+ upside, dwarfing salary targets.",
      "Your combination of LLM expertise (level 4) + full-stack development (level 3) + project management (level 4) + financial analysis (level 3) is rare and high-value to AI startup founders seeking technical co-founders; start building a public portfolio now (ship a small AI tool, contribute to open-source LLM projects, publish a technical write-up) to unlock founder conversations and equity-based roles that compress your $200K timeline from 3 years to 18 months.",
    ],
    biggestRisks: [
      "Elevated cost of capital (Signal 4) combined with hiring freezes at growth-stage startups (Signal 8: Stripe, Brex, Affirm) means your target AI/fintech/developer tools sector could contract in next 12 months if macro worsens—reduce the VC-backed startup risk by targeting well-funded (Series C+) companies or profitable bootstrapped shops.",
    ],
    skillsToAccelerate: [
      { skill: "LLM/AI Systems Architecture & Fine-tuning" },
      { skill: "Systems Design & Technical Architecture for AI Infrastructure" },
      { skill: "Technical Leadership & Engineering Management" },
    ],
  };

  const diff = computeBriefDiff(current, previous);
  const hasChanges =
    diff.newOpportunities.length > 0 ||
    diff.removedOpportunities.length > 0 ||
    diff.newRisks.length > 0 ||
    diff.removedRisks.length > 0 ||
    diff.newSkills.length > 0 ||
    diff.removedSkills.length > 0;

  assert("diff has changes (banner would show)", hasChanges);
  assert("all 3 opportunities are 'new' (wording differs)", diff.newOpportunities.length === 3);
  assert("all 3 previous opportunities flagged removed", diff.removedOpportunities.length === 3);
  assert("all 3 skills are 'new' (casing/wording differs)", diff.newSkills.length === 3);

  console.log("\n  Diff summary:");
  console.log(`    New opportunities: ${diff.newOpportunities.length}`);
  console.log(`    Removed opportunities: ${diff.removedOpportunities.length}`);
  console.log(`    New skills: ${diff.newSkills.length}`);
  console.log(`    Removed skills: ${diff.removedSkills.length}`);
}

// Test 5: live DB smoke test when DATABASE_URL is available
console.log("\nTest 5: live DB latest two recommendations");
if (!process.env.DATABASE_URL) {
  console.log("  - skipped: DATABASE_URL is not set");
} else {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  try {
    const users = await db.user.findMany({
      include: {
        recommendations: {
          orderBy: { generatedAt: "desc" },
          take: 2,
        },
      },
    });
    const userWithTwoRecommendations = users.find((user) => user.recommendations.length >= 2);

    if (!userWithTwoRecommendations) {
      console.log("  - skipped: no user has 2+ recommendations yet");
    } else {
      const [current, previous] = userWithTwoRecommendations.recommendations;
      const diff = computeBriefDiff(
        {
          biggestOpportunities: current.biggestOpportunities,
          biggestRisks: current.biggestRisks,
          skillsToAccelerate: current.skillsToAccelerate as { skill: string }[],
        },
        {
          biggestOpportunities: previous.biggestOpportunities,
          biggestRisks: previous.biggestRisks,
          skillsToAccelerate: previous.skillsToAccelerate as { skill: string }[],
        }
      );
      const hasChanges =
        diff.newOpportunities.length > 0 ||
        diff.removedOpportunities.length > 0 ||
        diff.newRisks.length > 0 ||
        diff.removedRisks.length > 0 ||
        diff.newSkills.length > 0 ||
        diff.removedSkills.length > 0;

      assert("latest two live recommendations produce a visible diff", hasChanges);
      console.log(`  User: ${userWithTwoRecommendations.email ?? userWithTwoRecommendations.id}`);
      console.log(`  Current: ${current.generatedAt.toISOString()}`);
      console.log(`  Previous: ${previous.generatedAt.toISOString()}`);
      console.log(`  New opportunities: ${diff.newOpportunities.length}`);
      console.log(`  Removed opportunities: ${diff.removedOpportunities.length}`);
      console.log(`  New risks: ${diff.newRisks.length}`);
      console.log(`  Removed risks: ${diff.removedRisks.length}`);
      console.log(`  New skills: ${diff.newSkills.length}`);
      console.log(`  Removed skills: ${diff.removedSkills.length}`);
    }
  } catch (error) {
    const maybePrismaError = error as { code?: string; message?: string };
    if (maybePrismaError.code === "ECONNREFUSED" || maybePrismaError.message?.includes("ECONNREFUSED")) {
      console.log("  - skipped: DATABASE_URL is set, but Postgres refused the connection");
    } else {
      throw error;
    }
  } finally {
    await db.$disconnect();
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
