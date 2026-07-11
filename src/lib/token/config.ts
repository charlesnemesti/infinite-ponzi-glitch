import { robinhoodChain } from "@/lib/chains/robinhood";

/** $IPG token contract on Robinhood Chain mainnet (4663) */
export const TOKEN_CA =
  process.env.NEXT_PUBLIC_TOKEN_CA ?? "0x28a213ea1a49e53a5022e9a6209c1dafdfd47777";

export const TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL ?? "IPG";

const explorer = robinhoodChain.blockExplorers?.default.url ?? "https://robinhoodchain.blockscout.com";

export const TOKEN_EXPLORER_URL = `${explorer}/token/${TOKEN_CA}`;

export function truncateCa(address: string, head = 6, tail = 4): string {
  if (address.length <= head + tail + 2) return address;
  return `${address.slice(0, head + 2)}…${address.slice(-tail)}`;
}
