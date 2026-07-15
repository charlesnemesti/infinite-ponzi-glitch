import { robinhoodChain } from "@/lib/chains/robinhood";
import { BRAND_SHORT } from "@/lib/brand/config";

/** Token contract — set via NEXT_PUBLIC_TOKEN_CA when live */
export const TOKEN_CA = process.env.NEXT_PUBLIC_TOKEN_CA?.trim() ?? "";

export const TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL?.trim() || BRAND_SHORT;

const explorer = robinhoodChain.blockExplorers?.default.url ?? "https://robinhoodchain.blockscout.com";

export function hasTokenCa(): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(TOKEN_CA);
}

export const TOKEN_EXPLORER_URL = hasTokenCa() ? `${explorer}/token/${TOKEN_CA}` : "";

export function truncateCa(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head + 2)}…${address.slice(-tail)}`;
}
