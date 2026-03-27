"use client";

import Link from "next/link";
import type { TaskDefinition } from "@/lib/tasks";

export default function ChallengeCard({ task }: { task: TaskDefinition }) {
  return (
    <Link
      href={`/graduate/challenge/${task.id}`}
      className="block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.05]"
    >
      <div className="text-xs uppercase tracking-widest text-white/50">
        {task.type}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{task.title}</div>
      <div className="mt-2 text-sm text-white/60">{task.prompt}</div>
      <div className="mt-4 text-sm font-medium text-emerald-300">
        Start challenge →
      </div>
    </Link>
  );
}

