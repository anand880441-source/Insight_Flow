# 🌊 InsightFlow - AI-Powered Customer Feedback Intelligence Platform

[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20Intelligence-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**InsightFlow** is an enterprise-grade customer feedback intelligence system that ingests raw, unstructured customer reviews and survey responses across omnichannel touchpoints, performs automated sentiment scoring and issue clustering using Google Gemini AI, and transforms high-volume feedback into prioritized, executive-ready product roadmaps and analytics.

---

## 🚀 Key Highlights

- **Omnichannel Feedback Ingestion**: Upload bulk CSV feedback datasets or ingest real-time customer submissions with automatic field parsing and validation.
- **Adaptive Gemini AI Intelligence**:
  - High-throughput batch sentiment analysis (-5 to +5 scoring) and automatic topic tagging.
  - Semantic issue clustering that groups disparate complaints into coherent problem themes with severity ratings (1–5).
  - Prescriptive, actionable recommendations on what product or support actions to take next.
  - Zero-downtime rule-based fallback analyzer ensuring uninterrupted operations even during AI rate limits or missing credentials.
- **Executive Visualizations & Dashboards**:
  - Net Sentiment gauge & sentiment distribution breakdown (Recharts).
  - Issue volume, category breakdown, complaints timeline, and temporal sentiment trends.
  - Filterable by date ranges, touchpoint channels, sentiment, severity, and full-text keyword queries.
- **Export & Reporting Engine**:
  - Direct export of executive intelligence summaries to styled PDF (`jspdf`, `jspdf-autotable`).
  - Structured raw and enriched data export to CSV (`papaparse`).
- **Resilient Full-Stack Architecture**: Modular Monorepo structure with automated setup scripts and clean separation of concerns.

---

## 🛠️ Architecture & Tech Stack

```
insightflow/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI widgets, filters, drawers & KPI cards
│   │   │   └── charts/         # Interactive Recharts visualizations
│   │   ├── context/            # Global Filter & Toast notification state
│   │   ├── hooks/              # Custom analytics query hooks
│   │   ├── pages/              # Dashboard, Feedback, Issues, and Reports views
│   │   ├── services/           # Axios REST API client
│   │   └── utils/              # PDF & CSV report export engines
│   └── tailwind.config.js      # Custom theme, typography & palette
│
├── server/                     # Backend API (Express + MongoDB + Gemini)
│   ├── src/
│   │   ├── config/             # MongoDB connection with retry logic
│   │   ├── controllers/        # Feedback, AI, Analytics, and Reports controllers
│   │   ├── middleware/         # Central error handling, multer file upload, CORS
│   │   ├── models/             # Mongoose schemas (Feedback, Issue, Report)
│   │   ├── routes/             # REST routing declarations
│   │   ├── services/           # AI orchestrator (Gemini) & CSV stream parser
│   │   └── utils/              # Database seeder & temporal date spreading tools
│   └── data/                   # Initial sample datasets for instant demonstration
│
└── package.json                # Monorepo orchestration scripts
```

### Technology Matrix

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Lucide / Heroicons, Axios |
| **Backend** | Node.js, Express 4, Mongoose 8, Multer, Morgan, CORS |
| **AI / ML** | Google Gemini (`@google/generative-ai`), rule-based NLP fallback |
| **Data & Storage** | MongoDB Atlas, CSV Streaming Ingestion (`csv-parser`) |
| **Export Engines**| jsPDF, jsPDF-AutoTable, PapaParse |

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI
- **Google Gemini API Key**: Free API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/anand880441-source/Insight_Flow.git
cd Insight_Flow
```

### 3. Install Dependencies
Install all root, client, and server dependencies with a single command:
```bash
npm run install:all
```

### 4. Configure Environment Variables
Create a `.env` file in the `server` directory using the provided template:
```bash
cp server/.env.example server/.env
```

Update `server/.env` with your credentials:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/insightflow
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
AI_BATCH_SIZE=25
AI_MODEL=gemini-2.5-flash
CORS_ORIGIN=http://localhost:5173
```

### 5. Seed Demo Data (Optional but Recommended)
Populate your database with rich real-world sample feedback and spread timestamps for realistic trend visualization:
```bash
# Seed initial customer feedback dataset
npm run seed

# Spread timestamps across recent weeks for trend analytics
npm run spread-dates
```

### 6. Run Development Servers
Start both backend and frontend servers in separate terminal tabs:

**Terminal 1 (Backend API):**
```bash
npm run dev:server
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev:client
# Running on http://localhost:5173
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check and server status |
| `GET` | `/api/feedback` | Paginated feedback with filtering (sentiment, channel, search) |
| `POST` | `/api/feedback` | Ingest single customer feedback entry |
| `POST` | `/api/feedback/upload` | Multipart CSV bulk upload and streaming ingestion |
| `POST` | `/api/ai/analyze-batch` | Trigger Gemini batch sentiment and topic analysis |
| `POST` | `/api/ai/cluster` | Run AI semantic clustering to detect top issues |
| `POST` | `/api/ai/recommend` | Generate prescriptive AI recommendation for an issue |
| `GET` | `/api/analytics/summary` | Global KPIs (Net sentiment score, volume, distribution) |
| `GET` | `/api/analytics/trends` | Time-series sentiment and volume trends |
| `GET` | `/api/analytics/categories`| Categorical breakdown and complaint hot-spots |
| `GET` | `/api/reports` | Retrieve generated executive intelligence reports |
| `POST` | `/api/reports/generate`| Generate snapshot executive report |

---

## 📊 Core Features Walkthrough

### 1. Executive Intelligence Dashboard
- High-level KPI cards displaying Total Feedback Count, Average Sentiment Score, Net Sentiment Index, and Critical Issues Count.
- Dynamic charts including Sentiment Distribution (Pie Chart), Complaints by Category (Bar Chart), and Feedback Volume Trend (Line Chart).

### 2. Feedback Explorer
- Deep-dive into raw feedback items with real-time text search, sentiment pills, and channel tags.
- Detailed drawer view for inspectable metadata, customer identification, and granular AI tags.

### 3. Issues & Root-Cause Tracker
- Automated grouping of negative feedback into prioritized issue clusters.
- Severity levels (1–5) and frequency tracking to help engineering and product teams resolve high-impact friction points first.
- Contextual AI recommendations offering immediate action items.

### 4. Reporting & Multi-Format Exporter
- Executive summary generation with key takeaways, sentiment shifts, and top recurring complaints.
- One-click export to printable PDF and downloadable CSV for cross-team sharing.

---

## 🚀 Production Deployment Guide

InsightFlow is pre-configured for seamless cloud deployment: **Server on Render** and **Client on Vercel**.

### Step 1: Deploy Backend to Render

#### Option A: Automatic via Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** > **Blueprint**.
2. Connect your GitHub repository: `https://github.com/anand880441-source/Insight_Flow`.
3. Render will automatically detect the included [`render.yaml`](render.yaml).
4. Provide your secret environment variables when prompted:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
5. Click **Apply**. Render will build and deploy the API.
6. Copy your public service URL (e.g., `https://insightflow-api.onrender.com`).

#### Option B: Manual Web Service
- **Environment**: `Node`
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/api/health`
- **Environment Variables**:
  ```env
  NODE_ENV=production
  PORT=10000
  CORS_ORIGIN=*
  AI_MODEL=gemini-2.5-flash
  AI_BATCH_SIZE=25
  MONGO_URI=your_mongodb_connection_string
  GEMINI_API_KEY=your_gemini_api_key
  ```

---

### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New...** > **Project**.
2. Import the GitHub repository: `https://github.com/anand880441-source/Insight_Flow`.
3. In **Project Configuration**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Select `client` (or leave default root, both are pre-configured).
4. In **Environment Variables**, add:
   ```env
   VITE_API_URL=https://<your-render-backend-url>.onrender.com
   ```
   *(Replace with the actual URL from Step 1)*
5. Click **Deploy**. Vercel will build and serve the client with full SPA routing support.
6. *(Optional)* In your Render backend settings, update `CORS_ORIGIN` to your new Vercel domain (e.g., `https://insightflow.vercel.app`) for tighter security.

---

## 🛡️ Security & Resiliency

- **Graceful Degradation**: If Google Gemini API quota is reached or network connectivity drops, the system seamlessly transitions to an internal rule-based NLP engine without user-facing errors.
- **Environment Isolation**: Sensitive credentials (`GEMINI_API_KEY`, `MONGO_URI`) are strictly loaded via server-side environment variables and excluded from version control via `.gitignore`.
- **CORS & Request Limiting**: Configurable CORS origin policies and request body bounds.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
