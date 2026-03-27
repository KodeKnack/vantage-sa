import { TaskType } from "@prisma/client";

export type TaskDefinition = {
  id: string;
  title: string;
  type: TaskType;
  skillName: string;
  prompt: string;
  expectedHint: string;
};

export const TASKS: TaskDefinition[] = [
  {
    id: "sql-left-join-null",
    title: "Fix a broken query",
    type: TaskType.SQL,
    skillName: "SQL",
    prompt:
      "You have two tables: users(id, email) and logins(user_id, logged_in_at). " +
      "Write a query to list all users who have never logged in. " +
      "Your answer must use LEFT JOIN and IS NULL.",
    expectedHint: "Try: LEFT JOIN logins ... WHERE logins.user_id IS NULL",
  },
  {
    id: "writing-client-email",
    title: "Draft a client email",
    type: TaskType.WRITING,
    skillName: "Communication",
    prompt:
      "Write a short professional follow-up email to a client who missed a meeting. " +
      "Include a polite reminder and propose two new times.",
    expectedHint: "Aim for a clear subject line and polite tone.",
  },
];

export function getTaskById(taskId: string) {
  return TASKS.find((t) => t.id === taskId) ?? null;
}

