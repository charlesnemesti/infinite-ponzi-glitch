/** Contest go-live — ISO 8601 UTC */
export const CONTEST_START_ISO =
  process.env.NEXT_PUBLIC_CONTEST_START_ISO ?? "2026-08-31T01:28:00.000Z";

/** Flip to true in Vercel env when ops manually activates the real contest */
export const CONTEST_MANUALLY_LIVE =
  process.env.NEXT_PUBLIC_CONTEST_LIVE?.trim().toLowerCase() === "true";

function formatContestUtcLabel(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm} UTC`;
}

export const CONTEST_START_UTC_LABEL = formatContestUtcLabel(CONTEST_START_ISO);

export function getContestStartMs(): number {
  return new Date(CONTEST_START_ISO).getTime();
}

export function isCountdownZero(): boolean {
  return Date.now() >= getContestStartMs();
}

/** Real contest is live only after manual env flip — never from countdown alone */
export function isContestLive(): boolean {
  return CONTEST_MANUALLY_LIVE;
}

/** Shown wherever simulated preview data appears on the site */
export const DEMO_DATA_NOTICE = isContestLive()
  ? "Live contest data is syncing. Rank matrix updates as nodes complete quests."
  : "All ranks, stats, and live feed events on this page are simulated demo data. The real contest is activated manually once the countdown above reaches zero.";

/** CA visible 2 minutes after contest go-live */
export const CA_REVEAL_DELAY_MS = 2 * 60 * 1000;

export function getCaRevealMs(): number {
  return getContestStartMs() + CA_REVEAL_DELAY_MS;
}
