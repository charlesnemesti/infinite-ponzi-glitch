"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useConnect } from "wagmi";
import { robinhoodChain } from "@/lib/chains/robinhood";
import { useCallback, useEffect, useState } from "react";

type MetaMaskConnectProps = {
  compact?: boolean;
};

async function ensureRobinhoodChain(): Promise<void> {
  const ethereum = (window as Window & { ethereum?: { request: (args: unknown) => Promise<unknown> } }).ethereum;
  if (!ethereum) return;

  const chainIdHex = `0x${robinhoodChain.id.toString(16)}`;

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (err: unknown) {
    const code = (err as { code?: number }).code;
    if (code !== 4902) throw err;

    await ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainIdHex,
          chainName: robinhoodChain.name,
          nativeCurrency: robinhoodChain.nativeCurrency,
          rpcUrls: robinhoodChain.rpcUrls.default.http,
          blockExplorerUrls: [robinhoodChain.blockExplorers.default.url],
        },
      ],
    });
  }
}

export function MetaMaskConnect({ compact = false }: MetaMaskConnectProps) {
  const { isConnected, chainId } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const [mounted, setMounted] = useState(false);
  const [chainError, setChainError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const switchToRobinhood = useCallback(async () => {
    try {
      setChainError(null);
      await ensureRobinhoodChain();
    } catch {
      setChainError("Could not switch to Robinhood Chain");
    }
  }, []);

  useEffect(() => {
    if (isConnected && chainId && chainId !== robinhoodChain.id) {
      switchToRobinhood();
    }
  }, [isConnected, chainId, switchToRobinhood]);

  if (!mounted) {
    return <div className="h-8 w-28 animate-pulse border border-terminal/30 bg-black" />;
  }

  const metaMaskConnector =
    connectors.find((c) => c.id === "metaMask" || c.name === "MetaMask") ??
    connectors.find((c) => c.id === "injected" || c.type === "injected");

  const connectMetaMask = async () => {
    if (!metaMaskConnector) return;
    try {
      await ensureRobinhoodChain();
    } catch {
      // Chain may not exist yet — connect will prompt add network
    }
    connect({ connector: metaMaskConnector, chainId: robinhoodChain.id });
  };

  if (isConnected) {
    return (
      <div className="flex flex-col items-end gap-1">
        <ConnectButton
          chainStatus={compact ? "icon" : "full"}
          accountStatus={compact ? "avatar" : "full"}
          showBalance={false}
        />
        {chainId !== robinhoodChain.id && (
          <button
            type="button"
            onClick={switchToRobinhood}
            className="text-[9px] text-[#ff0080] hover:underline"
          >
            Switch to RH Chain
          </button>
        )}
        {chainError && (
          <span className="text-[9px] text-[#ff0080]">{chainError}</span>
        )}
      </div>
    );
  }

  const hasMetaMask =
    typeof window !== "undefined" &&
    Boolean(
      (window as Window & { ethereum?: { isMetaMask?: boolean } }).ethereum?.isMetaMask,
    );

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={connectMetaMask}
        disabled={isPending}
        className="btn-terminal px-3 py-1.5 text-[10px] disabled:opacity-50"
      >
        {isPending ? "CONNECTING..." : compact ? "METAMASK" : "CONNECT METAMASK"}
      </button>
      {!hasMetaMask && !metaMaskConnector && (
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-[#00f0ff] hover:underline"
        >
          Install MetaMask
        </a>
      )}
      {error && (
        <span className="max-w-[200px] text-right text-[9px] text-[#ff0080]">
          {error.message.includes("rejected")
            ? "Connection rejected"
            : "MetaMask connection failed"}
        </span>
      )}
    </div>
  );
}
