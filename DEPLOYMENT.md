# Free & Easy Deployment Guide for ClaimTrack GA

You can deploy ClaimTrack GA so others can use it as well for free, with zero server hosting costs.

---

## ⚡ Option 1: Netlify Drop (Easiest - 60 Seconds, No Code or Git Needed)

1. Open a terminal in `C:\Users\Public\Desktop\Work\JobLog` and build the application:
   ```bash
   npm run build
   ```
   This generates a complete, self-contained `dist` folder.
2. Open your web browser and go to:
   👉 **[https://app.netlify.com/drop](https://app.netlify.com/drop)**
3. Drag and drop the `dist` folder from File Explorer right onto the Netlify webpage.
4. Netlify will give you a public URL (e.g. `https://claimtrack-ga.netlify.app`) immediately!
5. Anyone can now visit that website from their computer or phone. Their data remains 100% private and stored locally on their own device.

---

## 🚀 Option 2: Vercel (Automatic Updates via GitHub)

1. Initialize a Git repository and commit the files:
   ```bash
   cd "C:\Users\Public\Desktop\Work\JobLog"
   git init
   git add .
   git commit -m "Initial commit of ClaimTrack GA"
   ```
2. Create a new repository on your [GitHub](https://github.com/new) account (e.g., `claimtrack-ga`).
3. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/claimtrack-ga.git
   git branch -M main
   git push -u origin main
   ```
4. Log into [vercel.com](https://vercel.com) (free account).
5. Click **"Add New"** > **"Project"** and select your `claimtrack-ga` repository.
6. Click **Deploy**. Vercel will automatically build and assign a free HTTPS domain. Every time you push changes to GitHub, it will re-deploy automatically!

---

## 🐙 Option 3: GitHub Pages (Free Static Hosting)

1. In `C:\Users\Public\Desktop\Work\JobLog\package.json`, install `gh-pages`:
   ```bash
   npm install -D gh-pages
   ```
2. Add the deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run:
   ```bash
   npm run build
   npm run deploy
   ```
4. In your GitHub repository settings, go to **Pages**, select branch `gh-pages`, and save. Your site is live at `https://YOUR_USERNAME.github.io/claimtrack-ga/`!

---

## 🔒 Privacy & Architecture Highlights for End Users

When others access your deployed link:
- **Zero Cloud Leak**: Every user's data remains in their own browser's `localStorage`.
- **Guest Mode Default**: Visitors do not need to register, create accounts, or provide email addresses.
- **Client-Side PBKDF2 + AES-256-GCM Vault**: Optional employer portal passwords (for Workday, Taleo, etc.) are encrypted on their browser before saving to disk.
- **Explicit Cross-Device Consent**: Syncing across devices requires explicit confirmation from the user.
- **GDOL Form Optimized**: Tailored for weekly Georgia Unemployment certification with 1-click field copying and printable 8.5x11" audit logs.
