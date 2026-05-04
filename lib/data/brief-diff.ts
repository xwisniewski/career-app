export type BriefDiff = {
  newOpportunities: string[];
  removedOpportunities: string[];
  newRisks: string[];
  removedRisks: string[];
  newSkills: string[];
  removedSkills: string[];
  previousGeneratedAt: string | null;
};

export type BriefDiffRecommendation = {
  biggestOpportunities: string[];
  biggestRisks: string[];
  skillsToAccelerate: { skill: string }[];
};

export function computeBriefDiff(
  current: BriefDiffRecommendation,
  previous: BriefDiffRecommendation
): BriefDiff {
  const currentSkills = current.skillsToAccelerate.map((s) => s.skill);
  const prevSkills = previous.skillsToAccelerate.map((s) => s.skill);

  return {
    newOpportunities: current.biggestOpportunities.filter(
      (o) => !previous.biggestOpportunities.includes(o)
    ),
    removedOpportunities: previous.biggestOpportunities.filter(
      (o) => !current.biggestOpportunities.includes(o)
    ),
    newRisks: current.biggestRisks.filter((r) => !previous.biggestRisks.includes(r)),
    removedRisks: previous.biggestRisks.filter((r) => !current.biggestRisks.includes(r)),
    newSkills: currentSkills.filter((s) => !prevSkills.includes(s)),
    removedSkills: prevSkills.filter((s) => !currentSkills.includes(s)),
    previousGeneratedAt: null,
  };
}
