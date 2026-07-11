import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/hero/HeroSection";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { ScoreReveal } from "@/components/score/ScoreReveal";
import { QuestGrid } from "@/components/quests/QuestGrid";
import { RewardsSection } from "@/components/rewards/RewardsSection";
import { NodeProfilePanel } from "@/components/profile/NodeProfilePanel";
import { FlashEventBanner } from "@/components/events/FlashEventBanner";
import { SquadPanel } from "@/components/squads/SquadPanel";
import { ScanlinesOverlay } from "@/components/effects/Terminal";
import { GlitchBackground, StatusBar } from "@/components/effects/GlitchEffects";
import { MOCK_QUESTS } from "@/lib/data/mock-leaderboard";

export default function Home() {
  return (
    <main className="noise-bg relative min-h-screen bg-[#030303] pb-8">
      <GlitchBackground />
      <ScanlinesOverlay />
      <FlashEventBanner />
      <Navbar />
      <HeroSection />
      <ScoreReveal />
      <Leaderboard />
      <NodeProfilePanel />
      <QuestGrid quests={MOCK_QUESTS} />
      <SquadPanel />
      <RewardsSection />
      <Footer />
      <StatusBar />
    </main>
  );
}
