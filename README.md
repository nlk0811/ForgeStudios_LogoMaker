# ForgeStudios Logo Maker (Gemini)

# ForgeStudios Logo Maker

## Why you see `cdn.tailwindcss.com should not be used in production`
That warning appears because Tailwind's CDN script is meant for quick prototypes, not production apps.

For production, use one of these:
- **Tailwind CLI** build step
- **PostCSS plugin** in your Vite build

> This repository currently uses utility classes heavily, so proper Tailwind build integration is required before deploying if the CDN script is still present.

## Environment variables
This app expects the Gemini API key in a Vite-exposed variable:

- `VITE_GEMINI_API_KEY`

Use `.env.example` as the template and create your own local `.env.local`.

### Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Put your key in `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_real_key_here
   ```
4. Start dev server:
   ```bash
   npm run dev
   ```

## GitHub Actions secrets (.env in GitHub)
If you deploy/build from GitHub Actions, add secrets in:

- **Repository → Settings → Secrets and variables → Actions → New repository secret**

Add:
- `VITE_GEMINI_API_KEY`

Then expose it in your workflow step:

```yaml
env:
  VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}
```

## Vercel environment variables
In Vercel:

1. Open your project.
2. Go to **Settings → Environment Variables**.
3. Add:
   - **Name:** `VITE_GEMINI_API_KEY`
   - **Value:** your Gemini API key
   - **Environments:** Production (and Preview/Development if needed)
4. Redeploy the project.

Because this is a Vite frontend variable, it is bundled client-side. Do **not** put highly sensitive server-only credentials in `VITE_*` variables.
