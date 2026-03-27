"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { TaskDefinition } from "@/lib/tasks";

type SubmitResponse =
  | { ok: true; isVerified: boolean; proofHash: string | null }
  | { error: string };

type ApiOk = { isVerified?: unknown; proofHash?: unknown };

export default function ChallengeRunner({ task }: { task: TaskDefinition }) {
  const [submission, setSubmission] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);

  const charCount = submission.length;
  const canSubmit = charCount >= 20 && !isSubmitting;

  const helperText = useMemo(() => {
    if (charCount === 0) return "Type your answer to enable submission.";
    if (charCount < 20) return `Minimum 20 characters (${charCount}/20).`;
    return "Ready to submit.";
  }, [charCount]);

  async function onSubmit() {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/task/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          title: task.title,
          type: task.type,
          skillName: task.skillName,
          submission,
        }),
      });
      const json = (await res.json().catch(() => null)) as ApiOk | null;
      if (!res.ok) {
        setResult({ error: "Submit failed." });
      } else {
        setResult({
          ok: true,
          isVerified: Boolean(json?.isVerified),
          proofHash: typeof json?.proofHash === "string" ? json.proofHash : null,
        });
      }
    } catch {
      setResult({ error: "Submit failed." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 pt-28 pb-10 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-white/50">
            {task.type} challenge
          </div>
          <h1 className="mt-2 text-2xl font-semibold">{task.title}</h1>
          <p className="mt-2 text-white/60">{task.prompt}</p>
        </div>
        <Link
          href="/graduate/challenge"
          className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
        >
          Back
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-sm font-medium">Task</div>
          <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            <div className="text-xs uppercase tracking-widest text-white/40">
              Expected approach
            </div>
            <div className="mt-2 font-mono text-white/80">{task.expectedHint}</div>
          </div>
          <div className="mt-4 text-sm text-white/60">
            When you pass, we generate an HMAC-SHA256 proof hash and attach it to the
            matching skill.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Your answer</div>
            <div className="text-xs text-white/50">{charCount} chars</div>
          </div>

          <textarea
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            className="mt-3 h-56 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-white outline-none focus:ring-2 focus:ring-emerald-400/30"
            placeholder="Type your answer here…"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-white/60">{helperText}</div>
            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
            >
              {isSubmitting ? "Checking…" : "Submit"}
            </button>
          </div>

          {result && "error" in result ? (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {result.error}
            </div>
          ) : null}

          {result && "ok" in result ? (
            result.isVerified ? (
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                ✓ Passed — {task.skillName} verified. Proof hash:{" "}
                <span className="font-mono">{result.proofHash ?? "(missing)"}</span>
              </div>
            ) : (
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                Not quite right. Hint: {task.expectedHint}
              </div>
            )
          ) : null}
        </div>
      </div>
    </main>
  );
}
