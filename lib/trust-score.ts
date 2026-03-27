export function clampTo0_100(value: number) {
  return Math.min(100, Math.max(0, value));
}

export function calculateTrustScore(input: {
  aptitudeScore: number | null;
  verifiedSkillCount: number;
  totalSkillCount: number;
}) {
  const aptitudeScore = input.aptitudeScore ?? 0;
  const totalSkillCount = input.totalSkillCount > 0 ? input.totalSkillCount : 0;
  const skillRatio = totalSkillCount === 0 ? 0 : input.verifiedSkillCount / totalSkillCount;

  return clampTo0_100(
    Math.round(aptitudeScore * 0.6 + skillRatio * 100 * 0.4),
  );
}

