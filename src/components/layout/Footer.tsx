import { BrandLogo } from "@/components/brand/BrandLogo";

export function Footer() {
  return (
    <footer id="docs" className="border-t border-terminal py-10 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 font-mono">
            <BrandLogo size="md" />
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-terminal">
                Infinite Ponzi Glitch
              </p>
              <p className="mt-1 text-xs text-dim">
                {">"} ATTENTION_FI :: ROBINHOOD_CHAIN [4663] :: MAINNET
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 font-mono text-xs uppercase tracking-wider text-dim">
            <a href="#leaderboard" className="hover:text-terminal">
              RANK_MATRIX
            </a>
            <a href="#quests" className="hover:text-terminal">
              QUEST_LOG
            </a>
            <a href="#rewards" className="hover:text-terminal">
              REWARD_POOL
            </a>
            <a
              href="https://docs.robinhood.com/chain/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00f0ff]"
            >
              CHAIN_DOCS
            </a>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-dim">
          © {new Date().getFullYear()} INFINITE_PONZI_GLITCH // NO WARRANTY // STACK MAY OVERFLOW
        </p>
      </div>
    </footer>
  );
}
