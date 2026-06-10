# SafeSG – Digital Shield

AI-powered scam detection and community protection for Singapore.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
Copy `.env.local.example` to `.env.local` and add your Anthropic API key:
```bash
cp .env.local.example .env.local
```
Then edit `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Get your key at https://console.anthropic.com

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Go to https://vercel.com and import the repo
3. Add `ANTHROPIC_API_KEY` as an environment variable in Vercel settings
4. Deploy — done!

## Features
- **Scam Scanner** — paste any message, SMS, email, or URL for instant AI analysis
- **Community Alerts** — trending scams reported by Singaporeans
- **Shield Circles** — alert trusted groups (family, friends, NS mates)
- **Profile** — badges and stats
