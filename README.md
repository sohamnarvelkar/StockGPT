<div align="center">
  <img width="1200" height="475" alt="StockGPT Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  <h1>📈 StockGPT - AI Financial Intelligence Terminal</h1>

  <p>
    <strong>Institutional-grade market analysis, probabilistic price trajectory forecasting, and real-time equity intelligence powered by Gemini 2.5 Flash and Google Search Grounding.</strong>
  </p>

  <p>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini_2.5_Flash-Google_GenAI-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini 2.5 Flash" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Ready" /></a>
  </p>
</div>

---

## 🚀 Overview

**StockGPT** is an advanced quantitative and fundamental market analysis terminal. By combining the reasoning capabilities of **Google Gemini 2.5 Flash** with **real-time Google Search grounding**, StockGPT delivers deep-dive institutional equity reports, probabilistic valuation scenarios, technical indicator breakdowns, and macro context for global equities (NYSE, NASDAQ, NSE, BSE, FTSE, and crypto assets).

---

## ✨ Key Features

### 1. 🔍 Live Market Grounding & Data Verification
- **Real-Time Search Grounding:** Queries live market data, today's news headlines, earnings reports, and regulatory filings via Gemini's Google Search tool.
- **Global Exchange Coverage:** Automatically detects currency and exchange parameters for US, Indian, European, and global markets.

### 2. 🎯 Probabilistic Price Forecasting (1M, 6M, 12M)
- **Multi-Horizon Trajectories:** Generates Bull, Base, and Bear scenarios across 1-Month, 6-Month, and 12-Month timelines.
- **Probability Distributions:** Assigns confidence percentages and rationale to each target price range.

### 3. 🧠 Institutional Signal & Confidence Scoring
- **Actionable Recommendations:** Outputs algorithmic `BUY`, `HOLD`, or `SELL` signals with an integrated 0–100% confidence meter based on data convergence.
- **Executive Moat & Fundamentals:** Evaluates competitive advantages, revenue growth, net margins, cash flow health, P/E ratio, and ROE.

### 4. 📊 Interactive Visualizations & Charting
- **Trajectory Forecast Line Charts:** Visual timeline of projected price cones across scenario horizons.
- **Target Distribution Bars:** Compare Bull/Base/Bear valuations against current market price.
- **Optimized Portfolio Allocation:** Dynamic donut charts displaying ideal portfolio exposure.
- **Sentiment & Confidence Gauge:** Visual gauge indicating market sentiment and conviction.
- **Historical Simulation Table:** Interactive price, volume, and SMA (20/50 DMA) technical history.

### 5. 🌐 Global Macro & Sector Rotation
- Analyzes interest rates, central bank monetary policy, inflation trends, geopolitical risks, and sector rotations influencing asset prices.

### 6. ⚔️ Peer Comparison & Competitor Benchmarking
- Automated peer evaluation comparing valuation multiples (P/E, Market Cap, EPS Growth, Profit Margin, RSI) against direct competitors.

### 7. 🔔 Real-Time Price Alert Monitors
- Set browser notifications for price triggers (`ABOVE` / `BELOW` target prices) with integrated simulated live tick updates.

### 8. 📄 Institutional PDF Export & Local History
- **One-Click PDF Export:** Generate publication-ready financial reports using client-side `html2pdf.js`.
- **Saved Analyses:** Bookmark and store analysis reports locally in browser storage for instant recall.

### 9. 🔑 Flexible API Key Configuration
- Supports both **Cloud Deployment Environment Variables** (`VITE_GOOGLE_API_KEY`, `GEMINI_API_KEY`) and **In-Browser API Key Setup** via the UI modal with secure local storage persistence.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool & Bundler** | [Vite 6](https://vite.dev/) |
| **AI Engine & SDK** | [@google/genai](https://www.npmjs.com/package/@google/genai) (`gemini-2.5-flash`) |
| **Grounding & Tools** | Google Search Tool (via Gemini API) |
| **Data Visualization** | [Recharts 3](https://recharts.org/) |
| **Icons & UI Assets** | [Lucide React](https://lucide.dev/) |
| **Styling & Effects** | Tailwind CSS + Glassmorphism Design System |
| **Report Generation** | `html2pdf.js` |
| **Deployment Target** | [Vercel](https://vercel.com/) (with `vercel.json` SPA routing) |

---

## 📁 Project Structure

```
stockgpt/
├── components/                 # React UI Components
│   ├── auth/                   # Authentication & profile modals
│   │   └── AuthModal.tsx
│   ├── charts/                 # Recharts data visualizations
│   │   ├── FinancialProjections.tsx
│   │   ├── ForecastTrendChart.tsx
│   │   ├── HistoricalDataTable.tsx
│   │   ├── PortfolioPie.tsx
│   │   ├── ScenarioChart.tsx
│   │   └── SentimentGauge.tsx
│   ├── modals/                 # Dialogs & popups
│   │   ├── ApiKeyModal.tsx     # Client-side API key configuration
│   │   └── SetAlertModal.tsx   # Price alert creation modal
│   ├── subscription/           # Tier management modal
│   │   └── SubscriptionModal.tsx
│   ├── ui/                     # Badges & spinner components
│   │   ├── LoadingSpinner.tsx
│   │   └── SignalBadge.tsx
│   ├── AnalysisDeepDive.tsx    # Technical, macro, & news section
│   ├── AnalysisDisplay.tsx     # Main report container & tabs
│   ├── AnalysisOverview.tsx    # Executive summary & charts
│   └── ComparisonDisplay.tsx   # Head-to-head comparison view
├── context/                    # React Context State Providers
│   ├── AlertContext.tsx        # Price monitor state & notifications
│   └── AuthContext.tsx         # User identity & tier state
├── services/                   # Business & API logic
│   └── geminiService.ts        # Gemini 2.5 Flash SDK integration & parser
├── App.tsx                     # Main application layout
├── constants.ts                # App constants & state enums
├── index.html                  # HTML entrypoint
├── index.tsx                   # React root mount
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── types.ts                    # TypeScript data contracts & schemas
├── vercel.json                 # Vercel SPA routing rewrite config
└── vite.config.ts              # Vite bundler & environment define config
```

---

## 💻 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository
```bash
git clone https://github.com/sohamnarvelkar/StockGPT.git
cd StockGPT
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```
*(Note: You can also use `VITE_GOOGLE_API_KEY` or enter the key directly in the web UI).*

### 4. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
```
Preview the production build locally:
```bash
npm run preview
```

---

## 🌐 Deploying to Vercel

1. Push your repository to **GitHub** or **GitLab**.
2. Go to [Vercel](https://vercel.com/) and click **Add New** &rarr; **Project**.
3. Import the `StockGPT` repository.
4. Under **Settings > Environment Variables**, add:
   - **Key:** `VITE_GOOGLE_API_KEY` (or `GEMINI_API_KEY`)
   - **Value:** `your_gemini_api_key`
   - **Target:** Production, Preview, Development
5. Click **Deploy**.
6. The included [`vercel.json`](vercel.json) automatically ensures that single-page application (SPA) client-side routes and page refreshes work without `404 Not Found` errors.

---

## ⚙️ Environment Variables Reference

| Variable Name | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional* | Google Gemini API key (recommended) |
| `VITE_GOOGLE_API_KEY` | Optional* | Alternate Gemini API key name for Vite |
| `GEMINI_MODEL` | Optional | Model identifier (defaults to `gemini-2.5-flash`) |

*\*If no environment variable is set at build time, users can enter their API key directly inside the application using the **Key (🔑)** button in the navigation bar.*

---

## ⚖️ Disclaimer

*StockGPT is an AI-powered financial research and analytical tool built for informational and educational purposes only. It does not constitute financial, investment, legal, or tax advice. Market investments are subject to risk. Always conduct independent research and consult a certified financial advisor before making any investment decisions.*

---

<div align="center">
  <sub>Built with ❤️ using Gemini 2.5 Flash, React 19, and Vite.</sub>
</div>
