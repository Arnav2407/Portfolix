# 🌐 Portfolix — Advanced Quantitative Trading & Portfolio Platform

[![Platform](https://img.shields.io/badge/Platform-Portfolix-4F46E5?logo=prometheus&logoColor=white)](https://github.com/Arnav2407/Portfolix)
[![Python](https://img.shields.io/badge/Python-3.11%2B%20%7C%203.13-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TradingView](https://img.shields.io/badge/TradingView-Lightweight_Charts_v5-131722?logo=tradingview&logoColor=white)](https://tradingview.github.io/lightweight-charts/)
[![SciPy](https://img.shields.io/badge/SciPy-SLSQP_Optimization-8CAAE6?logo=scipy&logoColor=white)](https://scipy.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Portfolix** is a high-performance, full-stack quantitative trading, portfolio risk management, and algorithmic backtesting workstation. It features an ACID paper trading engine, Markowitz Modern Portfolio Theory (MPT) quadratic optimization, event-driven backtesting, quantitative ML price forecasting, technical indicator analytics, cross-asset correlation matrices, and automated alerts across 17 years (2009–2026) of historical equity market data.

📖 **Comprehensive Technical Documentation**:
- 📘 **[PROJECT.md](PROJECT.md)** — Master Project Specification & Technical Dossier (Math formulations, ER models, API catalog, algorithms).
- 🎨 **[DESIGN.md](DESIGN.md)** — Luminous Bright Glassmorphic Design System, ambient background palettes & typography tokens.
- 📐 **[docs/architecture.md](docs/architecture.md)** — System architecture & execution engine specifications.
- 📊 **[docs/data_profile.md](docs/data_profile.md)** — Historical data profile (83,979 daily bars across 20 NIFTY 50 blue chips).

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python 3.11+** or **3.13** with `uv` or `pip`
- **Node.js 18+** & `npm`
- *(Optional)* **Docker** & **Docker Compose**

### 2. Demo Credentials
The platform includes pre-seeded demo accounts with portfolios and transaction history:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Trader** | `trader@portfolix.com` | `trader123!` | Paper trading, portfolio optimization, backtesting, ML forecasting, custom alerts |
| **Admin** | `admin@portfolix.com` | `admin123!` | Full admin dashboard, user management, audit logs, system health |
| **Viewer** | `viewer@portfolix.com` | `viewer123!` | Read-only market exploration and indicator charts |

---

### 3. Local Development Setup

#### Backend Setup
```bash
# In workspace root:
# 1. Install dependencies
pip install -e .

# 2. Ingest historical stock data into normalized SQLite database (83,979 rows)
python scripts/ingest_csv.py

# 3. Start the FastAPI backend server
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend API will be live at:
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/api/v1/health](http://127.0.0.1:8000/api/v1/health)

#### Frontend Setup
```bash
# In frontend directory:
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend web application will be live at:
- **Web App**: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

### 4. Docker Deployment
Run the complete production stack (Nginx frontend + FastAPI backend) with a single command:
```bash
docker-compose up --build -d
```
Access the application at [http://localhost](http://localhost).

---

## 🏛️ System Architecture

```mermaid
graph LR
    subgraph UI ["Frontend (React 19 + TypeScript + Tailwind v4)"]
        A[TradingView Lightweight Charts v5]
        B[Markowitz Efficient Frontier Charts]
        C[Trading Terminal & Order Tickets]
        D[Backtest & ML Forecast Studio]
        E[Luminous Light Theme Switcher]
    end

    subgraph API ["FastAPI Backend (Python 3.13)"]
        F[JWT Auth & RBAC]
        G[ACID Paper Trading Engine]
        H[Portfolio & Risk Analytics]
        I[Markowitz Quadratic Optimizer]
        J[Event-Driven Backtester]
        K[ML Forecasting Engine]
    end

    subgraph Storage ["Storage Tier"]
        L[(SQLite / PostgreSQL Relational DB)]
        M[CSV Historical Dataset (83,979 bars)]
    end

    UI <-->|REST API + JWT| API
    API <-->|SQLAlchemy 2.0| Storage
```

---

## 🎯 Key Features & Quantitative Engines

### 1. Market Explorer & Professional Charting
- High-performance **TradingView Lightweight Charts v5** with multi-timeframe OHLCV candlesticks and volume histograms.
- Technical Indicator Overlays: SMA (20, 50, 200), EMA (12, 26), RSI (14), MACD (12, 26, 9), Bollinger Bands (20, 2), ATR (14), VWAP, and On-Balance Volume (OBV).
- **Cross-Asset Correlation Matrix**: Interactive heatmap calculating pairwise Pearson correlations across NSE bluechips.

### 2. ACID Paper Trading Engine
- **Row-Level Transaction Locking**: Guaranteed atomic cash deductions and holding allocations without race conditions.
- **Strict Decimal Precision**: Zero binary floating-point rounding errors (`Numeric(18,4)` and `decimal.Decimal`).
- **Realistic Execution Simulator**: Slippage modeling (default 5 bps) + brokerage commissions (0.03%).
- **Order Types**: `MARKET`, `LIMIT`, `STOP_LOSS`, `TAKE_PROFIT`.
- **Weighted Average Cost Basis**: Real-time Mark-to-Market (MTM) calculation and realized P&L accounting on exit.

### 3. Portfolio Risk Analytics & Markowitz MPT Optimization
- **Risk Ratios**: Annualized Sharpe Ratio, Sortino Ratio (downside deviation), Calmar Ratio, and Maximum Drawdown.
- **Tail Risk**: 95% Historical Value at Risk (VaR) and Conditional VaR (CVaR / Expected Shortfall).
- **Markowitz Quadratic Optimizer (SciPy SLSQP)**:
  - Generates the continuous **Efficient Frontier**.
  - Calculates the **Maximum Sharpe Ratio** portfolio.
  - Calculates the **Minimum Variance** portfolio.
  - Calculates **Risk Parity** (Equal Risk Contribution) allocations.
  - Auto-computes **target rebalancing orders** to migrate current holdings to optimal weights.

### 4. Event-Driven Strategy Backtester
- **Zero Lookahead Bias**: Bar-by-bar chronological execution simulating realistic historical fill dynamics.
- **Built-in Strategies**: Dual SMA Cross, RSI Mean Reversion, MACD Signal Cross, Momentum Breakout.
- **Multi-Parameter Optimization**: Grid search across parameter spaces.
- **Performance Tearsheet**: Equity curve, Drawdown series, monthly return matrix, trade logs, Profit Factor, and Win Rate.

### 5. Quantitative Machine Learning Forecasting
- **Models**: Gradient Boosted Decision Trees (`HistGradientBoostingRegressor`), Ridge Regression, ARIMA, Exponential Smoothing.
- **Feature Engineering**: Multi-lag return vectors ($t-1, \dots, t-21$), rolling volatility, RSI, MACD, Bollinger %B.
- **Rigorous Validation**: Time-series rolling forward walk validation with RMSE, MAE, MAPE, and Directional Accuracy.
- **Trading Signals**: Quantitative recommendation classification (`STRONG_BUY`, `BUY`, `HOLD`, `SELL`, `STRONG_SELL`) with confidence score.

### 6. Luminous Bright Design System & Visual Assets
- **Light Theme Switcher**: 3 matching ambient light color modes (Sky Blue, Mint Green, Violet Modern).
- **Translucent Glassmorphism**: Frosted cards (`backdrop-filter: blur(12px)`) with micro-dot grid textures.
- **Relatable 3D Visuals**:
  - `trading-hero.jpg`: 3D minimalist quantitative workstation
  - `trader-avatar.jpg`: 3D executive trader portrait
  - `ai-forecast.jpg`: Neural network forecasting visual
  - `audit-ledger.jpg`: Financial ledger & compliance blotter visual
  - `empty-state.jpg`: Discovery telescope visual
- **Custom Corporate Badges**: Handcrafted SVG color badges for all 20 NIFTY 50 blue-chip stocks.

---

## 🧪 Testing & Verification

### Running Automated End-to-End Verification
```bash
python scripts/verify_e2e.py
```
Verifies health, frontend HTTP response, authentication, market data, paper order execution, Markowitz optimization, backtesting, and ML forecasting.

### Running Backend Unit & Quantitative Tests
```bash
pytest -v tests/
```
All **17 unit and engine tests** pass covering auth, paper trading, risk math, optimization, backtesting, and ML.

---

## 📁 Repository Structure

```
Portfolix/
├── backend/
│   └── app/
│       ├── core/          # Configuration, security, database session
│       ├── models/        # SQLAlchemy 2.0 ORM models (alert, audit, backtest, market, order, portfolio, user)
│       ├── schemas/       # Pydantic v2 validation schemas
│       ├── services/      # Quantitative engines (trading, risk, optimizer, backtest, ML)
│       ├── routers/       # REST API endpoints (auth, market, orders, portfolios, backtest, etc.)
│       └── main.py        # FastAPI entrypoint
├── frontend/
│   ├── public/
│   │   └── images/        # Relatable 3D visual assets
│   ├── src/
│   │   ├── components/    # Reusable UI, Charts, Modals, Navbar, StockLogo
│   │   ├── context/       # Auth context & state
│   │   ├── pages/         # Dashboard, Explorer, Terminal, Portfolios, Studio, etc.
│   │   ├── services/      # Axios API client
│   │   ├── types/         # TypeScript interfaces
│   │   ├── App.tsx        # Router, ambient glow layers & theme state
│   │   ├── index.css      # Luminous bright tokens & micro-dot pattern
│   │   └── main.tsx       # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── data/
│   └── processed/
│       └── cleaned_stock_data.csv   # Historical NSE dataset (83,979 rows)
├── docs/
│   ├── data_profile.md    # Detailed data profiling & schema analysis
│   └── architecture.md    # System architecture & mathematical specifications
├── scripts/
│   ├── ingest_csv.py      # Idempotent database ETL pipeline
│   └── verify_e2e.py      # Automated E2E verification test suite
├── tests/                 # Pytest test suite
├── DESIGN.md              # Luminous bright design system specification
├── PROJECT.md             # Master project technical specification & dossier
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── Makefile
├── pyproject.toml
└── README.md
```

---

## ⚖️ Disclaimer
> **IMPORTANT**: Portfolix is developed strictly for educational, research, and simulation purposes. None of the algorithmic signals, forecasts, or simulated strategies constitute financial advice. Past performance is no guarantee of future returns.
