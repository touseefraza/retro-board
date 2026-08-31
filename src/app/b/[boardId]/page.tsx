import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoardView } from "@/components/BoardView";
import { SetupNotice } from "@/components/SetupNotice";
import { isAiConfigured } from "@/lib/ai";
import { isDatabaseConfigured } from "@/lib/db";
import { getBoardVersion } from "@/lib/repo";
import { db } from "@/lib/db";

// Board state is per-participant and changes constantly; never cache the shell.
export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: PageProps<"/b/[boardId]">,
): Promise<Metadata> {
  if (!isDatabaseConfigured()) return { title: "Setup", robots: { index: false } };

  const { boardId } = await props.params;
  const sql = await db();
  const rows = await sql<{ title: string }[]>`
    select title from boards where id = ${boardId}
  `;
  return {
    title: rows[0]?.title ?? "Board",
    // A board is a private link holding a team's own words. Never index it.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function BoardPage(props: PageProps<"/b/[boardId]">) {
  if (!isDatabaseConfigured()) {
    return <SetupNotice hasDatabase={false} hasAi={isAiConfigured()} />;
  }

  const { boardId } = await props.params;
  if ((await getBoardVersion(boardId)) === null) notFound();

  // Keyed so a move between boards remounts rather than reusing state.
  return <BoardView key={boardId} boardId={boardId} aiEnabled={isAiConfigured()} />;
}
