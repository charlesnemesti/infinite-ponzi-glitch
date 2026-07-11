# Infinite Ponzi Glitch

Terminal glitcheada de AttentionFi en **Robinhood Chain mainnet** (Chain ID `4663`).

Inspiración visual: [HoodTracker](https://www.hoodtracker.com/) — estética CRT, monospace, scanlines, texto corrupto.

## Qué incluye

- UI terminal con scanlines, glitch text, boot sequence animada
- Leaderboard (`RANK_MATRIX`) en vivo vía `/api/leaderboard` + snapshot cada 4h
- Quest board (`QUEST_LOG`) con verificación real (wallet, X, follow, retweet)
- Connect Wallet (RainbowKit → mainnet 4663)
- Connect X (OAuth 2.0 PKCE)
- Score reveal + **POST TO X** con OG score card (`/api/og/score`)
- Referral loop (`?ref=`, `ReferralPanel`, XP bilateral)
- Flash Glitch Events (3x XP banner)
- Squads (clanes 5–10, multiplicador de equipo)
- Backend Supabase (o in-memory fallback para dev local)

## Setup

```bash
cd "Infinite ponzi glitch"
cp .env.example .env.local
npm install --legacy-peer-deps
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Supabase (producción)

1. Crea proyecto en [supabase.com](https://supabase.com)
2. Ejecuta `supabase/schema.sql` en el SQL Editor
3. Añade `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` a `.env.local`

Sin Supabase, la app usa almacenamiento in-memory con usuarios demo.

### Variables `.env.local`

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | URL pública de la app |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud |
| `TWITTER_CLIENT_ID` / `TWITTER_CLIENT_SECRET` | X Developer Portal |
| `TWITTER_CALLBACK_URL` | `http://localhost:3000/api/auth/twitter/callback` |
| `TWITTER_OFFICIAL_USER_ID` | User ID de @infinite_ponzi_glitch |
| `TWITTER_LAUNCH_TWEET_ID` | Tweet ID del pin de launch (quest retweet) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |

## Twitter / X OAuth

Ver guía completa: [`docs/TWITTER_SETUP.md`](docs/TWITTER_SETUP.md)

```bash
npm run verify:twitter   # valida .env.local
```

Producción: [`docs/VERCEL_TWITTER.md`](docs/VERCEL_TWITTER.md)

## Launch GTM

Ver [`docs/LAUNCH_GTM.md`](docs/LAUNCH_GTM.md) — hilo de launch, outreach KOLs, métricas target.

## Estética terminal

- **Verde fosforescente** `#00ff41` — texto principal
- **Cyan glitch** `#00f0ff` — scores y acentos
- **Magenta glitch** `#ff0080` — errores y alertas
- **Fuente** Share Tech Mono + JetBrains Mono
- **Efectos** scanlines CRT, flicker, glitch text, ASCII logo, boot sequence

## API routes

| Route | Descripción |
|-------|-------------|
| `POST /api/user/sync` | Vincula wallet + X, acredita quests y referrals |
| `GET /api/leaderboard` | Rank matrix en vivo |
| `POST /api/quests/[id]/complete` | Verifica y completa quest |
| `GET /api/referral/track?ref=` | Tracking de referral (cookie) |
| `GET /api/og/score` | OG image dinámica para share card |
| `GET /api/events/active` | Flash event activo |
| `POST/GET /api/squads` | Crear/listar squads |
| `POST /api/squads/join` | Unirse a squad |
