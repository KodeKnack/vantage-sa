"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function CVUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onUpload() {
    if (!file) return;
    setIsUploading(true);
    setMessage(null);

    try {
      const t = toast.loading("Uploading CV…");
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/cv/parse", { method: "POST", body: form });
      const json = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        setMessage("Upload failed.");
        toast.dismiss(t);
        toast.error("CV upload failed.");
      } else {
        const created =
          typeof json === "object" && json && "skillsCreated" in json
            ? String((json as { skillsCreated: unknown }).skillsCreated)
            : "?";
        setMessage(`Uploaded. Skills created: ${created}`);
        toast.dismiss(t);
        toast.success("CV uploaded. Skills imported.");
      }
    } catch {
      setMessage("Upload failed.");
      toast.error("CV upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold">Upload your CV</h2>
      <p className="mt-1 text-sm text-white/60">
        PDF or DOCX · max 5MB · skills imported as unverified
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
        />
        <button
          onClick={onUpload}
          disabled={!file || isUploading}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
        >
          {isUploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {message ? (
        <div className="mt-4 text-sm text-white/70">{message}</div>
      ) : null}
    </div>
  );
}
