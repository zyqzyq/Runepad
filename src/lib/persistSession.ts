// Runepad | Module: persistSession | Depends on: sessionApi, buildSessionSnapshot

import { saveSession } from "@/api/sessionApi";
import { buildSessionSnapshot } from "@/lib/buildSessionSnapshot";
import { readCurrentWindowState } from "@/lib/windowState";

interface PersistSessionSnapshotOptions {
  includeWindowState?: boolean;
}

export async function persistSessionSnapshot(
  options: PersistSessionSnapshotOptions = {},
): Promise<void> {
  const windowState = options.includeWindowState
    ? await readCurrentWindowState()
    : null;
  const snapshot = buildSessionSnapshot({ windowState });
  await saveSession(snapshot);
}
