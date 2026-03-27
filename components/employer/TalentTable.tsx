"use client";

import { useEffect, useMemo, useState } from "react";

type TalentSkill = {
  id: string;
  name: string;
  isVerified: boolean;
  proofHash: string | null;
};

type TalentRow = {
  id: string;
  name: string;
  email: string;
  aptitudeScore: number | null;
  trustScore: number;
  skills: TalentSkill[];
};

function badgeClass(vps: number) {
  if (vps >= 70) return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
  if (vps >= 40) return "bg-amber-500/15 text-amber-200 border-amber-500/20";
  return "bg-red-500/15 text-red-200 border-red-500/20";
}

function topVerifiedSkills(skills: TalentSkill[]) {
  return skills.filter((s) => s.isVerified).map((s) => s.name).slice(0, 3);
}

export default function TalentTable() {
  const [rows, setRows] = useState<TalentRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<TalentRow | null>(null);

  const [minVps, setMinVps] = useState(50);
  const [skillFilter, setSkillFilter] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      try {
        const res = await fetch("/api/employer/talent");
        const json = (await res.json().catch(() => null)) as { rows?: TalentRow[] } | null;
        if (!res.ok || !json?.rows) throw new Error("bad response");
        if (!cancelled) setRows(json.rows);
      } catch {
        if (!cancelled) setError("Could not load talent. Are you signed in as an employer?");
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allSkillNames = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) for (const s of r.skills) set.add(s.name);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (r.trustScore < minVps) return false;
      if (!skillFilter) return true;
      return r.skills.some((s) => s.name === skillFilter && s.isVerified);
    });
  }, [minVps, rows, skillFilter]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Talent pool</h2>
          <p className="mt-1 text-sm text-white/60">
            Filter verified graduates by VPS and verified skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2">
            <span className="text-xs text-white/50">Min VPS</span>
            <input
              type="range"
              min={0}
              max={100}
              value={minVps}
              onChange={(e) => setMinVps(parseInt(e.target.value, 10))}
            />
            <span className="w-8 text-right text-xs font-mono text-white/70">
              {minVps}
            </span>
          </div>

          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
          >
            <option value="">All skills</option>
            {allSkillNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-widest text-white/40">
            <tr>
              <th className="px-4 py-3">Graduate</th>
              <th className="px-4 py-3">VPS</th>
              <th className="px-4 py-3">Top verified skills</th>
              <th className="px-4 py-3">Section 12H</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filtered.map((r) => {
              const top = topVerifiedSkills(r.skills);
              return (
                <tr
                  key={r.id}
                  className="cursor-pointer hover:bg-white/[0.03]"
                  onClick={() => setSelected(r)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{r.name}</div>
                    <div className="text-xs text-white/50">{r.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-1 font-mono text-xs ${badgeClass(
                        r.trustScore,
                      )}`}
                    >
                      {r.trustScore}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {top.length === 0 ? (
                        <span className="text-white/40">—</span>
                      ) : (
                        top.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-white/70"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">R 40,000</td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/50" colSpan={4}>
                  No matches.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-md overflow-y-auto bg-[#0d0d0d] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/40">
                  Graduate profile
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{selected.name}</div>
                <div className="text-sm text-white/60">{selected.email}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white hover:bg-white/[0.06]"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-widest text-white/40">VPS</div>
                <div className="mt-2 text-3xl font-semibold text-emerald-300">
                  {selected.trustScore}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-widest text-white/40">
                  Verified skills + proofs
                </div>
                <div className="mt-3 space-y-2">
                  {selected.skills
                    .filter((s) => s.isVerified)
                    .map((s) => (
                      <div key={s.id} className="text-sm text-white/70">
                        ✓ {s.name}{" "}
                        {s.proofHash ? (
                          <span className="ml-1 font-mono text-xs text-white/50">
                            {s.proofHash}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  {selected.skills.filter((s) => s.isVerified).length === 0 ? (
                    <div className="text-sm text-white/50">No verified skills yet.</div>
                  ) : null}
                </div>
              </div>

              <a
                className="rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-semibold text-black"
                href={`/api/passport/generate?graduateId=${encodeURIComponent(selected.id)}`}
              >
                Download passport PDF
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

