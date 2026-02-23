# Futurable Gemma — Estación de Generación

A React app that generates strategic micro-stories and visual assets using the Gemini API.

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your VITE_GEMINI_API_KEY
npm run dev
```

## Deploy to Netlify

### Option A — Netlify CLI (fastest)

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

### Option B — GitHub + Netlify UI

1. Push this folder to a GitHub repository
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Select your repo
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Go to **Site Settings → Environment Variables** and add:
   - Key: `VITE_GEMINI_API_KEY`
   - Value: your Gemini API key
6. Click **Deploy site**

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy and use in Netlify env vars

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Lucide React icons
- Google Gemini 2.5 Flash (text) + Imagen 3 (images)
