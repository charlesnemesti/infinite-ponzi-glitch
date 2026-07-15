# Twitter / X en Vercel (producción)

## Environment Variables

En **Vercel → Project → Settings → Environment Variables**, añade:

| Variable | Valor | Entornos |
|----------|-------|----------|
| `NEXT_PUBLIC_APP_URL` | `https://www.infiniteponsiglitch.fun` | Production |
| `TWITTER_CALLBACK_URL` | *(opcional)* — se deriva de `NEXT_PUBLIC_APP_URL` | — |
| `TWITTER_CLIENT_ID` | (del portal X, app de @InfPonsiGlitch) | Production, Preview |
| `TWITTER_CLIENT_SECRET` | (del portal X) | Production, Preview |
| `TWITTER_OFFICIAL_USER_ID` | `2077399136232439808` (@InfPonsiGlitch) | Production |
| `TWITTER_LAUNCH_TWEET_ID` | ID del tweet pin de launch | Production |
| `ALLOW_TWITTER_DEV` | `false` | Production |
| `NEXT_PUBLIC_OFFICIAL_X_HANDLE` | `InfPonsiGlitch` | Production |

## Callback en developer.x.com

Inicia sesión en [developer.x.com](https://developer.x.com) con **@InfPonsiGlitch** y añade ambas URLs en **Callback URLs**:

```
http://localhost:3000/api/auth/twitter/callback
https://www.infiniteponsiglitch.fun/api/auth/twitter/callback
```

Deben coincidir **carácter por carácter** con `TWITTER_CALLBACK_URL` en cada entorno.

## Deploy

1. Guarda env vars en Vercel
2. **Deployments → Redeploy** (sin cache si cambiaste secrets)
3. Verifica: `https://www.infiniteponziglitch.fun/api/auth/twitter/status`
   - `ready: true`, `devFallback: false`
4. Prueba: MetaMask → CONNECT_X → autoriza → `linked=1` en URL

## Preview deployments

OAuth en `*.vercel.app` preview requiere registrar cada callback en X. Recomendado: probar OAuth solo en Production con el dominio principal.

## Vinculación wallet ↔ X

- El usuario conecta MetaMask → luego CONNECT_X
- La wallet se guarda en cookie `ipg_link_wallet` durante OAuth
- Al callback, el servidor crea/actualiza el usuario con wallet + twitter_id
- Un X account solo puede vincularse a **una** wallet (409 si conflicto)
