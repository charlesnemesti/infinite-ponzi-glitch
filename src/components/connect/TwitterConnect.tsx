"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import type { TwitterSession } from "@/types";
import { useUser } from "@/hooks/useUser";

type TwitterConnectProps = {
  compact?: boolean;
  onConnected?: () => void;
};

const ERROR_MESSAGES: Record<string, string> = {
  error: "X auth cancelled",
  missing: "Missing auth code",
  invalid_state: "Invalid session — try again",
  failed: "X auth failed — check credentials",
  not_configured: "X OAuth not configured",
  conflict: "X account already linked to another wallet",
};

const X_PORTAL_HINT =
  "Register callback at developer.x.com: https://www.infiniteponsiglitch.fun/api/auth/twitter/callback";

export function TwitterConnect({ compact = false, onConnected }: TwitterConnectProps) {
  const { address } = useAccount();
  const { sync, refreshTwitterSession } = useUser();
  const [session, setSession] = useState<TwitterSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = async () => {
    const data = await refreshTwitterSession();
    setSession(data);
    setLoading(false);
    return data;
  };

  useEffect(() => {
    loadSession();
    fetch("/api/auth/twitter/status")
      .then((r) => r.json())
      .then((d) => {
        setDevMode(Boolean(d.devFallback));
      });
  }, [refreshTwitterSession]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const twitterStatus = params.get("twitter");
    const detail = params.get("detail");
    if (twitterStatus === "connected") {
      setError(null);
      loadSession().then(() => {
        onConnected?.();
        sync();
      });
    } else if (twitterStatus && ERROR_MESSAGES[twitterStatus]) {
      const base = detail
        ? `${ERROR_MESSAGES[twitterStatus]}: ${decodeURIComponent(detail)}`
        : ERROR_MESSAGES[twitterStatus];
      const needsPortalHint = twitterStatus === "failed" || twitterStatus === "error";
      setError(needsPortalHint ? `${base} — ${X_PORTAL_HINT}` : base);
    }
  }, [onConnected, sync, refreshTwitterSession]);

  const handleConnect = () => {
    setConnecting(true);
    setError(null);
    const walletParam = address ? `?wallet=${encodeURIComponent(address)}` : "";
    window.location.href = `/api/auth/twitter${walletParam}`;
  };

  const handleDisconnect = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    setSession({ connected: false });
  };

  if (loading) {
    return <div className="h-8 w-24 animate-pulse border border-terminal/30 bg-black" />;
  }

  if (session?.connected && session.username) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2 font-mono">
          <div className="flex items-center gap-2 border border-terminal bg-terminal/10 px-2 py-1">
            {session.profileImageUrl ? (
              <Image
                src={session.profileImageUrl}
                alt={session.username}
                width={18}
                height={18}
                className="grayscale"
              />
            ) : (
              <span className="text-xs text-terminal">𝕏</span>
            )}
            {!compact && (
              <span className="text-[10px] text-terminal">@{session.username}</span>
            )}
          </div>
          {!compact && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-[10px] uppercase text-dim hover:text-[#ff0080]"
            >
              [DISC]
            </button>
          )}
        </div>
        {devMode && <span className="text-[9px] text-dim">dev_x_session</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleConnect}
        disabled={connecting}
        className="btn-terminal-ghost px-3 py-1.5 text-[10px] disabled:opacity-50"
      >
        <span>𝕏</span>
        {connecting ? "LINKING..." : compact ? "LINK_X" : "CONNECT_X"}
      </button>
      {address && !compact && (
        <span className="text-[9px] text-dim">wallet will link on auth</span>
      )}
      {error && (
        <span className="max-w-[200px] text-right text-[9px] text-[#ff0080]">{error}</span>
      )}
      {devMode && !error && (
        <span className="text-[9px] text-dim">dev mode (no X API keys)</span>
      )}
    </div>
  );
}
