# Twitter / X en Vercel (producción)

## Environment Variables

En **Vercel → Project → Settings → Environment Variables**, añade:

| Variable | Valor ejemplo | Entornos |
|----------|---------------|----------|
| `NEXT_PUBLIC_APP_URL` | `https://infiniteponziglitch.xyz` | Production |
| `TWITTER_CALLBACK_URL` | `https://infiniteponziglitch.xyz/api/auth/twitter/callback` | Production |
| `TWITTER_CLIENT_ID` | (del portal X) | Production, Preview |
| `TWITTER_CLIENT_SECRET` | (del portal X) | Production, Preview |
| `TWITTER_OFFICIAL_USER_ID` | ID numérico | Production |
| `TWITTER_LAUNCH_TWEET_ID` | ID del tweet pin | Production |
| `ALLOW_TWITTER_DEV` | `false` | Production |

## Callback en developer.x.com

Añade la URL de producción en **Callback URLs**:

```
https://infiniteponziglitch.xyz/api/auth/twitter/callback
```

Debe coincidir **carácter por carácter** con `TWITTER_CALLBACK_URL`.

## Deploy

1. Guarda env vars
2. **Deployments → Redeploy** (sin cache si cambiaste secrets)
3. Verifica: `https://tudominio.com/api/auth/twitter/status`
4. Prueba CONNECT_X en el dominio real

## Preview deployments

Para previews de Vercel (`*.vercel.app`), añade también ese callback en X o usa solo Production para OAuth.

Opcional: callback dinámico por preview requiere registrar cada URL en X (no recomendado). Mejor probar OAuth solo en Production.
