import { db } from "@/lib/db";

const users = await db.user.findMany({
  select: { id: true, email: true, role: true, onboardingComplete: true },
});
console.log("Users:", JSON.stringify(users, null, 2));

const profiles = await db.userProfile.findMany({
  select: { userId: true, currentRole: true, currentIndustry: true },
});
console.log("Profiles:", JSON.stringify(profiles, null, 2));

await db.$disconnect();
