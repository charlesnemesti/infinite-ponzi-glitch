import { db } from "@/lib/db";
import { getReferralCookie, getTwitterSession } from "@/lib/auth/session";

export class LinkConflictError extends Error {
  constructor() {
    super("TWITTER_WALLET_CONFLICT");
    this.name = "LinkConflictError";
  }
}

type TwitterLinkData = {
  twitter_id?: string;
  twitter_username?: string;
  twitter_name?: string;
  profile_image_url?: string;
};

export async function linkWalletAccount(
  wallet: string,
  options?: { refCode?: string | null; twitter?: TwitterLinkData },
) {
  const refCode = options?.refCode ?? (await getReferralCookie());
  const session = await getTwitterSession();
  const override = options?.twitter;

  const twitterId = override?.twitter_id ?? session.twitter_id;
  const twitterUsername = override?.twitter_username ?? session.username;
  const twitterName = override?.twitter_name ?? session.name;
  const profileImageUrl = override?.profile_image_url ?? session.profileImageUrl;

  let user;
  try {
    user = await db.upsertUser({
      wallet,
      twitter_id: twitterId,
      twitter_username: twitterUsername,
      twitter_name: twitterName,
      profile_image_url: profileImageUrl,
      referred_by_code: refCode ?? undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    if (message.includes("TWITTER_WALLET_CONFLICT")) {
      throw new LinkConflictError();
    }
    throw e;
  }

  if (twitterId || session.connected) {
    const completed = await db.getQuestCompletions(user.id);
    if (!completed.includes("connect-x")) {
      await db.completeQuest(user.id, "connect-x");
    }
  }

  const walletDone = (await db.getQuestCompletions(user.id)).includes("connect-wallet");
  if (!walletDone) {
    await db.completeQuest(user.id, "connect-wallet");
  }

  await db.creditReferral(user.id);

  const rank = await db.getUserRank(user.id);
  const completedQuests = await db.getQuestCompletions(user.id);

  return {
    user: {
      id: user.id,
      wallet: user.wallet_address,
      username: user.twitter_username,
      referral_code: user.referral_code,
      score: user.attention_score,
      rank,
      squad_id: user.squad_id,
    },
    completedQuests,
  };
}
