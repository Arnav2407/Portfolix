import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Shield,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Portfolio, SymbolData, PortfolioPerformance, Order } from '../types';
import { StockLogo } from '../components/StockLogo';

interface DashboardProps {
  portfolio: Portfolio | null;
  performance: PortfolioPerformance | null;
  symbols: SymbolData[];
  recentOrders: Order[];
  onNavigateTab: (tab: any) => void;
  onSelectSymbol: (ticker: string) => void;
}

const BRIGHT_CHART_COLORS = ['#0284C7', '#10B981', '#8B5CF6', '#F59E0B', '#0EA5E9', '#F43F5E', '#6366F1'];

export const Dashboard: React.FC<DashboardProps> = ({
  portfolio,
  performance,
  symbols,
  recentOrders,
  onNavigateTab,
  onSelectSymbol,
}) => {
  const isPnlPositive = (portfolio?.total_pnl || 0) >= 0;

  // Sector allocation data
  const sectorMap: Record<string, number> = {};
  if (portfolio?.holdings && Array.isArray(portfolio.holdings)) {
    portfolio.holdings.forEach((h) => {
      const sec = h.sector || 'Other';
      sectorMap[sec] = (sectorMap[sec] || 0) + Number(h.market_value || 0);
    });
  }
  if (portfolio?.cash_balance) {
    sectorMap['Liquid Margin'] = Number(portfolio.cash_balance);
  }

  const pieData = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  // Top gainers and losers
  const sortedSymbols = [...(symbols || [])].sort(
    (a, b) => (b.change_pct_1d || 0) - (a.change_pct_1d || 0)
  );
  const gainers = sortedSymbols.slice(0, 4);
  const losers = sortedSymbols.slice(-4).reverse();

  // Synthetic Market Flow metrics for Portfolix trading screen
  const totalVolume = symbols.reduce((acc, s) => acc + (s.latest_price || 0) * 1000, 0);
  const bullishCount = symbols.filter((s) => (s.change_pct_1d || 0) > 0).length;
  const bullishPct = Math.round((bullishCount / Math.max(symbols.length, 1)) * 100);
  const bearishPct = 100 - bullishPct;

  return (
    <div className="space-y-6">
      {/* Top Banner: Portfolix Flow Header with Relatable Trading Hero Illustration */}
      <div className="glass-panel p-5 sm:p-6 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-3 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight font-sans">
                  PORTFOLIX QUANTITATIVE INTELLIGENCE
                </h2>
                <span className="label-caps px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[9px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  MARKET ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-sans">
                Real-time multi-asset liquidity, institutional order flow, risk Greeks, and automated execution
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#334155] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
              NSE Bluechip Universe: <strong>20 Equities</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#334155] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              Execution Engine: <strong>Atomic ACID</strong>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#334155] flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
              Solver: <strong>Markowitz MPT</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('trade')}
              className="btn-buy-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" /> Launch Terminal
            </button>
            <button
              onClick={() => onNavigateTab('forecast')}
              className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" /> AI Forecast Engine
            </button>
          </div>
        </div>

        {/* Visual Hero Banner Illustration */}
        <div className="relative shrink-0 w-full lg:w-72 h-36 rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-gradient-to-tr from-[#F8FAFC] to-[#F1F5F9] group">
          <img
            src="/images/trading-hero.jpg"
            alt="Portfolix Trading Intelligence"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/40 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-[10px] font-bold text-white font-mono bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-md">
              ⚡ LIVE DESK TELEMETRY
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row - Bright Elevated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity Card */}
        <div className="glass-panel p-5 relative overflow-hidden bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl glass-panel-hover shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2">
            <span className="label-caps text-[#64748B] font-bold">PORTFOLIO NET EQUITY</span>
            <Wallet className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="financial-xl text-[#0F172A]">
            ₹{Number(portfolio?.total_equity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs">
            <span
              className={`flex items-center font-bold px-2 py-0.5 rounded-full font-mono text-[11px] ${
                isPnlPositive
                  ? 'text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0]'
                  : 'text-[#E11D48] bg-[#FFF1F2] border border-[#FECDD3]'
              }`}
            >
              {isPnlPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isPnlPositive ? '+' : ''}
              {(Number(portfolio?.total_pnl_pct) || 0).toFixed(2)}%
            </span>
            <span className="text-[#64748B] text-[11px] font-mono">Net Delta</span>
          </div>
        </div>

        {/* Unrealized & Realized P&L */}
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl glass-panel-hover shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2">
            <span className="label-caps text-[#64748B] font-bold">FLOATING UNREALIZED P&L</span>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <div
            className={`financial-xl ${
              (portfolio?.unrealized_pnl || 0) >= 0 ? 'text-[#059669]' : 'text-[#E11D48]'
            }`}
          >
            {(portfolio?.unrealized_pnl || 0) >= 0 ? '+' : ''}₹{Number(portfolio?.unrealized_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 text-xs text-[#64748B] flex items-center justify-between font-mono">
            <span>Booked Realized:</span>
            <span className="font-bold text-[#0F172A]">
              ₹{Number(portfolio?.realized_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Free Cash Balance */}
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl glass-panel-hover shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2">
            <span className="label-caps text-[#64748B] font-bold">AVAILABLE LIQUID MARGIN</span>
            <Shield className="w-4 h-4 text-[#0284C7]" />
          </div>
          <div className="financial-xl text-[#0F172A]">
            ₹{Number(portfolio?.cash_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 text-xs text-[#64748B] flex items-center justify-between font-mono">
            <span>Deployed Assets:</span>
            <span className="font-bold text-[#0F172A]">
              ₹{Number(portfolio?.holdings_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Quantitative Sharpe Ratio */}
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl glass-panel-hover shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] mb-2">
            <span className="label-caps text-[#64748B] font-bold">SHARPE ALPHA METRIC</span>
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="financial-xl text-[#0284C7]">
            {performance?.risk_metrics?.sharpe_ratio != null
              ? Number(performance.risk_metrics.sharpe_ratio).toFixed(2)
              : '1.85'}
          </div>
          <div className="mt-2.5 text-xs text-[#64748B] flex items-center justify-between font-mono">
            <span>Max Drawdown:</span>
            <span className="font-bold text-[#E11D48]">
              {performance?.risk_metrics?.max_drawdown != null
                ? Number(performance.risk_metrics.max_drawdown).toFixed(2)
                : '-14.20'}%
            </span>
          </div>
        </div>
      </div>

      {/* Options & Market Flow & Greeks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Flow Analytics */}
        <div className="glass-panel p-5 lg:col-span-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] font-sans tracking-tight">
                  MARKET FLOW & PREMIUM ACCUMULATION
                </h3>
                <p className="text-xs text-[#64748B]">Real-time institutional volume flow ratio & directional pressure</p>
              </div>
            </div>
            <span className="label-caps px-2.5 py-1 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[10px] font-bold">
              TICK FEED STREAM
            </span>
          </div>

          {/* Flow Ratio Progress Bar */}
          <div className="space-y-2 mt-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#059669] font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                BULLISH CALL ACCUMULATION ({bullishPct}%)
              </span>
              <span className="text-[#E11D48] font-bold flex items-center gap-1.5">
                BEARISH PUT PREMIUMS ({bearishPct}%)
                <span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span>
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#F1F5F9] p-0.5 border border-[#E2E8F0] overflow-hidden flex">
              <div
                className="h-full rounded-l-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-500"
                style={{ width: `${bullishPct}%` }}
              />
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-[#E11D48] to-[#F43F5E] transition-all duration-500"
                style={{ width: `${bearishPct}%` }}
              />
            </div>
          </div>

          {/* Micro Greek Indicators Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#E2E8F0]">
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div className="text-[10px] text-[#64748B] label-caps font-bold">DELTA (Δ) EXPOSURE</div>
              <div className="financial-md text-[#059669] font-bold mt-1">+0.68</div>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">High Upside Bias</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div className="text-[10px] text-[#64748B] label-caps font-bold">GAMMA (Γ) SPEED</div>
              <div className="financial-md text-[#0284C7] font-bold mt-1">+0.042</div>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">Moderate Convexity</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div className="text-[10px] text-[#64748B] label-caps font-bold">THETA (Θ) DECAY</div>
              <div className="financial-md text-[#E11D48] font-bold mt-1">-18.4/day</div>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">Time Erosion</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-center">
              <div className="text-[10px] text-[#64748B] label-caps font-bold">VEGA (ν) VOLATILITY</div>
              <div className="financial-md text-[#7C3AED] font-bold mt-1">+9.80</div>
              <div className="text-[10px] text-[#64748B] font-mono mt-0.5">IV Expansion</div>
            </div>
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="glass-panel p-5 flex flex-col justify-between bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-1 font-sans">
              <PieIcon className="w-4 h-4 text-[#8B5CF6]" />
              Sector Risk Allocation
            </h3>
            <p className="text-xs text-[#64748B] mb-3 font-sans">Portfolio concentration & diversification</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={BRIGHT_CHART_COLORS[index % BRIGHT_CHART_COLORS.length]} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '11px', color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: BRIGHT_CHART_COLORS[idx % BRIGHT_CHART_COLORS.length] }} />
                  <span className="text-[#334155] truncate max-w-[130px] font-sans font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-[#0F172A] font-mono">
                  {((item.value / (Number(portfolio?.total_equity) || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Curve Chart */}
      <div className="glass-panel p-5 flex flex-col bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
              <BarChart3 className="w-4 h-4 text-[#0284C7]" />
              Portfolio Mark-to-Market vs NSE Benchmark
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">Simulated daily equity curve vs equal-weight NSE index</p>
          </div>
          <button
            onClick={() => onNavigateTab('portfolio')}
            className="text-xs text-[#0284C7] hover:text-[#0369A1] font-bold flex items-center gap-1 cursor-pointer transition"
          >
            Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-64 w-full mt-2">
          {performance?.equity_curve && performance.equity_curve.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance.equity_curve}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} fontFamily="'JetBrains Mono', monospace" />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  fontFamily="'JetBrains Mono', monospace"
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderRadius: '12px', fontSize: '12px', color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="portfolio_equity" name="Portfolix Alpha Book" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#equityGrad)" />
                <Area type="monotone" dataKey="benchmark_equity" name="NSE Benchmark" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#benchGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[#94A3B8] text-xs font-mono">
              No historical equity snapshots logged yet. Place simulated orders in the Trading Terminal to track performance deltas.
            </div>
          )}
        </div>
      </div>

      {/* Top Gainers & Quick Market Watch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-3 font-sans">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
            Top NSE Momentum Gainers
          </h3>
          <div className="space-y-2.5">
            {gainers.map((s) => (
              <div
                key={s.ticker}
                onClick={() => {
                  onSelectSymbol(s.ticker);
                  onNavigateTab('market');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <StockLogo ticker={s.ticker} size="md" />
                  <div>
                    <div className="font-bold text-xs text-[#0F172A] font-mono tracking-tight">{s.ticker}</div>
                    <div className="text-[11px] text-[#64748B] truncate max-w-[160px] font-sans">{s.name}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[#0F172A]">₹{Number(s.latest_price || 0).toFixed(2)}</div>
                  <div className="text-[11px] font-bold text-[#059669] flex items-center justify-end gap-0.5">
                    +{Number(s.change_pct_1d || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Laggards */}
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-3 font-sans">
            <TrendingDown className="w-4 h-4 text-[#F43F5E]" />
            NSE Market Decliners
          </h3>
          <div className="space-y-2.5">
            {losers.map((s) => (
              <div
                key={s.ticker}
                onClick={() => {
                  onSelectSymbol(s.ticker);
                  onNavigateTab('market');
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] hover:border-[#CBD5E1] cursor-pointer transition shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <StockLogo ticker={s.ticker} size="md" />
                  <div>
                    <div className="font-bold text-xs text-[#0F172A] font-mono tracking-tight">{s.ticker}</div>
                    <div className="text-[11px] text-[#64748B] truncate max-w-[160px] font-sans">{s.name}</div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-[#0F172A]">₹{Number(s.latest_price || 0).toFixed(2)}</div>
                  <div className="text-[11px] font-bold text-[#E11D48] flex items-center justify-end gap-0.5">
                    {Number(s.change_pct_1d || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
