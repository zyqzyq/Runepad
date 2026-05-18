import { saveSession } from "@/api/sessionApi";
import { buildSessionSnapshot } from "@/lib/buildSessionSnapshot";

export async function persistSessionSnapshot(): Promise<void> {
  const snapshot = buildSessionSnapshot();
  await saveSession(snapshot);
}
