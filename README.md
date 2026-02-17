# ForgeStudios Logo Maker (Gemini)

A Vite + React website to generate and edit logos using Gemini image generation.

## Environment variables
The app reads your API key from:

- `VITE_GEMINI_API_KEY`

The key is used in the Gemini REST request URL:

- `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=<VITE_GEMINI_API_KEY>`

### Local
1. Install dependencies: `npm install`
2. Create `.env.local` from template:
   - `cp .env.example .env.local`
3. Set your key:
   - `VITE_GEMINI_API_KEY=your_key_here`
4. Run: `npm run dev`

### Vercel
You already set this correctly; keep this exact name:

- **Name**: `VITE_GEMINI_API_KEY`
- **Value**: your Gemini API key
- **Scope**: Production (and Preview/Development if needed)

Then redeploy.

### GitHub Actions (if you build/deploy from GitHub)
1. Add secret in repo settings: `VITE_GEMINI_API_KEY`
2. Map it in workflow:

```yaml
env:
  VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

## Tailwind CDN warning
If you see `cdn.tailwindcss.com should not be used in production`, remove the CDN script from `index.html`.

This repository no longer depends on Tailwind CDN and uses local CSS (`index.css`) instead.
