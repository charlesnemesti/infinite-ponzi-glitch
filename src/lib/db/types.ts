export type DbUser = {
  id: string;
  wallet_address: string | null;
  twitter_id: string | null;
  twitter_username: string | null;
  twitter_name: string | null;
  profile_image_url: string | null;
  referral_code: string;
  referred_by: string | null;
  squad_id: string | null;
  attention_score: number;
  created_at: string;
  updated_at: string;
};

export type PointEvent = {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  multiplier: number;
  created_at: string;
};

export type QuestCompletion = {
  id: string;
  user_id: string;
  quest_id: string;
  verified_at: string;
};

export type Referral = {
  id: string;
  referrer_id: string;
  referee_id: string;
  credited_at: string | null;
  created_at: string;
};

export type Squad = {
  id: string;
  name: string;
  invite_code: string;
  leader_id: string;
  created_at: string;
};

export type FlashEvent = {
  id: string;
  multiplier: number;
  starts_at: string;
  ends_at: string;
  active: boolean;
};

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

export const QUEST_REWARDS: Record<string, number> = {
  "connect-wallet": 500,
  "connect-x": 1000,
  "follow-project": 750,
  "retweet-launch": 1500,
  "invite-friend": 2000,
  "write-opinion": 5000,
};

export const REFERRAL_REWARD = 2000;
