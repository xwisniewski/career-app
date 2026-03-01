import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter } as any) as any;

async function main() {
  const user = await db.user.findFirst({
    where: { email: "xwisniewski@gmail.com" },
    include: { profile: { include: { primarySkills: true } } },
  });

  if (!user) { console.error("User not found"); process.exit(1); }
  if (!user.profile) { console.error("No profile — register first at /register"); process.exit(1); }

  console.log("Found user:", user.id);

  await db.userProfile.update({
    where: { userId: user.id },
    data: {
      currentRole: "Senior Software Engineer",
      currentIndustry: "Technology",
      yearsOfExperience: 7,
      educationLevel: "BACHELORS",
      educationField: "Computer Science",
      currentLocation: "San Francisco, CA",
      learningSkills: ["Rust", "LLM fine-tuning", "Kubernetes"],
      desiredSkills: ["Staff engineering", "Technical product management", "MLOps"],
      targetRoles: ["Staff Engineer", "Principal Engineer", "Engineering Manager"],
      targetIndustries: ["AI/ML", "Developer Tools", "Fintech"],
      targetTimeHorizon: "THREE_YEAR" as any,
      incomeGoal: 350000,
      currentCompensation: 220000,
      riskTolerance: 4,
      autonomyVsStatus: 4,
      ambiguityTolerance: 4,
      geographicFlexibility: "NATIONAL",
      workEnvironmentPreference: "HYBRID",
      familyConstraints: false,
      visaStatus: "CITIZEN",
      entrepreneurialInterest: true,
      networkStrengthByIndustry: [
        { industry: "Technology", strength: 4 },
        { industry: "AI/ML", strength: 3 },
        { industry: "Fintech", strength: 2 },
      ],
      hoursPerWeekForLearning: 10,
      preferredLearningStyle: "PROJECTS" as any,
      onboardingStep: 5,
      onboardingComplete: true,
    },
  });

  // Recreate primary skills
  await db.skill.deleteMany({ where: { profileId: user.profile.id } });
  await db.skill.createMany({
    data: [
      { profileId: user.profile.id, name: "TypeScript", proficiencyLevel: 5, yearsUsed: 5 },
      { profileId: user.profile.id, name: "React", proficiencyLevel: 5, yearsUsed: 5 },
      { profileId: user.profile.id, name: "Node.js", proficiencyLevel: 4, yearsUsed: 6 },
      { profileId: user.profile.id, name: "PostgreSQL", proficiencyLevel: 4, yearsUsed: 5 },
      { profileId: user.profile.id, name: "Python", proficiencyLevel: 3, yearsUsed: 4 },
      { profileId: user.profile.id, name: "AWS", proficiencyLevel: 3, yearsUsed: 3 },
      { profileId: user.profile.id, name: "System Design", proficiencyLevel: 4, yearsUsed: 4 },
    ],
  });

  console.log("✓ Profile seeded successfully");
  console.log("userId:", user.id);
  console.log("\nNext: go to https://career-app-bice.vercel.app/admin and click 'Regen' for your user,");
  console.log("or visit /api/recommendations/refresh after logging in.");

  await (db as any).$disconnect();
  await pool.end();
}

main().catch(console.error);
