import { clampTo0_100 } from "@/lib/trust-score";

export default function VPSRing({
  vps,
  aptitudeScore,
  verifiedSkillCount,
  totalSkillCount,
}: {
  vps: number;
  aptitudeScore?: number;
  verifiedSkillCount?: number;
  totalSkillCount?: number;
}) {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      "VPS ring received:",
      vps,
      "aptitude:",
      aptitudeScore,
      "verified:",
      verifiedSkillCount,
      "total:",
      totalSkillCount,
    );
  }
  const value = clampTo0_100(Math.round(vps));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value / 100);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="relative h-[140px] w-[140px]">
        <svg
          className="-rotate-90"
          width="140"
          height="140"
          viewBox="0 0 140 140"
          aria-label="VPS ring"
        >
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="10"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#2ECC8F"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-semibold text-4xl text-emerald-300">{value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
            VPS
          </div>
        </div>
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm font-semibold text-white">Verified Potential Score</div>
        <div className="mt-1 inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
          Composite score (aptitude + verification)
        </div>
      </div>
    </div>
  );
}
