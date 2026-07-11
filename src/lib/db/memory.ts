import { randomBytes } from "crypto";
import type {
  DbUser,
  FlashEvent,
  LeaderboardEntry,
  PointEvent,
  QuestCompletion,
  Referral,
  Squad,
} from "./types";
import { QUEST_REWARDS, REFERRAL_REWARD } from "./types";

function uid() {
  return randomBytes(16).toString("hex");
}

function refCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

type Store = {
  users: Map<string, DbUser>;
  usersByWallet: Map<string, string>;
  usersByTwitter: Map<string, string>;
  usersByRef: Map<string, string>;
  points: PointEvent[];
  quests: QuestCompletion[];
  referrals: Referral[];
  squads: Map<string, Squad>;
  squadsByCode: Map<string, string>;
  squadMembers: Map<string, Set<string>>;
  flashEvents: FlashEvent[];
  leaderboardCache: { data: LeaderboardEntry[]; at: number } | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __ipgStore: Store | undefined;
}

function getStore(): Store {
  if (!global.__ipgStore) {
    global.__ipgStore = {
      users: new Map(),
      usersByWallet: new Map(),
      usersByTwitter: new Map(),
      usersByRef: new Map(),
      points: [],
      quests: [],
      referrals: [],
      squads: new Map(),
      squadsByCode: new Map(),
      squadMembers: new Map(),
      flashEvents: [],
      leaderboardCache: null,
    };
    seedDemoUsers(global.__ipgStore);
  }
  return global.__ipgStore;
}

function seedDemoUsers(store: Store) {
  const demos = [
    { handle: "glitch_prophet", name: "GLITCH_PROPHET", avatar: "G", score: 142800, delta: 11800, refs: 12 },
    { handle: "ponzi_pilot_rh", name: "PonziPilot", avatar: "P", score: 108420, delta: 9200, refs: 8 },
    { handle: "stack_overflow_x", name: "StackOverflow", avatar: "S", score: 67420, delta: 5100, refs: 5 },
    { handle: "chainrunner4663", name: "ChainRunner", avatar: "R", score: 52100, delta: 3800, refs: 3 },
    { handle: "memefi_saint", name: "MemeFiSaint", avatar: "M", score: 44880, delta: 2900, refs: 2 },
    { handle: "node_hunter_ipg", name: "NodeHunter", avatar: "N", score: 39200, delta: 2100, refs: 1 },
    { handle: "rank_ghost_0x", name: "RankGhost", avatar: "Ξ", score: 33100, delta: 1600, refs: 0 },
    { handle: "xploit_king", name: "XploitKing", avatar: "X", score: 28750, delta: 1100, refs: 0 },
    { handle: "zeroday_ape", name: "ZeroDayApe", avatar: "Z", score: 25400, delta: 890, refs: 0 },
    { handle: "byte_bandit_rh", name: "ByteBandit", avatar: "B", score: 19880, delta: 620, refs: 0 },
  ];

  for (const d of demos) {
    const id = uid();
    const code = refCode();
    const user: DbUser = {
      id,
      wallet_address: null,
      twitter_id: `demo_${d.handle}`,
      twitter_username: d.handle,
      twitter_name: d.name,
      profile_image_url: null,
      referral_code: code,
      referred_by: null,
      squad_id: null,
      attention_score: d.score,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.users.set(id, user);
    store.usersByTwitter.set(user.twitter_id!, id);
    store.usersByRef.set(code, id);
    store.points.push({
      id: uid(),
      user_id: id,
      source: "seed",
      amount: d.score,
      multiplier: 1,
      created_at: new Date().toISOString(),
    });
  }
}

function getActiveMultiplier(store: Store): number {
  const now = Date.now();
  const active = store.flashEvents.find(
    (e) => e.active && new Date(e.starts_at).getTime() <= now && new Date(e.ends_at).getTime() > now,
  );
  return active?.multiplier ?? 1;
}

function recalcScore(store: Store, userId: string) {
  const user = store.users.get(userId);
  if (!user) return;
  const total = store.points
    .filter((p) => p.user_id === userId)
    .reduce((s, p) => s + p.amount * p.multiplier, 0);
  user.attention_score = Math.round(total);
  user.updated_at = new Date().toISOString();
  store.leaderboardCache = null;
}

export const memoryDb = {
  async upsertUser(data: {
    wallet?: string;
    twitter_id?: string;
    twitter_username?: string;
    twitter_name?: string;
    profile_image_url?: string;
    referred_by_code?: string;
  }): Promise<DbUser> {
    const store = getStore();
    let userId =
      (data.wallet && store.usersByWallet.get(data.wallet.toLowerCase())) ||
      (data.twitter_id && store.usersByTwitter.get(data.twitter_id));

    let user = userId ? store.users.get(userId) : undefined;

    if (!user) {
      const id = uid();
      const code = refCode();
      let referredBy: string | null = null;
      if (data.referred_by_code) {
        referredBy = store.usersByRef.get(data.referred_by_code.toUpperCase()) ?? null;
      }
      user = {
        id,
        wallet_address: data.wallet?.toLowerCase() ?? null,
        twitter_id: data.twitter_id ?? null,
        twitter_username: data.twitter_username ?? null,
        twitter_name: data.twitter_name ?? null,
        profile_image_url: data.profile_image_url ?? null,
        referral_code: code,
        referred_by: referredBy,
        squad_id: null,
        attention_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.users.set(id, user);
      store.usersByRef.set(code, id);
      if (user.wallet_address) store.usersByWallet.set(user.wallet_address, id);
      if (user.twitter_id) store.usersByTwitter.set(user.twitter_id, id);

      if (referredBy) {
        store.referrals.push({
          id: uid(),
          referrer_id: referredBy,
          referee_id: id,
          credited_at: null,
          created_at: new Date().toISOString(),
        });
      }
    } else {
      if (data.wallet) {
        user.wallet_address = data.wallet.toLowerCase();
        store.usersByWallet.set(user.wallet_address, user.id);
      }
      if (data.twitter_id) {
        user.twitter_id = data.twitter_id;
        user.twitter_username = data.twitter_username ?? user.twitter_username;
        user.twitter_name = data.twitter_name ?? user.twitter_name;
        user.profile_image_url = data.profile_image_url ?? user.profile_image_url;
        store.usersByTwitter.set(data.twitter_id, user.id);
      }
      user.updated_at = new Date().toISOString();
    }

    return user!;
  },

  async getUserByWallet(wallet: string): Promise<DbUser | null> {
    const store = getStore();
    const id = store.usersByWallet.get(wallet.toLowerCase());
    return id ? store.users.get(id) ?? null : null;
  },

  async getUserByRefCode(code: string): Promise<DbUser | null> {
    const store = getStore();
    const id = store.usersByRef.get(code.toUpperCase());
    return id ? store.users.get(id) ?? null : null;
  },

  async getUserById(id: string): Promise<DbUser | null> {
    return getStore().users.get(id) ?? null;
  },

  async addPoints(userId: string, source: string, amount: number): Promise<void> {
    const store = getStore();
    const mult = getActiveMultiplier(store);
    store.points.push({
      id: uid(),
      user_id: userId,
      source,
      amount,
      multiplier: mult,
      created_at: new Date().toISOString(),
    });
    recalcScore(store, userId);
  },

  async completeQuest(userId: string, questId: string): Promise<boolean> {
    const store = getStore();
    const exists = store.quests.some((q) => q.user_id === userId && q.quest_id === questId);
    if (exists) return false;
    store.quests.push({
      id: uid(),
      user_id: userId,
      quest_id: questId,
      verified_at: new Date().toISOString(),
    });
    const reward = QUEST_REWARDS[questId] ?? 0;
    if (reward > 0) await this.addPoints(userId, `quest:${questId}`, reward);
    return true;
  },

  async getQuestCompletions(userId: string): Promise<string[]> {
    return getStore()
      .quests.filter((q) => q.user_id === userId)
      .map((q) => q.quest_id);
  },

  async creditReferral(refereeId: string): Promise<void> {
    const store = getStore();
    const ref = store.referrals.find((r) => r.referee_id === refereeId && !r.credited_at);
    if (!ref) return;
    const referee = store.users.get(refereeId);
    if (!referee?.wallet_address || !referee.twitter_id) return;
    const quests = await this.getQuestCompletions(refereeId);
    if (quests.length < 2) return;

    ref.credited_at = new Date().toISOString();
    await this.addPoints(ref.referrer_id, "referral", REFERRAL_REWARD);
    await this.addPoints(refereeId, "referral_bonus", REFERRAL_REWARD);
    await this.completeQuest(ref.referrer_id, "invite-friend");
  },

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    const store = getStore();
    const CACHE_TTL = 4 * 60 * 60 * 1000;
    if (store.leaderboardCache && Date.now() - store.leaderboardCache.at < CACHE_TTL) {
      return store.leaderboardCache.data.slice(0, limit);
    }

    const users = [...store.users.values()]
      .filter((u) => u.twitter_username)
      .sort((a, b) => b.attention_score - a.attention_score);

    const entries: LeaderboardEntry[] = users.map((u, i) => {
      const refs = store.referrals.filter((r) => r.referrer_id === u.id && r.credited_at).length;
      const recentPoints = store.points
        .filter((p) => p.user_id === u.id)
        .slice(-5)
        .reduce((s, p) => s + p.amount, 0);
      return {
        rank: i + 1,
        handle: u.twitter_username!,
        displayName: u.twitter_name ?? u.twitter_username!,
        avatar: (u.twitter_username![0] ?? "?").toUpperCase(),
        score: u.attention_score,
        posts: store.quests.filter((q) => q.user_id === u.id).length,
        reach: Math.floor(u.attention_score / 100),
        supporters: refs,
        delta24h: Math.min(recentPoints, 99999),
        referrals: refs,
      };
    });

    store.leaderboardCache = { data: entries, at: Date.now() };
    return entries.slice(0, limit);
  },

  async getUserRank(userId: string): Promise<number> {
    const board = await this.getLeaderboard(500);
    const user = await this.getUserById(userId);
    if (!user?.twitter_username) return 0;
    return board.find((e) => e.handle === user.twitter_username)?.rank ?? 0;
  },

  async createSquad(leaderId: string, name: string): Promise<Squad> {
    const store = getStore();
    const code = refCode();
    const squad: Squad = {
      id: uid(),
      name,
      invite_code: code,
      leader_id: leaderId,
      created_at: new Date().toISOString(),
    };
    store.squads.set(squad.id, squad);
    store.squadsByCode.set(code, squad.id);
    store.squadMembers.set(squad.id, new Set([leaderId]));
    const leader = store.users.get(leaderId);
    if (leader) leader.squad_id = squad.id;
    return squad;
  },

  async joinSquad(userId: string, inviteCode: string): Promise<Squad | null> {
    const store = getStore();
    const squadId = store.squadsByCode.get(inviteCode.toUpperCase());
    if (!squadId) return null;
    const members = store.squadMembers.get(squadId) ?? new Set();
    if (members.size >= 10) return null;
    members.add(userId);
    store.squadMembers.set(squadId, members);
    const user = store.users.get(userId);
    if (user) user.squad_id = squadId;
    return store.squads.get(squadId) ?? null;
  },

  async getSquadLeaderboard(): Promise<{ name: string; invite_code: string; total_score: number; members: number }[]> {
    const store = getStore();
    return [...store.squads.values()]
      .map((s) => {
        const memberIds = store.squadMembers.get(s.id) ?? new Set();
        const total = [...memberIds].reduce(
          (sum, id) => sum + (store.users.get(id)?.attention_score ?? 0),
          0,
        );
        return { name: s.name, invite_code: s.invite_code, total_score: total, members: memberIds.size };
      })
      .sort((a, b) => b.total_score - a.total_score);
  },

  async getActiveFlashEvent(): Promise<FlashEvent | null> {
    const store = getStore();
    const now = Date.now();
    return (
      store.flashEvents.find(
        (e) => e.active && new Date(e.starts_at).getTime() <= now && new Date(e.ends_at).getTime() > now,
      ) ?? null
    );
  },

  async ensureDefaultFlashEvent(): Promise<FlashEvent> {
    const store = getStore();
    const existing = await this.getActiveFlashEvent();
    if (existing) return existing;

    const starts = new Date();
    const ends = new Date(starts.getTime() + 24 * 60 * 60 * 1000);
    const event: FlashEvent = {
      id: uid(),
      multiplier: 3,
      starts_at: starts.toISOString(),
      ends_at: ends.toISOString(),
      active: true,
    };
    store.flashEvents.push(event);
    return event;
  },
};
