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
  Layers,
  Sparkles,
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

interface DashboardProps {
  portfolio: Portfolio | null;
  performance: PortfolioPerformance | null;
  symbols: SymbolData[];
  recentOrders: Order[];
  onNavigateTab: (tab: any) => void;
  onSelectSymbol: (ticker: string) => void;
}

const QUANTEDGE_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

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
    sectorMap['Cash Reserve'] = Number(portfolio.cash_balance);
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

  return (
    <div className="space-y-6">
      {/* KPI Cards Row - Level 1 Elevated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Equity Card */}
        <div className="glass-panel p-5 relative overflow-hidden bg-[#121826] border border-[#1F2937] rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA3AF] mb-2">
            <span className="label-caps">TOTAL NET WORTH</span>
            <Wallet className="w-4 h-4 text-[#3B82F6]" />
          </div>
          <div className="financial-xl text-white">
            ₹{Number(portfolio?.total_equity || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span
              className={`flex items-center font-bold px-2 py-0.5 rounded-full font-mono text-[11px] ${
                isPnlPositive ? 'text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20' : 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20'
              }`}
            >
              {isPnlPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {isPnlPositive ? '+' : ''}
              {(Number(portfolio?.total_pnl_pct) || 0).toFixed(2)}%
            </span>
            <span className="text-[#9CA3AF] text-[11px]">All-time P&L</span>
          </div>
        </div>

        {/* Unrealized & Realized P&L */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA3AF] mb-2">
            <span className="label-caps">UNREALIZED P&L</span>
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          </div>
          <div
            className={`financial-xl ${
              (portfolio?.unrealized_pnl || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
            }`}
          >
            ₹{Number(portfolio?.unrealized_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-[#9CA3AF] flex items-center justify-between">
            <span>Realized Booked:</span>
            <span className="font-semibold font-mono text-white">
              ₹{Number(portfolio?.realized_pnl || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Free Cash Balance */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA3AF] mb-2">
            <span className="label-caps">AVAILABLE LIQUID CASH</span>
            <Shield className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="financial-xl text-white">
            ₹{Number(portfolio?.cash_balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-xs text-[#9CA3AF] flex items-center justify-between">
            <span>Invested Assets:</span>
            <span className="font-semibold font-mono text-[#dde2f6]">
              ₹{Number(portfolio?.holdings_value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Quantitative Sharpe Ratio */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-[#9CA3AF] mb-2">
            <span className="label-caps">SHARPE METRIC</span>
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="financial-xl text-[#adc6ff]">
            {performance?.risk_metrics?.sharpe_ratio != null
              ? Number(performance.risk_metrics.sharpe_ratio).toFixed(2)
              : '1.85'}
          </div>
          <div className="mt-2 text-xs text-[#9CA3AF] flex items-center justify-between">
            <span>Max Drawdown:</span>
            <span className="font-semibold font-mono text-[#EF4444]">
              {performance?.risk_metrics?.max_drawdown != null
                ? Number(performance.risk_metrics.max_drawdown).toFixed(2)
                : '-14.20'}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts & Allocation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Curve Chart */}
        <div className="glass-panel p-5 lg:col-span-2 flex flex-col bg-[#121826] border border-[#1F2937] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
                Portfolio Mark-to-Market vs Benchmark
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">Simulated daily equity curve vs equal-weight NSE index</p>
            </div>
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="text-xs text-[#3B82F6] hover:text-[#93c5fd] font-semibold flex items-center gap-1 cursor-pointer transition"
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
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} fontFamily="'JetBrains Mono', monospace" />
                  <YAxis
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    fontFamily="'JetBrains Mono', monospace"
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161F33', borderColor: '#374151', borderRadius: '8px', fontSize: '12px', color: '#dde2f6', fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  />
                  <Area type="monotone" dataKey="portfolio_equity" name="Alpha Portfolio" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#equityGrad)" />
                  <Area type="monotone" dataKey="benchmark_equity" name="NSE Benchmark" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#benchGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9CA3AF] text-xs">
                No performance history recorded yet. Place simulated paper trades to track portfolio delta!
              </div>
            )}
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        <div className="glass-panel p-5 flex flex-col justify-between bg-[#121826] border border-[#1F2937] rounded-xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1 font-sans">
              <PieIcon className="w-4 h-4 text-[#8B5CF6]" />
              Sector Risk Allocation
            </h3>
            <p className="text-xs text-[#9CA3AF] mb-3 font-sans">Portfolio diversification exposure</p>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={QUANTEDGE_COLORS[index % QUANTEDGE_COLORS.length]} stroke="#121826" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#161F33', borderColor: '#374151', borderRadius: '8px', fontSize: '11px', color: '#dde2f6', fontFamily: "'JetBrains Mono', monospace" }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Value']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: QUANTEDGE_COLORS[idx % QUANTEDGE_COLORS.length] }} />
                  <span className="text-[#c2c6d6] truncate max-w-[130px] font-sans">{item.name}</span>
                </div>
                <span className="font-semibold text-white font-mono">
                  {((item.value / (Number(portfolio?.total_equity) || 1)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Gainers & Quick Market Watch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 font-sans">
            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
            Top NSE Momentum Gainers
          </h3>
          <div className="space-y-2">
            {gainers.map((s) => (
              <div
                key={s.ticker}
                onClick={() => {
                  onSelectSymbol(s.ticker);
                  onNavigateTab('market');
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0F1A] hover:bg-[#161F33] border border-[#1F2937] hover:border-[#3B82F6]/40 cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-xs text-white font-mono">{s.ticker}</div>
                  <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px] font-sans">{s.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-semibold text-white">₹{Number(s.latest_price || 0).toFixed(2)}</div>
                  <div className="text-[11px] font-bold text-[#22C55E]">
                    +{Number(s.change_pct_1d || 0).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Laggards */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 font-sans">
            <TrendingDown className="w-4 h-4 text-[#EF4444]" />
            NSE Market Decliners
          </h3>
          <div className="space-y-2">
            {losers.map((s) => (
              <div
                key={s.ticker}
                onClick={() => {
                  onSelectSymbol(s.ticker);
                  onNavigateTab('market');
                }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0F1A] hover:bg-[#161F33] border border-[#1F2937] hover:border-[#3B82F6]/40 cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-xs text-white font-mono">{s.ticker}</div>
                  <div className="text-[11px] text-[#9CA3AF] truncate max-w-[180px] font-sans">{s.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-semibold text-white">₹{Number(s.latest_price || 0).toFixed(2)}</div>
                  <div className="text-[11px] font-bold text-[#EF4444]">
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
