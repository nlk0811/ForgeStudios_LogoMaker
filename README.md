# ForgeStudios Logo Maker

Fast Gemini-powered logo generation + editing website built with Vite + React.

## What was fixed
- Removed Tailwind CDN usage from runtime HTML.
- Removed direct `/index.css` HTML link that caused 404 in some deploys.
- API key now comes from `import.meta.env.VITE_GEMINI_API_KEY` only.
- Gemini calls use direct REST fetch (curl-equivalent) from the frontend.

## Required environment variable
Set this in Vercel (and local `.env.local`):

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## How API key is mapped to Gemini request
The app sends:

```text
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=<VITE_GEMINI_API_KEY>
```

So your Vercel environment variable `VITE_GEMINI_API_KEY` is directly used as the `key=` query parameter in the Gemini request.

## Local development
1. `npm install`
2. `cp .env.example .env.local`
3. Put your Gemini key in `.env.local`
4. `npm run dev`

## Vercel setup
1. Vercel Project → **Settings** → **Environment Variables**
2. Add variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: your Gemini API key
   - Environment: Production (also Preview/Development if needed)
3. Redeploy.

### Important for stale errors
If you still see old console errors (`env is not defined`, Tailwind CDN warning), your deployment is likely using an older build. In Vercel, trigger a **new redeploy** (optionally with cache cleared) so the latest build is served.
