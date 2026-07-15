export const PRODUCTION_APP_URL = "https://www.infiniteponsiglitch.fun";
export const PRODUCTION_CALLBACK = `${PRODUCTION_APP_URL}/api/auth/twitter/callback`;
export const PRODUCTION_CALLBACK_NO_WWW = "https://infiniteponsiglitch.fun/api/auth/twitter/callback";

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

/** OAuth redirect_uri — derived from APP_URL so it stays in sync with the live domain */
export function getTwitterCallbackUrl(): string {
  const base = getAppUrl().replace(/\/$/, "");
  return `${base}/api/auth/twitter/callback`;
}
