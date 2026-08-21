# StreamBox

A premium dark-themed streaming frontend built with React + Vite + Tailwind CSS.

## Local Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env`:
```
VITE_API_BASE_URL=https://web-production-61c05b.up.railway.app
```

## Production Build

```bash
npm run build
# dist/ folder is ready to deploy
```

## Netlify Deployment

1. Push this repo to GitHub
2. Connect to Netlify → New site from Git
3. **Build command:** `npm run build`
4. **Publish directory:** `dist`
5. Go to **Site configuration → Environment variables** and add:
   - `VITE_API_BASE_URL` = `https://web-production-61c05b.up.railway.app`

> **CORS:** If you see CORS errors in production, enable CORS on your Railway backend for your Netlify domain.

## API Endpoints Used

| Path | Purpose |
|------|---------|
| `/home` | Homepage sections |
| `/search?q=query` | Search |
| `/detail/:slug` | Title details, cast, seasons |
| `/api/stream/:id?detail_path=` | Stream URL |
| `/api/stream/:id/captions?detail_path=` | Subtitles |
