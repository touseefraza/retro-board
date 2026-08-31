"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui";

/** Creates a board on this format and drops the user straight into it. */
export function StartTemplateButton({
  template,
  label,
}: {
  template: string;
  label: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const start = async () => {
    setCreating(true);
    setFailure(null);
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setFailure(payload?.fix ?? payload?.error ?? "Could not create the board");
        return;
      }
      router.push(`/b/${payload.boardId}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={start} disabled={creating} className="h-11 px-6">
        {creating ? "Creating…" : label}
      </Button>
      {failure && (
        <p className="mt-2 text-[12px] text-tone-negative">{failure}</p>
      )}
    </div>
  );
}
