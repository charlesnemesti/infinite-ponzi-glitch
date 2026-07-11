"use client";

import { useUser } from "@/hooks/useUser";

function truncateWallet(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function LinkStatusPanel() {
  const { user, walletConnected, twitterConnected, isLinked, loading, address, sync } = useUser();

  return (
    <div className="border border-terminal/50 bg-black/80 p-4 font-mono">
      <p className="mb-3 text-[10px] uppercase tracking-wider text-[#00f0ff]">
        {">"} identity_link_status
      </p>

      <div className="space-y-2 text-[11px]">
        <StatusRow
          label="WALLET"
          ok={walletConnected}
          detail={address ? truncateWallet(address) : "not connected"}
        />
        <StatusRow
          label="X_ACCOUNT"
          ok={twitterConnected}
          detail={user?.username ? `@${user.username}` : "not connected"}
        />
        <StatusRow
          label="LINKED"
          ok={isLinked}
          detail={isLinked ? "wallet ↔ X synced" : "connect both to link"}
        />
      </div>

      {walletConnected && twitterConnected && !isLinked && !loading && (
        <button
          type="button"
          onClick={() => sync()}
          className="btn-terminal mt-3 w-full py-1.5 text-[10px]"
        >
          {">"} FORCE_SYNC
        </button>
      )}

      {isLinked && user && (
        <div className="mt-3 border-t border-terminal/30 pt-3 text-[10px] text-dim">
          <p>
            SCORE: <span className="text-terminal">{user.score.toLocaleString()} XP</span>
          </p>
          <p>
            RANK: <span className="text-[#00f0ff]">#{user.rank || "—"}</span>
          </p>
          <p className="mt-1 truncate">REF: {user.referral_code}</p>
        </div>
      )}
    </div>
  );
}

function StatusRow({
  label,
  ok,
  detail,
}: {
  label: string;
  ok: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-dim">{label}</span>
      <span className="flex items-center gap-2">
        <span className={ok ? "text-terminal" : "text-dim"}>{detail}</span>
        <span className={ok ? "text-terminal" : "text-[#ff0080]"}>{ok ? "[OK]" : "[--]"}</span>
      </span>
    </div>
  );
}
