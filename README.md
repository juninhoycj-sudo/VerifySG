# VerifySG – Digital Shield 🛡️

AI-powered scam detection and community protection for Singapore.

---

## Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above)
- A Gemini API key — get one free at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Step 1 — Clone or download the repo
If you have git:
```bash
git clone https://github.com/juninhoycj-sudo/VerifySG.git
cd VerifySG
```
Or just unzip the downloaded folder and open it in VS Code.

### Step 2 — Install dependencies
Open a terminal in the project folder and run:
```bash
npm install
```

### Step 3 — Add your API key
Create a file called `.env.local` in the root of the project (same level as `package.json`) and add:
```
GEMINI_API_KEY=your_key_here
```
Replace `your_key_here` with your actual Gemini API key.

### Step 4 — Start the app
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Stopping the app
Press `Ctrl + C` in the terminal.

### Every time you come back
Just `cd` into the project folder and run `npm run dev` again — that's it.

---

## Deploying to Vercel (Live URL)

Vercel gives you a free public URL so anyone can use the app without running it locally.

### Step 1 — Push your code to GitHub
Make sure your latest code is pushed:
```bash
git add .
git commit -m "ready to deploy"
git push
```

### Step 2 — Import to Vercel
1. Go to [https://vercel.com](https://vercel.com) and sign in (use your GitHub account)
2. Click **"Add New Project"**
3. Find and import your `VerifySG` GitHub repo
4. Leave all settings as default

### Step 3 — Add your API key
Before clicking Deploy, scroll down to **Environment Variables** and add:
- **Name:** `GEMINI_API_KEY`
- **Value:** your Gemini API key

### Step 4 — Deploy
Click **Deploy**. Vercel will build and host the app. In about 1–2 minutes you'll get a live URL like:
```
https://verify-sg.vercel.app/
```

### Updating the live site
Every time you push to GitHub, Vercel automatically redeploys.

---

## Features
- **Scam Scanner** — paste any message, SMS, email, or URL for instant AI analysis
- **Community Alerts** — trending scams reported by Singaporeans, with verify/debunk voting
- **Shield Circles** — alert trusted groups (family, friends, NS mates) and manage members
- **Warning Cards** — share formatted scam alerts directly to WhatsApp, Telegram, and more
- **Onboarding** — personalised profile stored locally
- **Profile** — badges, stats, and scan history

---

## Tech Stack
- [Next.js](https://nextjs.org/) — React framework
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Google Gemini API](https://aistudio.google.com/) — AI scam analysis
- localStorage — all user data stored locally, no backend database needed