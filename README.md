# JobLog - Job Application & Work Search Tracker

> **🌐 Live Web App:** **[https://job-log-ten.vercel.app/](https://job-log-ten.vercel.app/)**  
> Access directly from any browser on phone, tablet, or desktop. 100% private, zero-cloud storage, and zero account creation required.

[![Deploy with Vercel](https://vercel.com/button)](https://job-log-ten.vercel.app/)

---

## 🌟 Key Features

### 1. 🏛️ Georgia (GDOL / MyUI Portal) & Multi-State Compliance
- **Exact Question-Sequence Matching**: Displays fields in the exact question sequence of state unemployment portals (e.g. Georgia MyUI Claimant Portal):
  - Date Applied / Contact Date (with dynamic accurate days-ago calculation)
  - Employer / Company Name
  - Website of Employer (with 1-click open and 1-click copy)
  - Employer Phone Number
  - Employer Physical Address & Location
  - Job Title Applied For
  - Where Found / Method of Contact (WorkSource GA, Employ Georgia, Indeed, LinkedIn, Recruiter Contact, etc.)
  - Contact Person / Recruiter Name
  - Result of Contact & Weekly Notes
- **Weekly Certification Compliance**:
  - Verifies whether you met your mandatory work search contacts per benefit week (e.g. Georgia's minimum 3).
  - Dedicated **Weekly Submission Confirmation Numbers** table to store confirmation numbers for audit proof.
  - Dedicated **Appeals, Hearings & Tribunal Records** table for tracking hearing dates, tribunal bodies, and appeal confirmation numbers.

### 2. ⚡ Rapid-Transcribe Assistant (One-Click Field Copy)
- Because state portals often restrict or disable autofill/bulk copy-paste, the **Transcribe Assistant** displays each question with dedicated `[📋 Copy]` buttons for every single field.
- **Active Row Highlighting**: Step through applications with your keyboard **Up/Down arrow keys** or the on-screen navigation buttons.
- **"Mark as Reported to Portal"** toggle to check off applications as you submit them.

### 3. 📋 Adaptive Internal Scrolling & Standardized Sources
- **No Whole-Page Scrolling**: Applications table defaults to displaying the **10 most recent** submissions inside an adaptive internal scrolling container with pinned sticky headers.
- **Expand / Collapse**: One-click toggle between "Show Latest 10 Only" and "Expand to Show All".
- **Standardized Source Channels**: Filters and sorts applications by clean general sources (Indeed, LinkedIn, WorkSource GA, Company Website, Recruiter Contact, ZipRecruiter, Handshake / College) rather than cluttered individual company portals.

### 4. 💼 Part-Time Hours & Earnings Calculator
- **Excel Formula Support**: Directly evaluate expressions in hours fields (e.g. `=22.8-7.5+8.35`).
- **Precision Rounding**:
  - Hours rounded strictly to **3 decimal places** (`0.000h`).
  - Gross earnings rounded strictly to **2 decimal places** (`$0.00`).
- **Dynamic Job Entries & Inactivation**:
  - Add or remove employer rows on the fly for any week.
  - Inactivate past employers when changing jobs while preserving all historical hours and wage records.

### 5. 🎨 Accessible Status Indicators
- Includes distinct pastel badges:
  - 🟢 **Offer Received**: Emerald Green
  - 🟡 **Interview Requested / Scheduled**: Warm Amber
  - 🟣 **Application Viewed by Employer**: Purple
  - 🔴 **Position Denied / Not Selected**: Soft Rose
  - 🔵 **Applied / Under Review**: Sky Blue
  - ⚪ **Saved / Follow-Up**: Slate Gray

### 6. 🖨️ Printable Compact Work Search Audit Log
- Built-in **Print / PDF** generator formatted specifically for standard 8.5x11" paper.
- Compact, ink-friendly tabular layout containing verification fields, clean pagination, and an official Claimant Certification Statement & Signature block for state audit reviews.

### 7. 🔒 High Security & Local-First Zero-Knowledge Privacy
- **100% Private by Default**: All job records, notes, and earnings remain in your browser's local storage (`localStorage`). No tracking, analytics, or third-party cloud database.
- **Client-Side AES-256-GCM Encryption**: Securely store login credentials for employer portals (Workday, Taleo, Greenhouse) using native browser Web Crypto API (SubtleCrypto with PBKDF2 100,000 iterations). Plaintext passwords never leave memory.
- **Data Export & Backup**: 1-click export to CSV (for Excel) or encrypted JSON backup to restore on any device.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Quick Start
```bash
# Clone the repository
git clone https://github.com/hluna2/JobLog.git
cd JobLog

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser to `http://localhost:5173` (or the port indicated in your terminal) to start using the app.

---

## 🌐 Live Deployment & Hosting

### Hosted on Vercel
The production web application is live at:  
👉 **[https://job-log-ten.vercel.app/](https://job-log-ten.vercel.app/)**

### Continuous Delivery (CI/CD)
- **Automatic Builds**: Every update pushed to the `main` branch of this repository automatically builds and redeploys to production with zero downtime.
- **Client-Side Privacy**: Because JobLog is engineered 100% client-side with native browser `localStorage`, no personal application data, earnings records, or credentials are ever sent to or stored on Vercel's servers.

### Deploy Your Own Instance (1-Click)
1. Fork or clone this repository to your GitHub account.
2. Sign in to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `JobLog` repository.
4. Framework Preset will auto-detect as **Vite**. Click **Deploy**!
5. Your live URL will be ready in under 45 seconds with automatic SSL and zero server maintenance.

---

## 📁 Privacy & Data Isolation
The public repository contains zero personal data by default, so any visitor or user who deploys the app gets their own clean, empty workspace with 0 records. All application data, earnings records, and portal credentials remain 100% private in local browser storage on each individual user's device.

You can use the **Data** menu in the top bar to:
- Export to **CSV** (for Microsoft Excel or state unemployment submission)
- Export full **JSON Backup**
- Restore / Import from any backup JSON anytime
