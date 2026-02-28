import { config } from "dotenv";
config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const now = new Date();
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000);

const signals = [
  // ── JOB_MARKET ─────────────────────────────────────────────────────────────
  {
    source: "layoffs_fyi",
    category: "JOB_MARKET" as const,
    topic: "big_tech_layoffs",
    headline: "Google cuts 12,000 roles, deepest in Search and middle management",
    dataPoint:
      "Google announced 12,000 layoffs (6% of workforce) concentrated in Search, Ads, and managerial layers. Engineering ICs largely spared.",
    sentiment: "NEGATIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Technology", "Software"],
    relevantRoles: ["Product Manager", "Program Manager", "Search Engineer"],
    relevantSkills: ["Product Management", "SEO", "People Management"],
    scrapedAt: daysAgo(3),
    sourceUrl: "https://layoffs.fyi",
  },
  {
    source: "layoffs_fyi",
    category: "JOB_MARKET" as const,
    topic: "fintech_hiring_freeze",
    headline: "Stripe, Brex, and Affirm all pause non-essential hiring through Q2",
    dataPoint:
      "Three leading fintechs signal hiring freezes citing macro uncertainty and rising cost of capital. Expect increased competition for open roles.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Fintech", "Financial Services"],
    relevantRoles: ["Software Engineer", "Data Scientist", "Product Manager"],
    relevantSkills: ["Payments", "Risk Modeling", "Compliance"],
    scrapedAt: daysAgo(5),
    sourceUrl: "https://layoffs.fyi",
  },
  {
    source: "hn_hiring",
    category: "JOB_MARKET" as const,
    topic: "ai_engineer_demand",
    headline: "HN Who's Hiring: AI/ML roles up 340% YoY, most list $250K+ TC",
    dataPoint:
      "Analysis of 3 months of HN hiring threads shows AI/ML engineer postings up 340% year-over-year. Median total comp now $265K at funded startups.",
    sentiment: "POSITIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Technology", "Artificial Intelligence"],
    relevantRoles: ["ML Engineer", "AI Engineer", "Applied Scientist"],
    relevantSkills: ["PyTorch", "LLMs", "Fine-tuning", "MLOps", "Python"],
    scrapedAt: daysAgo(1),
    sourceUrl: "https://news.ycombinator.com/jobs",
  },
  {
    source: "hn_hiring",
    category: "JOB_MARKET" as const,
    topic: "remote_contraction",
    headline: "Remote-only job postings fell 38% in 12 months as RTO mandates spread",
    dataPoint:
      "Remote job postings on major boards dropped from 22% to 14% of total listings over the past year. RTO mandates now affect 68% of S&P 500 companies.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Finance", "Consulting"],
    relevantRoles: ["Software Engineer", "Data Analyst", "Product Manager"],
    relevantSkills: ["Remote Collaboration", "Async Communication"],
    scrapedAt: daysAgo(7),
    sourceUrl: "https://news.ycombinator.com/jobs",
  },
  {
    source: "bls_api",
    category: "JOB_MARKET" as const,
    topic: "software_employment",
    headline: "BLS: Software developer unemployment at 1.8% — near record low",
    dataPoint:
      "Bureau of Labor Statistics reports software developer unemployment rate of 1.8% for Q4, vs 3.6% national average. Demand remains structurally above supply.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Software"],
    relevantRoles: ["Software Engineer", "Backend Engineer", "Full Stack Engineer"],
    relevantSkills: ["Software Development", "Systems Design"],
    scrapedAt: daysAgo(10),
    sourceUrl: "https://www.bls.gov/news.release/empsit.toc.htm",
  },

  // ── SKILL_DEMAND ───────────────────────────────────────────────────────────
  {
    source: "hn_hiring",
    category: "SKILL_DEMAND" as const,
    topic: "rust_systems_demand",
    headline: "Rust listed in 22% of systems engineering roles, up from 6% two years ago",
    dataPoint:
      "Rust now appears in over one-fifth of systems/infrastructure job postings, driven by safety requirements in automotive, aerospace, and OS-level work at AWS, Microsoft, and Google.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Automotive", "Cloud Infrastructure"],
    relevantRoles: ["Systems Engineer", "Infrastructure Engineer", "Embedded Engineer"],
    relevantSkills: ["Rust", "C++", "Systems Programming", "Memory Safety"],
    scrapedAt: daysAgo(4),
    sourceUrl: "https://news.ycombinator.com/jobs",
  },
  {
    source: "hn_hiring",
    category: "SKILL_DEMAND" as const,
    topic: "llm_ops_demand",
    headline: "LLMOps and RAG engineering now standard requirements at AI startups",
    dataPoint:
      "60% of AI startup job postings now require experience with retrieval-augmented generation (RAG), vector databases, and LLM evaluation frameworks. Skills commanding 20–30% TC premium.",
    sentiment: "POSITIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Artificial Intelligence", "Technology", "SaaS"],
    relevantRoles: ["ML Engineer", "AI Engineer", "Backend Engineer"],
    relevantSkills: ["RAG", "LangChain", "Vector Databases", "LLM Evaluation", "Prompt Engineering"],
    scrapedAt: daysAgo(2),
    sourceUrl: "https://news.ycombinator.com/jobs",
  },
  {
    source: "fred_api",
    category: "SKILL_DEMAND" as const,
    topic: "data_engineering_demand",
    headline: "Data engineering roles grow 28% YoY as companies prioritize data infrastructure",
    dataPoint:
      "Job postings for data engineers grew 28% year-over-year. dbt, Spark, and Airflow are now table stakes. Real-time streaming (Flink, Kafka) commands 35% premium.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Financial Services", "Healthcare"],
    relevantRoles: ["Data Engineer", "Analytics Engineer", "Platform Engineer"],
    relevantSkills: ["dbt", "Apache Spark", "Airflow", "Kafka", "Snowflake", "Python"],
    scrapedAt: daysAgo(6),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "layoffs_fyi",
    category: "SKILL_DEMAND" as const,
    topic: "no_code_displacement",
    headline: "Figma, Webflow, and Bubble cannibalize junior web dev market",
    dataPoint:
      "Junior web developer job postings dropped 31% in 18 months as no-code tools absorb simple web projects. Mid/senior roles unaffected — complexity ceiling remains.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Marketing", "Media"],
    relevantRoles: ["Frontend Developer", "Web Developer", "UI Developer"],
    relevantSkills: ["HTML", "CSS", "WordPress", "Basic JavaScript"],
    scrapedAt: daysAgo(8),
    sourceUrl: "https://layoffs.fyi",
  },
  {
    source: "hn_hiring",
    category: "SKILL_DEMAND" as const,
    topic: "security_engineering_demand",
    headline: "Security engineering hiring up 45% after wave of enterprise breaches",
    dataPoint:
      "Cybersecurity engineering roles grew 45% YoY following high-profile breaches at MGM, Okta, and several banks. AppSec and cloud security specialists most sought-after.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Cybersecurity", "Technology", "Financial Services"],
    relevantRoles: ["Security Engineer", "AppSec Engineer", "Cloud Security Engineer"],
    relevantSkills: ["AppSec", "Penetration Testing", "Cloud Security", "IAM", "SIEM"],
    scrapedAt: daysAgo(9),
    sourceUrl: "https://news.ycombinator.com/jobs",
  },

  // ── CAPITAL_FLOWS ──────────────────────────────────────────────────────────
  {
    source: "fred_api",
    category: "CAPITAL_FLOWS" as const,
    topic: "ai_vc_investment",
    headline: "AI startups captured 38% of all US VC dollars in Q4 — a new record",
    dataPoint:
      "AI/ML startups received $38B of the $100B deployed by US VCs in Q4, the highest sector concentration on record. Infrastructure, healthcare AI, and coding tools led.",
    sentiment: "POSITIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Artificial Intelligence", "Technology", "Healthcare"],
    relevantRoles: ["ML Engineer", "AI Researcher", "Product Manager"],
    relevantSkills: ["Machine Learning", "LLMs", "AI Product Management"],
    scrapedAt: daysAgo(5),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "fred_api",
    category: "CAPITAL_FLOWS" as const,
    topic: "interest_rates_impact",
    headline: "Fed holds rates at 5.25%: hiring freezes persist in growth-stage tech",
    dataPoint:
      "Federal Reserve maintained federal funds rate at 5.25–5.50%. Cost of capital remains elevated, suppressing hiring at growth-stage startups dependent on VC or debt financing.",
    sentiment: "NEGATIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Technology", "Fintech", "Real Estate Tech"],
    relevantRoles: ["Software Engineer", "Product Manager", "Sales"],
    relevantSkills: ["Financial Modeling", "Capital Efficiency"],
    scrapedAt: daysAgo(12),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "fred_api",
    category: "CAPITAL_FLOWS" as const,
    topic: "defense_tech_funding",
    headline: "Defense tech VC investment hits $20B annually — fastest growing sector",
    dataPoint:
      "Defense and dual-use technology startups received $20B in VC funding, up 4x in three years. Anduril, Shield AI, and Palantir-adjacent startups driving growth.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Defense", "Aerospace", "Technology"],
    relevantRoles: ["Software Engineer", "Systems Engineer", "ML Engineer"],
    relevantSkills: ["C++", "Rust", "Computer Vision", "Autonomy", "Embedded Systems"],
    scrapedAt: daysAgo(14),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "fred_api",
    category: "CAPITAL_FLOWS" as const,
    topic: "healthcare_ai_funding",
    headline: "Healthcare AI funding up 180% — FDA clearance pipeline fastest in history",
    dataPoint:
      "Healthcare AI companies raised $12B in the past 12 months. FDA cleared 521 AI-enabled medical devices in 2025, up from 91 in 2021. Clinical decision support and imaging lead.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Healthcare", "Biotech", "Artificial Intelligence"],
    relevantRoles: ["ML Engineer", "Clinical Data Scientist", "Product Manager"],
    relevantSkills: ["Medical Imaging", "HL7 FHIR", "Clinical NLP", "Regulatory Affairs"],
    scrapedAt: daysAgo(11),
    sourceUrl: "https://fred.stlouisfed.org",
  },

  // ── DISPLACEMENT_RISK ──────────────────────────────────────────────────────
  {
    source: "layoffs_fyi",
    category: "DISPLACEMENT_RISK" as const,
    topic: "coding_assistant_productivity",
    headline: "GitHub Copilot study: senior devs 40% faster, junior output unchanged",
    dataPoint:
      "Microsoft-commissioned study found senior engineers produce 40% more code with Copilot, but junior engineers see minimal productivity gains due to inability to verify AI output. Hiring ratios shifting toward senior-heavy teams.",
    sentiment: "NEGATIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Technology", "Software"],
    relevantRoles: ["Junior Software Engineer", "Associate Software Engineer"],
    relevantSkills: ["Code Review", "Debugging", "System Design"],
    scrapedAt: daysAgo(3),
    sourceUrl: "https://layoffs.fyi",
  },
  {
    source: "layoffs_fyi",
    category: "DISPLACEMENT_RISK" as const,
    topic: "middle_management_compression",
    headline: "Middle manager headcount down 18% at Fortune 500 over 24 months",
    dataPoint:
      "Analysis of SEC filings shows Fortune 500 companies reduced management layers by 18% over two years. AI-driven reporting and flatter org structures cited as drivers.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Finance", "Retail"],
    relevantRoles: ["Engineering Manager", "Program Manager", "Director"],
    relevantSkills: ["People Management", "Project Coordination", "Reporting"],
    scrapedAt: daysAgo(16),
    sourceUrl: "https://layoffs.fyi",
  },
  {
    source: "bls_api",
    category: "DISPLACEMENT_RISK" as const,
    topic: "qa_automation_displacement",
    headline: "QA engineer role volumes down 24% as AI test generation matures",
    dataPoint:
      "BLS occupational data shows QA and test engineer postings fell 24% over 18 months as AI-assisted test generation (Copilot, Codium) automates regression coverage.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Software"],
    relevantRoles: ["QA Engineer", "SDET", "Test Engineer"],
    relevantSkills: ["Manual Testing", "Test Script Writing", "Selenium"],
    scrapedAt: daysAgo(19),
    sourceUrl: "https://www.bls.gov",
  },
  {
    source: "fred_api",
    category: "DISPLACEMENT_RISK" as const,
    topic: "content_writer_displacement",
    headline: "Content writer job postings down 51% YoY as LLMs handle SEO content",
    dataPoint:
      "Indeed and LinkedIn data show content writer and copywriter postings fell 51% over 12 months. Agencies report replacing 3–5 writers with 1 prompt engineer + AI pipeline.",
    sentiment: "NEGATIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Media", "Marketing", "SaaS"],
    relevantRoles: ["Content Writer", "Copywriter", "SEO Writer"],
    relevantSkills: ["Content Writing", "SEO Writing", "Blog Writing"],
    scrapedAt: daysAgo(7),
    sourceUrl: "https://fred.stlouisfed.org",
  },

  // ── POLICY ─────────────────────────────────────────────────────────────────
  {
    source: "fred_api",
    category: "POLICY" as const,
    topic: "eu_ai_act",
    headline: "EU AI Act enforcement begins: compliance roles surge across European operations",
    dataPoint:
      "EU AI Act high-risk provisions now enforceable. Companies with EU operations need AI compliance officers and model risk management functions. Estimated 40K new compliance roles needed across EU by 2026.",
    sentiment: "POSITIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Financial Services", "Healthcare", "Technology"],
    relevantRoles: ["AI Compliance Officer", "Model Risk Manager", "Legal Counsel"],
    relevantSkills: ["AI Governance", "Risk Management", "Regulatory Affairs", "EU AI Act"],
    scrapedAt: daysAgo(20),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "fred_api",
    category: "POLICY" as const,
    topic: "h1b_uncertainty",
    headline: "H-1B lottery oversubscribed 5x — processing delays hit 18 months",
    dataPoint:
      "USCIS received 780,000 H-1B registrations for 85,000 annual slots. Processing times extended to 18 months, creating uncertainty for both workers and employers dependent on visa pipeline.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Technology", "Financial Services"],
    relevantRoles: ["Software Engineer", "Data Scientist", "ML Engineer"],
    relevantSkills: ["Visa Sponsorship Navigation"],
    scrapedAt: daysAgo(25),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "fred_api",
    category: "POLICY" as const,
    topic: "chips_act_hiring",
    headline: "CHIPS Act spending unlocks 115,000 new semiconductor jobs through 2027",
    dataPoint:
      "CHIPS and Science Act investments at TSMC, Intel, and Samsung US fabs are projected to create 115,000 direct manufacturing and engineering jobs by 2027. Arizona, Ohio, and Texas see largest impact.",
    sentiment: "POSITIVE" as const,
    magnitude: 3,
    relevantIndustries: ["Semiconductor", "Manufacturing", "Hardware"],
    relevantRoles: ["Hardware Engineer", "Process Engineer", "Fab Engineer"],
    relevantSkills: ["VLSI Design", "Process Engineering", "Semiconductor Physics", "EDA Tools"],
    scrapedAt: daysAgo(30),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "fred_api",
    category: "POLICY" as const,
    topic: "student_loan_resumption",
    headline: "Student loan payments resume — disposable income squeeze hits consumer tech",
    dataPoint:
      "Full student loan repayment resumed for 43M borrowers. Average monthly payment $393. Consumer spending analytics show 12% decline in discretionary app subscriptions among 25–34 demographic.",
    sentiment: "NEGATIVE" as const,
    magnitude: 2,
    relevantIndustries: ["Consumer Technology", "EdTech", "Fintech"],
    relevantRoles: ["Product Manager", "Growth Manager", "Marketing"],
    relevantSkills: ["Consumer Behavior", "Retention Marketing", "Pricing Strategy"],
    scrapedAt: daysAgo(45),
    sourceUrl: "https://fred.stlouisfed.org",
  },
  {
    source: "bls_api",
    category: "POLICY" as const,
    topic: "minimum_wage_automation",
    headline: "State minimum wage hikes accelerate restaurant/retail automation adoption",
    dataPoint:
      "Following minimum wage increases to $17–$20/hr in CA, NY, and WA, McDonald's and Walmart accelerated kiosk and automated checkout rollouts. 180,000 net cashier positions eliminated in 2025.",
    sentiment: "NEUTRAL" as const,
    magnitude: 2,
    relevantIndustries: ["Retail", "Food Service", "Robotics"],
    relevantRoles: ["Robotics Engineer", "Automation Engineer"],
    relevantSkills: ["Robotics", "Computer Vision", "Embedded Systems"],
    scrapedAt: daysAgo(22),
    sourceUrl: "https://www.bls.gov",
  },
];

async function main() {
  console.log("Seeding MacroSignals...");

  // Upsert based on (source + headline) to avoid dupes on re-runs
  for (const signal of signals) {
    const existing = await db.macroSignal.findFirst({
      where: { source: signal.source, headline: signal.headline },
    });
    if (existing) {
      console.log(`  skip (exists): ${signal.headline.slice(0, 60)}`);
      continue;
    }
    await db.macroSignal.create({ data: signal });
    console.log(`  created: ${signal.headline.slice(0, 60)}`);
  }

  const total = await db.macroSignal.count();
  console.log(`\nDone. Total MacroSignals in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
