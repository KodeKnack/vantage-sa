"use client";

import { useEffect, useMemo, useState } from "react";

type ROIResult = {
  hireCount: number;
  annualPayroll: number;
  taxRebateZAR: number;
  bbeeContributionZAR: number;
  totalSavingZAR: number;
};

function formatZar(value: number) {
  return `R ${value.toLocaleString("en-ZA")}`;
}

export default function ROIDashboard() {
  const [hireCount, setHireCount] = useState(10);
  const [annualPayroll, setAnnualPayroll] = useState(2_000_000);
  const [data, setData] = useState<ROIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo(() => ({ hireCount, annualPayroll }), [hireCount, annualPayroll]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setError(null);
      try {
        const res = await fetch("/api/employer/roi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = (await res.json().catch(() => null)) as ROIResult | null;
        if (!res.ok || !json) throw new Error("bad response");
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError("Could not load ROI. Are you signed in as an employer?");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [payload]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">ROI calculator</h2>
          <p className="mt-1 text-sm text-white/60">
            Section 12H SARS rebate + B-BBEE Skills Development estimate.
          </p>
        </div>
        <div className="text-xs text-white/40 max-w-sm">
          Estimates only. Based on Section 12H guidelines and B-BBEE Codes of Good Practice.
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs uppercase tracking-widest text-white/40">Hires</div>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={20}
              value={hireCount}
              onChange={(e) => setHireCount(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="w-10 text-right font-mono">{hireCount}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4 lg:col-span-2">
          <div className="text-xs uppercase tracking-widest text-white/40">Annual payroll (ZAR)</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              type="number"
              min={0}
              step={10000}
              value={annualPayroll}
              onChange={(e) => setAnnualPayroll(parseInt(e.target.value || "0", 10))}
              className="w-full max-w-xs rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            />
            <div className="text-sm text-white/50">
              Default: <span className="font-mono">2000000</span>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="text-xs uppercase tracking-widest text-white/40">
            Section 12H tax rebate
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">
            {data ? formatZar(data.taxRebateZAR) : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="text-xs uppercase tracking-widest text-white/40">
            B-BBEE contribution
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">
            {data ? formatZar(data.bbeeContributionZAR) : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
          <div className="text-xs uppercase tracking-widest text-white/40">Total saving</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-300">
            {data ? formatZar(data.totalSavingZAR) : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

