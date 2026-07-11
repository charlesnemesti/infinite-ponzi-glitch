import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { memoryDb } from "./memory";
import type { DbUser, FlashEvent, LeaderboardEntry, Squad } from "./types";
import { QUEST_REWARDS, REFERRAL_REWARD } from "./types";

let supabase: SupabaseClient | null = null;

function getSupabase() {
  if (supabase) return supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  supabase = createClient(url, key);
  return supabase;
}

function useMemory() {
  return !getSupabase();
}

export const db = {
  async upsertUser(data: Parameters<typeof memoryDb.upsertUser>[0]): Promise<DbUser> {
    if (useMemory()) return memoryDb.upsertUser(data);

    const sb = getSupabase()!;
    const { data: walletUser } = data.wallet
      ? await sb.from("users").select("*").eq("wallet_address", data.wallet.toLowerCase()).maybeSingle()
      : { data: null };
    const { data: twitterUser } = data.twitter_id
      ? await sb.from("users").select("*").eq("twitter_id", data.twitter_id).maybeSingle()
      : { data: null };

    if (walletUser && twitterUser && walletUser.id !== twitterUser.id) {
      throw new Error("TWITTER_WALLET_CONFLICT");
    }

    const existing = walletUser ?? twitterUser;

    let referredBy: string | null = null;
    if (data.referred_by_code) {
      const { data: referrer } = await sb
        .from("users")
        .select("id")
        .eq("referral_code", data.referred_by_code.toUpperCase())
        .maybeSingle();
      referredBy = referrer?.id ?? null;
    }

    if (existing) {
      const { data: updated, error } = await sb
        .from("users")
        .update({
          wallet_address: data.wallet?.toLowerCase() ?? existing.wallet_address,
          twitter_id: data.twitter_id ?? existing.twitter_id,
          twitter_username: data.twitter_username ?? existing.twitter_username,
          twitter_name: data.twitter_name ?? existing.twitter_name,
          profile_image_url: data.profile_image_url ?? existing.profile_image_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing!.id)
        .select()
        .single();
      if (error) throw error;
      return updated as DbUser;
    }

    const referralCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data: created, error } = await sb
      .from("users")
      .insert({
        wallet_address: data.wallet?.toLowerCase() ?? null,
        twitter_id: data.twitter_id ?? null,
        twitter_username: data.twitter_username ?? null,
        twitter_name: data.twitter_name ?? null,
        profile_image_url: data.profile_image_url ?? null,
        referral_code: referralCode,
        referred_by: referredBy,
        attention_score: 0,
      })
      .select()
      .single();
    if (error) throw error;

    if (referredBy && created) {
      await sb.from("referrals").insert({ referrer_id: referredBy, referee_id: created.id });
    }

    return created as DbUser;
  },

  async getUserByWallet(wallet: string) {
    if (useMemory()) return memoryDb.getUserByWallet(wallet);
    const sb = getSupabase()!;
    const { data } = await sb.from("users").select("*").eq("wallet_address", wallet.toLowerCase()).maybeSingle();
    return (data as DbUser) ?? null;
  },

  async getUserByRefCode(code: string) {
    if (useMemory()) return memoryDb.getUserByRefCode(code);
    const sb = getSupabase()!;
    const { data } = await sb.from("users").select("*").eq("referral_code", code.toUpperCase()).maybeSingle();
    return (data as DbUser) ?? null;
  },

  async getUserById(id: string) {
    if (useMemory()) return memoryDb.getUserById(id);
    const sb = getSupabase()!;
    const { data } = await sb.from("users").select("*").eq("id", id).maybeSingle();
    return (data as DbUser) ?? null;
  },

  async addPoints(userId: string, source: string, amount: number) {
    if (useMemory()) return memoryDb.addPoints(userId, source, amount);
    const sb = getSupabase()!;
    const flash = await this.getActiveFlashEvent();
    const mult = flash?.multiplier ?? 1;
    await sb.from("point_events").insert({ user_id: userId, source, amount, multiplier: mult });
    const { data: points } = await sb.from("point_events").select("amount,multiplier").eq("user_id", userId);
    const total = (points ?? []).reduce((s, p) => s + p.amount * p.multiplier, 0);
    await sb.from("users").update({ attention_score: Math.round(total), updated_at: new Date().toISOString() }).eq("id", userId);
  },

  async completeQuest(userId: string, questId: string) {
    if (useMemory()) return memoryDb.completeQuest(userId, questId);
    const sb = getSupabase()!;
    const { data: existing } = await sb
      .from("quest_completions")
      .select("id")
      .eq("user_id", userId)
      .eq("quest_id", questId)
      .maybeSingle();
    if (existing) return false;
    await sb.from("quest_completions").insert({ user_id: userId, quest_id: questId });
    const reward = QUEST_REWARDS[questId] ?? 0;
    if (reward > 0) await this.addPoints(userId, `quest:${questId}`, reward);
    return true;
  },

  async getQuestCompletions(userId: string) {
    if (useMemory()) return memoryDb.getQuestCompletions(userId);
    const sb = getSupabase()!;
    const { data } = await sb.from("quest_completions").select("quest_id").eq("user_id", userId);
    return (data ?? []).map((q) => q.quest_id as string);
  },

  async creditReferral(refereeId: string) {
    if (useMemory()) return memoryDb.creditReferral(refereeId);
    const sb = getSupabase()!;
    const { data: ref } = await sb
      .from("referrals")
      .select("*")
      .eq("referee_id", refereeId)
      .is("credited_at", null)
      .maybeSingle();
    if (!ref) return;
    const referee = await this.getUserById(refereeId);
    if (!referee?.wallet_address || !referee.twitter_id) return;
    const quests = await this.getQuestCompletions(refereeId);
    if (quests.length < 2) return;
    await sb.from("referrals").update({ credited_at: new Date().toISOString() }).eq("id", ref.id);
    await this.addPoints(ref.referrer_id, "referral", REFERRAL_REWARD);
    await this.addPoints(refereeId, "referral_bonus", REFERRAL_REWARD);
    await this.completeQuest(ref.referrer_id, "invite-friend");
  },

  async getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
    if (useMemory()) return memoryDb.getLeaderboard(limit);
    const sb = getSupabase()!;
    const { data: snap } = await sb
      .from("leaderboard_snapshots")
      .select("data,snapshot_at")
      .order("snapshot_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const CACHE_TTL = 4 * 60 * 60 * 1000;
    if (snap && Date.now() - new Date(snap.snapshot_at).getTime() < CACHE_TTL) {
      return (snap.data as LeaderboardEntry[]).slice(0, limit);
    }

    const entries = await memoryDb.getLeaderboard(limit);
    await sb.from("leaderboard_snapshots").insert({ data: entries, snapshot_at: new Date().toISOString() });
    return entries;
  },

  async getUserRank(userId: string) {
    if (useMemory()) return memoryDb.getUserRank(userId);
    const board = await this.getLeaderboard(500);
    const user = await this.getUserById(userId);
    if (!user?.twitter_username) return 0;
    return board.find((e) => e.handle === user.twitter_username)?.rank ?? 0;
  },

  async createSquad(leaderId: string, name: string): Promise<Squad> {
    if (useMemory()) return memoryDb.createSquad(leaderId, name);
    const sb = getSupabase()!;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data, error } = await sb.from("squads").insert({ name, invite_code: code, leader_id: leaderId }).select().single();
    if (error) throw error;
    await sb.from("squad_members").insert({ squad_id: data.id, user_id: leaderId });
    await sb.from("users").update({ squad_id: data.id }).eq("id", leaderId);
    return data as Squad;
  },

  async joinSquad(userId: string, inviteCode: string) {
    if (useMemory()) return memoryDb.joinSquad(userId, inviteCode);
    const sb = getSupabase()!;
    const { data: squad } = await sb.from("squads").select("*").eq("invite_code", inviteCode.toUpperCase()).maybeSingle();
    if (!squad) return null;
    const { count } = await sb.from("squad_members").select("*", { count: "exact", head: true }).eq("squad_id", squad.id);
    if ((count ?? 0) >= 10) return null;
    await sb.from("squad_members").insert({ squad_id: squad.id, user_id: userId });
    await sb.from("users").update({ squad_id: squad.id }).eq("id", userId);
    return squad as Squad;
  },

  async getSquadLeaderboard() {
    if (useMemory()) return memoryDb.getSquadLeaderboard();
    return memoryDb.getSquadLeaderboard();
  },

  async getActiveFlashEvent(): Promise<FlashEvent | null> {
    if (useMemory()) return memoryDb.getActiveFlashEvent();
    const sb = getSupabase()!;
    const now = new Date().toISOString();
    const { data } = await sb
      .from("flash_events")
      .select("*")
      .eq("active", true)
      .lte("starts_at", now)
      .gte("ends_at", now)
      .maybeSingle();
    return (data as FlashEvent) ?? null;
  },

  async ensureDefaultFlashEvent(): Promise<FlashEvent> {
    if (useMemory()) return memoryDb.ensureDefaultFlashEvent();
    const existing = await this.getActiveFlashEvent();
    if (existing) return existing;
    const sb = getSupabase()!;
    const starts = new Date();
    const ends = new Date(starts.getTime() + 24 * 60 * 60 * 1000);
    const { data } = await sb
      .from("flash_events")
      .insert({ multiplier: 3, starts_at: starts.toISOString(), ends_at: ends.toISOString(), active: true })
      .select()
      .single();
    return data as FlashEvent;
  },
};
