# Configuración de la API de X (Twitter)

Guía para conectar OAuth 2.0 real en Infinite Ponzi Glitch.

## 1. Portal de desarrollador (developer.x.com)

1. Entra en [https://developer.x.com](https://developer.x.com) con tu cuenta oficial.
2. Crea un **Project** → **App**.
3. Ve a **User authentication settings** → **Set up**.
4. Configura:
   - **App type:** Web App
   - **App permissions:** Read
   - **Callback URLs** (añade ambas si usas local + prod):
     ```
     http://localhost:3000/api/auth/twitter/callback
     https://TU-DOMINIO.com/api/auth/twitter/callback
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
TWITTER_OFFICIAL_USER_ID=1234567890
TWITTER_LAUNCH_TWEET_ID=9876543210
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

## 5. Probar flujo

1. `npm run dev` (reinicia tras cambiar `.env.local`)
2. Click **CONNECT_X** → debe ir a `twitter.com/i/oauth2/authorize`
3. Autoriza → vuelves con `?twitter=connected` y tu @username
4. Conecta MetaMask → sync automático
5. Sigue la cuenta oficial + retweetea el pin → **EXEC** en quests

## 6. Producción (Vercel)

Ver [VERCEL_TWITTER.md](./VERCEL_TWITTER.md).

## Errores comunes

| Síntoma | Solución |
|---------|----------|
| Conecta como `@dev_glitch_user` | Rellena credenciales OAuth y `ALLOW_TWITTER_DEV=false` |
| `?twitter=failed` | Callback URL debe coincidir exactamente en portal X |
| `?twitter=invalid_state` | Usa `localhost` (no `127.0.0.1`), no incógnito |
| Quest "not verified" | Misma cuenta conectada, IDs correctos, token no expirado |
