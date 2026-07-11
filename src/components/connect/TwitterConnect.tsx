"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { TwitterSession } from "@/types";

type TwitterConnectProps = {
  compact?: boolean;
};

const ERROR_MESSAGES: Record<string, string> = {
  error: "X auth cancelled",
  missing: "Missing auth code",
  invalid_state: "Invalid session — try again",
  failed: "X auth failed — check credentials",
  not_configured: "X OAuth not configured — see docs/TWITTER_SETUP.md",
};

export function TwitterConnect({ compact = false }: TwitterConnectProps) {
  const [session, setSession] = useState<TwitterSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [notReady, setNotReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = () => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: TwitterSession) => setSession(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSession();
    fetch("/api/auth/twitter/status")
      .then((r) => r.json())
      .then((d) => {
        setDevMode(Boolean(d.devFallback));
        setNotReady(!d.ready && !d.devFallback);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const twitterStatus = params.get("twitter");
    const detail = params.get("detail");
    if (twitterStatus && ERROR_MESSAGES[twitterStatus]) {
      setError(detail ? `${ERROR_MESSAGES[twitterStatus]}: ${decodeURIComponent(detail)}` : ERROR_MESSAGES[twitterStatus]);
    } else if (twitterStatus === "connected") {
      setError(null);
      loadSession();
    }
  }, []);

  const handleConnect = () => {
    setConnecting(true);
    setError(null);
    window.location.href = "/api/auth/twitter";
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
        {devMode && (
          <span className="text-[9px] text-dim">dev_x_session</span>
        )}
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
      {error && (
        <span className="max-w-[180px] text-right text-[9px] text-[#ff0080]">{error}</span>
      )}
      {devMode && !error && (
        <span className="text-[9px] text-dim">dev mode (no X API keys)</span>
      )}
      {notReady && !error && (
        <span className="max-w-[180px] text-right text-[9px] text-dim">
          Fill .env.local — npm run verify:twitter
        </span>
      )}
    </div>
  );
}
