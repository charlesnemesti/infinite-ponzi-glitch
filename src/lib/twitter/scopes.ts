/** Minimal scopes for CONNECT_X login — avoids free-tier authorize failures */
export const TWITTER_LOGIN_SCOPES = ["users.read", "offline.access"].join(" ");

/** Quest verification fallbacks — not requested at login */
export const TWITTER_QUEST_SCOPES = ["tweet.read", "follows.read"].join(" ");
