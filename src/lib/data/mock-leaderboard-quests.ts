import { xMention } from "@/lib/social/config";
import type { Quest } from "@/types";

export const MOCK_QUESTS: Quest[] = [
  {
    id: "connect-wallet",
    title: "Connect Wallet",
    description: "Link your wallet on Robinhood Chain mainnet to unlock the quest board.",
    reward: 500,
    category: "onchain",
    status: "available",
    icon: "wallet",
  },
  {
    id: "connect-x",
    title: "Connect X Account",
    description: "Verify your X profile to start earning attention points.",
    reward: 1000,
    category: "social",
    status: "available",
    icon: "twitter",
    multiplier: 2,
  },
  {
    id: "follow-project",
    title: `Follow ${xMention()}`,
    description: `Follow ${xMention()} on X — official project node. All social quests verify against this account.`,
    reward: 750,
    category: "social",
    status: "locked",
    icon: "follow",
  },
  {
    id: "retweet-launch",
    title: "Retweet Launch Post",
    description: "Amplify the pinned launch thread to boost your reach score.",
    reward: 1500,
    category: "social",
    status: "locked",
    icon: "retweet",
    multiplier: 3,
  },
  {
    id: "invite-friend",
    title: "Invite a Friend",
    description: "Share your referral code. Both wallets earn bonus points.",
    reward: 2000,
    category: "referral",
    status: "locked",
    icon: "users",
    multiplier: 5,
  },
  {
    id: "write-opinion",
    title: "Write an Opinion Piece",
    description: "Publish a thread or article about Robinhood Chain ecosystem.",
    reward: 5000,
    category: "content",
    status: "locked",
    icon: "pen",
    multiplier: 10,
  },
];

export const SEASON_STATS = {
  rewardSupplyPercent: 30,
  daysLeft: 10,
  totalPosters: 271,
  totalPosts: 1842,
  totalReach: 2_400_000,
  totalLikes: 89_400,
};
