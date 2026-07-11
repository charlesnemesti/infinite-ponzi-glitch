export type LeaderboardEntry = {
  rank: number;
  handle: string;
  displayName: string;
  avatar: string;
  score: number;
  posts: number;
  reach: number;
  supporters: number;
  delta24h: number;
  referrals?: number;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: "social" | "onchain" | "referral" | "content";
  status: "available" | "completed" | "locked";
  icon: string;
  multiplier?: number;
};

export type TwitterSession = {
  connected: boolean;
  username?: string;
  name?: string;
  profileImageUrl?: string;
  score?: number;
  twitter_id?: string;
};

export type UserProfile = {
  id: string;
  wallet: string | null;
  username: string | null;
  referral_code: string;
  score: number;
  rank: number;
  squad_id: string | null;
};
