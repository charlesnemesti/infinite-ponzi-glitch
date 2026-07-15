/** Pons launchpad — set via NEXT_PUBLIC_PONS_LAUNCHPAD_URL when live */
export const PONS_LAUNCHPAD_URL = process.env.NEXT_PUBLIC_PONS_LAUNCHPAD_URL?.trim() ?? "";

export function hasPonsLaunchpad(): boolean {
  return Boolean(PONS_LAUNCHPAD_URL);
}
