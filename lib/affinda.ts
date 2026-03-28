import { z } from "zod";

export type AffindaResult = {
  name: string | null;
  email: string | null;
  skills: string[];
};

const AffindaResponseSchema = z
  .object({
    data: z
      .object({
        name: z
          .object({
            raw: z.string().optional(),
          })
          .optional(),
        emails: z.array(z.string()).optional(),
        email: z.string().optional(),
        skills: z
          .array(
            z.union([
              z.string(),
              z.object({
                name: z.string().optional(),
                skill: z.string().optional(),
              }),
            ]),
          )
          .optional(),
      })
      .optional(),
  })
  .passthrough();

function uniqSkills(skills: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of skills) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }
  return out;
}

export function mockAffindaResult(): AffindaResult {
  return {
    name: null,
    email: null,
    skills: ["SQL", "Python", "Data Analysis", "Communication", "React", "TypeScript"],
  };
}

export async function parseCV(buffer: Buffer, fileName: string): Promise<AffindaResult> {
  const apiKey = process.env.AFFINDA_API_KEY;
  if (!apiKey) return mockAffindaResult();

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), fileName);

  const res = await fetch("https://api.affinda.com/v2/resumes", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!res.ok) {
    return mockAffindaResult();
  }

  const json: unknown = await res.json().catch(() => null);
  const parsed = AffindaResponseSchema.safeParse(json);
  if (!parsed.success) return mockAffindaResult();

  const data = parsed.data.data;
  const name = data?.name?.raw ?? null;
  const email = (data?.emails?.[0] ?? data?.email ?? null) || null;

  const rawSkills = data?.skills ?? [];
  const skills = rawSkills
    .map((s) => (typeof s === "string" ? s : s.name ?? s.skill ?? ""))
    .filter((s): s is string => typeof s === "string");

  return { name, email, skills: uniqSkills(skills) };
}
