/** Contest go-live — ISO 8601 UTC */
export const CONTEST_START_ISO =
  process.env.NEXT_PUBLIC_CONTEST_START_ISO ?? "2026-07-15T15:30:00.000Z";

export const CONTEST_START_UTC_LABEL = "15:30 UTC";

export function getContestStartMs(): number {
  return new Date(CONTEST_START_ISO).getTime();
}
