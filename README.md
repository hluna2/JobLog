# ClaimTrack GA - Georgia Work Search & Job Application Tracker

A secure, privacy-first, and easy-to-use web application designed to track job applications, optimize weekly unemployment certifications for the **Georgia Department of Labor (GDOL / MyUI Claimant Portal)**, securely vault portal credentials, and generate audit-proof printable work search logs.

---

## 🌟 Key Features

### 1. 🏛️ Designed for Georgia Unemployment (GDOL / MyUI Portal)
- **Exact Field Matching**: Prominently features the exact fields required by the Georgia MyUI Claimant Portal:
  - Date Applied / Contact Date
  - Employer / Company Name
  - Website of Employer (with 1-click open and 1-click copy)
  - Employer Phone Number
  - Employer Physical Address & Location
  - Job Title Applied For
  - Where Found / Method of Contact (WorkSource GA, Employ Georgia, Indeed, LinkedIn, Career Fair, etc.)
  - Contact Person / Recruiter Name
  - Result of Contact & Weekly Notes
- **Weekly Certification Compliance**:
  - Automatically verifies whether you met Georgia's mandatory **3 work search contacts per benefit week**.
  - Weekly Confirmation Number Tracker: records your weekly MyUI submission confirmation numbers (`15862489`, etc.) for audit proof.
  - Appeals & Hearing tracker (Appeals Tribunal, Board of Review, hearing dates).
- **Part-Time Hours & Earnings Calculator**:
  - If you work part-time while filing (e.g. Publix at $17/hr, Chick-Fil-A at $16/hr), easily record weekly hours.
  - Automatically calculates gross weekly earnings to report on your weekly MyUI claim.

### 2. ⚡ Rapid-Transcribe Assistant (One-Click Field Copy)
- Because the Georgia MyUI portal often restricts or disables bulk copy-paste, the **Transcribe Assistant** displays each question in large, legible type with dedicated `[📋 Copy]` buttons for every single field.
- **Active Row Highlighting**: Clicking any application row highlights it with a clear focus ring and pins it into the Transcribe Assistant, so you never lose your place while filling out the state form.
- Use keyboard **Up/Down arrow keys** to quickly step through your applications.
- Includes a **"Mark as Reported to Portal"** toggle to check off items as you submit them.

### 3. 🎨 User-Friendly, Accessible Status Colors
- Statuses are formatted in soft, pleasant pastel tones that are neither too harsh nor too dark:
  - 🟢 **Offer Received**: Soft pleasant Emerald Green
  - 🟡 **Interview Requested / Scheduled**: Warm Honey Amber Yellow
  - 🔴 **Position Denied / Not Selected**: Muted Soft Rose Red
  - 🔵 **Applied / Under Review**: Gentle Slate Sky Blue
  - 🟣 **Saved / Follow-Up**: Neutral Lavender Slate

### 4. 🖨️ Printable Compact Work Search Audit Log
- Built-in **Print / PDF** generator formatted specifically for standard 8.5x11" paper.
- Compact, ink-friendly tabular layout containing all statutory Georgia Department of Labor verification fields.
- Official certification statement and Claimant Signature / Date block for random state audits, interviews, or appeals hearings.
- Clean `@media print` optimization: navbars, buttons, and backgrounds are hidden automatically.

### 5. 🔒 High Security & Local-First Zero-Knowledge Privacy
- **100% Private by Default**: All job records and notes live inside your browser (`localStorage`). No tracking, analytics, or third-party sharing occurs without your explicit consent.
- **Client-Side AES-256-GCM Encryption**:
  - For users who want to save employer portal usernames and passwords (e.g. Workday, Taleo, Greenhouse).
  - Uses the browser's native **Web Crypto API (SubtleCrypto)** with PBKDF2 (100,000 iterations of SHA-256).
  - Passwords are masked with `••••••••`, with reveal toggles and quick-copy.
  - Unlocked only in memory with your Master Passcode; never saved to disk in plaintext.
- **Guest Mode vs. Multi-Device Sync**:
  - **Guest Mode (Default)**: Use the app immediately without creating an account. Isolated to your device.
  - **Device Authorization Prompt**: Whenever sync or access from another device is initiated, an explicit confirmation appears:
    > *"Allow access to another device? [Device Name] — Yes, Authorize / No, Keep Local Only"*
  - Includes a Device Management panel and 1-click **"Revoke All Other Devices"** button.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Quick Start
```bash
# Navigate to project folder
cd "C:\Users\Public\Desktop\Work\JobLog"

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser to `http://localhost:5175` to start using the app.

---

## 🌐 Free 1-Click Deployment Options

You can deploy this app so anyone can use it, completely free:

### Option A: Vercel (Recommended)
1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset will auto-detect as **Vite**. Click **Deploy**!
5. Your live URL will be ready in under 30 seconds (e.g. `https://claimtrack-ga.vercel.app`).

### Option B: Netlify (Drag and Drop - No Git Required)
1. In this directory, run:
   ```bash
   npm run build
   ```
2. This creates a production-ready `dist` folder.
3. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
4. Drag and drop the `dist` folder directly onto the browser window.
5. Your app is immediately live on the web!

### Option C: GitHub Pages
1. Install `gh-pages`:
   ```bash
   npm install -D gh-pages
   ```
2. Add `"deploy": "gh-pages -d dist"` to `scripts` in `package.json`.
3. Run:
   ```bash
   npm run build && npm run deploy
   ```

---

## 📁 Pre-Loaded Real Data
The application comes pre-loaded with your entire historical log of **140+ applications**, **50+ weekly compliance logs**, **official MyUI confirmation numbers**, and **Publix / Chick-Fil-A hours & gross earnings records**.

You can also use the **Data** menu in the top bar to:
- Export to **CSV** (for Microsoft Excel or GDOL submission)
- Export full **JSON Backup**
- Restore / Import from any backup anytime
