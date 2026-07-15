# Configuración de la API de X (Twitter)

Guía para conectar OAuth 2.0 real en Infinite Ponzi Glitch.

## 1. Portal de desarrollador (developer.x.com)

1. Entra en [https://developer.x.com](https://developer.x.com) con **@InfPonsiGlitch**.
2. Crea un **Project** → **App**.
3. Ve a **User authentication settings** → **Set up**.
4. Configura:
   - **App type:** Web App
   - **App permissions:** Read
   - **Callback URLs** (añade ambas si usas local + prod):
     ```
     http://localhost:3000/api/auth/twitter/callback
     https://www.infiniteponziglitch.fun/api/auth/twitter/callback
     ```
   - **Website URL:** `http://localhost:3000` o tu dominio
5. Guarda y copia **OAuth 2.0 Client ID** y **Client Secret**.

## 2. Scopes requeridos

La app solicita automáticamente:

- `tweet.read` — verificar retweets
- `users.read` — login y perfil
- `follows.read` — verificar follow
- `offline.access` — refresh token (renovación automática)

## 3. Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
TWITTER_CLIENT_ID=tu_client_id
TWITTER_CLIENT_SECRET=tu_client_secret
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback
NEXT_PUBLIC_OFFICIAL_X_HANDLE=InfPonsiGlitch
TWITTER_OFFICIAL_USER_ID=2077399136232439808
TWITTER_LAUNCH_TWEET_ID=
ALLOW_TWITTER_DEV=false
```

### Obtener IDs

| Variable | Cómo obtenerla |
|----------|----------------|
| `TWITTER_OFFICIAL_USER_ID` | [tweeterid.com](https://tweeterid.com) con tu @handle |
| `TWITTER_LAUNCH_TWEET_ID` | URL del tweet: `x.com/user/status/ESTE_NUMERO` |

## 4. Verificar configuración

```bash
npm run verify:twitter
```

O abre: `http://localhost:3000/api/auth/twitter/status`

Respuesta esperada con OAuth real:

```json
{
  "configured": true,
  "devFallback": false,
  "questsConfigured": true,
  "ready": true
}
```

## 5. Probar flujo wallet ↔ X

1. `npm run dev` (reinicia tras cambiar `.env.local`)
2. Conecta **MetaMask** primero (Robinhood Chain, id 4663)
3. Click **CONNECT_X** → OAuth en `twitter.com/i/oauth2/authorize`
   - Si ya tienes wallet conectada, la dirección se guarda en cookie y se vincula automáticamente al volver
4. Autoriza → vuelves con `?twitter=connected&linked=1`
5. El panel **identity_link_status** debe mostrar WALLET + X_ACCOUNT + LINKED `[OK]`
6. Sigue @InfPonsiGlitch + retweetea el pin → **EXEC** en quests

Orden alternativo: conectar X primero y wallet después — el sync se dispara al conectar MetaMask.

## 6. Producción (Vercel)

Ver [VERCEL_TWITTER.md](./VERCEL_TWITTER.md).

## Errores comunes

| Síntoma | Solución |
|---------|----------|
| Conecta como `@dev_glitch_user` | Rellena credenciales OAuth y `ALLOW_TWITTER_DEV=false` |
| `?twitter=failed` | Callback URL debe coincidir exactamente en portal X |
| `?twitter=invalid_state` | Usa `localhost` (no `127.0.0.1`), no incógnito |
| Quest "not verified" | Misma cuenta conectada, IDs correctos, token no expirado |
| `following lookup failed (402)` | **Free tier de X** — no permite consultar follows. La app usa verificación alternativa: click **OPEN X** → follow → espera 10s → **EXEC**. Opcional: `TWITTER_FOLLOW_HONOR_VERIFY=false` si tienes X API Basic ($200/mo) |
