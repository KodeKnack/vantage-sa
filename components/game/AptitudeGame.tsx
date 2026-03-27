"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Question = {
  id: string;
  sequence: string;
  prompt: string;
  options: string[];
  answer: string;
};

function scoreLabel(score: number) {
  if (score >= 80) return "Expert";
  if (score >= 50) return "Proficient";
  return "Emerging";
}

function clampTo0_100(value: number) {
  return Math.min(100, Math.max(0, value));
}

export default function AptitudeGame() {
  const questions = useMemo<Question[]>(
    () => [
      {
        id: "q1",
        sequence: "2, 4, 6, 8, 10, ?",
        prompt: "Select the missing number.",
        options: ["11", "12", "13", "14"],
        answer: "12",
      },
      {
        id: "q2",
        sequence: "A, C, E, G, I, ?",
        prompt: "Select the missing letter.",
        options: ["J", "K", "L", "M"],
        answer: "K",
      },
      {
        id: "q3",
        sequence: "1, 1, 2, 3, 5, ?",
        prompt: "Select the missing number.",
        options: ["7", "8", "9", "10"],
        answer: "8",
      },
      {
        id: "q4",
        sequence: "10, 9, 7, 4, 0, ?",
        prompt: "Select the missing number.",
        options: ["-3", "-4", "-5", "-6"],
        answer: "-5",
      },
      {
        id: "q5",
        sequence: "3, 6, 12, 24, 48, ?",
        prompt: "Select the missing number.",
        options: ["72", "84", "96", "108"],
        answer: "96",
      },
      {
        id: "q6",
        sequence: "5, 10, 9, 18, 17, ?",
        prompt: "Select the missing number.",
        options: ["34", "35", "36", "37"],
        answer: "34",
      },
      {
        id: "q7",
        sequence: "Z, X, V, T, R, ?",
        prompt: "Select the missing letter.",
        options: ["P", "Q", "S", "U"],
        answer: "P",
      },
      {
        id: "q8",
        sequence: "4, 9, 16, 25, 36, ?",
        prompt: "Select the missing number.",
        options: ["45", "46", "47", "49"],
        answer: "49",
      },
      {
        id: "q9",
        sequence: "8, 4, 12, 6, 18, ?",
        prompt: "Select the missing number.",
        options: ["8", "9", "10", "12"],
        answer: "9",
      },
      {
        id: "q10",
        sequence: "1, 4, 9, 16, 25, ?",
        prompt: "Select the missing number.",
        options: ["30", "35", "36", "49"],
        answer: "36",
      },
    ],
    [],
  );

  const [status, setStatus] = useState<"idle" | "playing" | "finished">("idle");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeftSec, setTimeLeftSec] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const correctCountRef = useRef(0);
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);

  const current = questions[questionIndex] ?? null;
  const total = questions.length;

  function reset() {
    setStatus("idle");
    setQuestionIndex(0);
    setCorrectCount(0);
    setTimeLeftSec(120);
    setIsSubmitting(false);
    setSubmitError(null);
  }

  function start() {
    reset();
    setStatus("playing");
  }

  const finish = useCallback(async (finalCorrect: number) => {
    setStatus("finished");
    const score = clampTo0_100(Math.round((finalCorrect / total) * 100));

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/game/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score }),
      });
      if (!res.ok) {
        setSubmitError("Score save failed. Try again.");
      }
    } catch {
      setSubmitError("Score save failed. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [total]);

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => {
      setTimeLeftSec((t) => {
        if (t <= 0) return 0;
        const next = t - 1;
        if (next <= 0) {
          void finish(correctCountRef.current);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [finish, status]);

  function onSelect(option: string) {
    if (status !== "playing" || !current) return;

    const nextCorrect = correctCount + (option === current.answer ? 1 : 0);
    const nextIndex = questionIndex + 1;

    setCorrectCount(nextCorrect);

    if (nextIndex >= total) {
      void finish(nextCorrect);
      return;
    }
    setQuestionIndex(nextIndex);
  }

  const score = clampTo0_100(Math.round((correctCount / total) * 100));
  const mm = Math.floor(timeLeftSec / 60);
  const ss = timeLeftSec % 60;
  const timeText = `${mm}:${ss < 10 ? "0" : ""}${ss}`;
  const progressPct = clampTo0_100(Math.round((questionIndex / total) * 100));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-28 pb-10 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Aptitude gateway</h1>
          <p className="mt-1 text-sm text-white/60">
            10 questions · 2 minutes · pure accuracy scoring
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right">
          <div className="text-[10px] uppercase tracking-widest text-white/50">
            Time left
          </div>
          <div className="mt-1 font-mono text-lg">{timeText}</div>
        </div>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-emerald-400 transition-all"
          style={{ width: `${status === "idle" ? 0 : progressPct}%` }}
        />
      </div>

      {status === "idle" ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-sm text-white/70">
            Start when you’re ready. Your score saves to your profile automatically.
          </p>
          <button
            onClick={start}
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
          >
            Start test
          </button>
        </div>
      ) : null}

      {status === "playing" && current ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              Question {questionIndex + 1} of {total}
            </div>
            <div className="text-sm text-white/60">
              Correct: <span className="text-white">{correctCount}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
            <div className="font-mono text-xl tracking-tight">{current.sequence}</div>
            <div className="mt-2 text-sm text-white/60">{current.prompt}</div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onSelect(opt)}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/[0.05]"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {status === "finished" ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="text-sm uppercase tracking-widest text-white/50">Result</div>
          <div className="mt-2 text-4xl font-semibold text-emerald-300">
            {score}
            <span className="ml-2 text-base text-white/60">/ 100</span>
          </div>
          <div className="mt-2 text-sm text-white/70">
            {scoreLabel(score)} · {correctCount}/{total} correct
          </div>

          {isSubmitting ? (
            <div className="mt-4 text-sm text-white/60">Saving score…</div>
          ) : submitError ? (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {submitError}
            </div>
          ) : (
            <div className="mt-4 text-sm text-emerald-300">Score saved.</div>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={start}
              className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-2 text-sm text-white hover:bg-white/[0.06]"
            >
              Retry
            </button>
            <a
              href="/graduate/dashboard"
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black"
            >
              Back to dashboard
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
