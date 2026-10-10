import React, { useState } from 'react';
import {
  History,
  Play,
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Sparkles,
  Sliders,
  Calendar,
  Grid,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../api/client';
import { SymbolData, BacktestResult } from '../types';

interface BacktestStudioProps {
  symbols: SymbolData[];
  selectedSymbol: string;
  onSelectSymbol: (ticker: string) => void;
}

export const BacktestStudio: React.FC<BacktestStudioProps> = ({
  symbols,
  selectedSymbol,
  onSelectSymbol,
}) => {
  const [strategy, setStrategy] = useState<string>('SMA_CROSS');
  const [startDate, setStartDate] = useState('2018-01-01');
  const [endDate, setEndDate] = useState('2026-09-28');
  const [initialCash, setInitialCash] = useState('1000000');

  // Strategy parameters
  const [smaFast, setSmaFast] = useState('20');
  const [smaSlow, setSmaSlow] = useState('50');
  const [rsiPeriod, setRsiPeriod] = useState('14');
  const [rsiOversold, setRsiOversold] = useState('30');
  const [rsiOverbought, setRsiOverbought] = useState('70');
  const [macdFast, setMacdFast] = useState('12');
  const [macdSlow, setMacdSlow] = useState('26');
  const [macdSignal, setMacdSignal] = useState('9');
  const [momentumLookback, setMomentumLookback] = useState('20');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [activeView, setActiveView] = useState<'equity' | 'trades' | 'monthly' | 'grid'>('equity');

  // Grid optimization
  const [gridLoading, setGridLoading] = useState(false);
  const [gridResult, setGridResult] = useState<any | null>(null);

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let params: Record<string, any> = {};
      if (strategy === 'SMA_CROSS') {
        params = { fast_period: Number(smaFast), slow_period: Number(smaSlow) };
      } else if (strategy === 'RSI_MEAN_REVERSION') {
        params = {
          rsi_period: Number(rsiPeriod),
          oversold_threshold: Number(rsiOversold),
          overbought_threshold: Number(rsiOverbought),
        };
      } else if (strategy === 'MACD') {
        params = { fast_span: Number(macdFast), slow_span: Number(macdSlow), signal_span: Number(macdSignal) };
      } else if (strategy === 'MOMENTUM') {
        params = { lookback_period: Number(momentumLookback), roc_threshold_pct: 2.0 };
      }

      const res = await api.post<BacktestResult>('/backtests/run', {
        strategy_type: strategy,
        symbol: selectedSymbol,
        start_date: startDate,
        end_date: endDate,
        initial_cash: Number(initialCash),
        parameters: params,
      });
      setResult(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Backtest execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunGridOptimization = async () => {
    setGridLoading(true);
    try {
      const gridParams: Record<string, any[]> =
        strategy === 'SMA_CROSS'
          ? { fast_period: [10, 20, 30], slow_period: [40, 50, 100] }
          : { rsi_period: [10, 14, 21], oversold_threshold: [25, 30, 35], overbought_threshold: [65, 70, 75] };

      const res = await api.post('/backtests/optimize', {
        strategy_type: strategy,
        symbol: selectedSymbol,
        start_date: startDate,
        end_date: endDate,
        initial_cash: Number(initialCash),
        parameter_grid: gridParams,
      });
      setGridResult(res.data);
      setActiveView('grid');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Grid search failed');
    } finally {
      setGridLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backtest Config Header */}
      <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                  Event-Driven Strategy Backtester
                </h2>
                <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
                  ZERO LOOKAHEAD
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
                Deterministic bar-by-bar engine simulating realistic slippage and transactional frictions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRunGridOptimization}
            disabled={gridLoading}
            className="px-3.5 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-xs font-semibold text-[#adc6ff] flex items-center gap-1.5 transition cursor-pointer active:scale-98"
          >
            <Grid className="w-3.5 h-3.5 text-[#3B82F6]" />
            {gridLoading ? 'Sweeping Grid...' : 'Parameter Grid Search'}
          </button>
        </div>

        <form onSubmit={handleRunBacktest} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Strategy Type */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">Strategy Architecture</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white focus:border-[#3B82F6]"
            >
              <option value="SMA_CROSS">Dual Moving Average Crossover (SMA)</option>
              <option value="RSI_MEAN_REVERSION">RSI Mean Reversion (Statistical Bounds)</option>
              <option value="MACD">MACD Trend Momentum & Signal Divergence</option>
              <option value="MOMENTUM">Rate of Change (ROC) Dual Momentum</option>
            </select>
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">Asset</label>
            <select
              value={selectedSymbol}
              onChange={(e) => onSelectSymbol(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white font-mono focus:border-[#3B82F6]"
            >
              {symbols.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white font-mono focus:border-[#3B82F6]"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white font-mono focus:border-[#3B82F6]"
            />
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs rounded-lg shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <Play className="w-3.5 h-3.5" />
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </form>

        {/* Dynamic Parameter Sliders */}
        <div className="mt-4 pt-4 border-t border-[#1F2937] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          {strategy === 'SMA_CROSS' && (
            <>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Fast SMA: <strong className="text-white">{smaFast}</strong></label>
                <input type="range" min="5" max="50" value={smaFast} onChange={(e) => setSmaFast(e.target.value)} className="w-full mt-1 accent-[#3B82F6]" />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Slow SMA: <strong className="text-white">{smaSlow}</strong></label>
                <input type="range" min="20" max="200" value={smaSlow} onChange={(e) => setSmaSlow(e.target.value)} className="w-full mt-1 accent-[#3B82F6]" />
              </div>
            </>
          )}

          {strategy === 'RSI_MEAN_REVERSION' && (
            <>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">RSI Period: <strong className="text-white">{rsiPeriod}</strong></label>
                <input type="range" min="7" max="28" value={rsiPeriod} onChange={(e) => setRsiPeriod(e.target.value)} className="w-full mt-1 accent-[#3B82F6]" />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Oversold Level: <strong className="text-[#22C55E]">{rsiOversold}</strong></label>
                <input type="range" min="15" max="45" value={rsiOversold} onChange={(e) => setRsiOversold(e.target.value)} className="w-full mt-1 accent-[#22C55E]" />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Overbought Level: <strong className="text-[#EF4444]">{rsiOverbought}</strong></label>
                <input type="range" min="55" max="85" value={rsiOverbought} onChange={(e) => setRsiOverbought(e.target.value)} className="w-full mt-1 accent-[#EF4444]" />
              </div>
            </>
          )}

          {strategy === 'MACD' && (
            <>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Fast EMA: <strong className="text-white">{macdFast}</strong></label>
                <input type="range" min="5" max="20" value={macdFast} onChange={(e) => setMacdFast(e.target.value)} className="w-full mt-1 accent-[#3B82F6]" />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Slow EMA: <strong className="text-white">{macdSlow}</strong></label>
                <input type="range" min="20" max="40" value={macdSlow} onChange={(e) => setMacdSlow(e.target.value)} className="w-full mt-1 accent-[#3B82F6]" />
              </div>
              <div>
                <label className="text-[#9CA3AF] text-[11px]">Signal EMA: <strong className="text-white">{macdSignal}</strong></label>
                <input type="range" min="5" max="15" value={macdSignal} onChange={(e) => setMacdSignal(e.target.value)} className="w-full mt-1 accent-[#3B82F6]" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Backtest Results Dashboard */}
      {result && (
        <div className="space-y-6">
          {/* Performance KPIs Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono">
            <div className="glass-panel p-4 bg-[#121826] border border-[#1F2937] rounded-xl">
              <div className="label-caps text-[#9CA3AF]">Total Return</div>
              <div className={`financial-lg font-bold mt-1 ${result.total_return_pct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {result.total_return_pct >= 0 ? '+' : ''}{Number(result.total_return_pct).toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Bench: {Number(result.benchmark_return_pct).toFixed(1)}%</div>
            </div>

            <div className="glass-panel p-4 bg-[#121826] border border-[#1F2937] rounded-xl">
              <div className="label-caps text-[#9CA3AF]">CAGR %</div>
              <div className="financial-lg font-bold text-white mt-1">
                {Number(result.cagr).toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Compounded Ann.</div>
            </div>

            <div className="glass-panel p-4 bg-[#121826] border border-[#1F2937] rounded-xl">
              <div className="label-caps text-[#9CA3AF]">Sharpe Ratio</div>
              <div className="financial-lg font-bold text-[#adc6ff] mt-1">
                {Number(result.sharpe_ratio).toFixed(2)}
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Sortino: {Number(result.sortino_ratio).toFixed(2)}</div>
            </div>

            <div className="glass-panel p-4 bg-[#121826] border border-[#1F2937] rounded-xl">
              <div className="label-caps text-[#9CA3AF]">Max Drawdown</div>
              <div className="financial-lg font-bold text-[#EF4444] mt-1">
                {Number(result.max_drawdown_pct).toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">Calmar: {Number(result.calmar_ratio).toFixed(2)}</div>
            </div>

            <div className="glass-panel p-4 bg-[#121826] border border-[#1F2937] rounded-xl">
              <div className="label-caps text-[#9CA3AF]">Win Rate</div>
              <div className="financial-lg font-bold text-[#22C55E] mt-1">
                {Number(result.win_rate).toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">{result.winning_trades}W / {result.losing_trades}L</div>
            </div>

            <div className="glass-panel p-4 bg-[#121826] border border-[#1F2937] rounded-xl">
              <div className="label-caps text-[#9CA3AF]">Profit Factor</div>
              <div className="financial-lg font-bold text-[#4ae176] mt-1">
                {Number(result.profit_factor).toFixed(2)}
              </div>
              <div className="text-[10px] text-[#9CA3AF] mt-0.5">{result.total_trades} fills</div>
            </div>
          </div>

          {/* Sub-Views Tabs */}
          <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
            <div className="flex items-center gap-2 mb-4 bg-[#0B0F1A] p-1 rounded-lg border border-[#1F2937]">
              <button
                type="button"
                onClick={() => setActiveView('equity')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                  activeView === 'equity'
                    ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Equity Curve & Drawdown
              </button>
              <button
                type="button"
                onClick={() => setActiveView('trades')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                  activeView === 'trades'
                    ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Trade Log ({result.trades.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveView('monthly')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                  activeView === 'monthly'
                    ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Monthly Returns Matrix
              </button>
              {gridResult && (
                <button
                  type="button"
                  onClick={() => setActiveView('grid')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                    activeView === 'grid'
                      ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Grid Sweep
                </button>
              )}
            </div>

            {/* Equity Curve View */}
            {activeView === 'equity' && (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.equity_curve}>
                    <defs>
                      <linearGradient id="btEquityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
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
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    />
                    <Area type="monotone" dataKey="equity" name="Strategy Equity" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#btEquityGrad)" />
                    <Area type="monotone" dataKey="benchmark_equity" name="Buy & Hold Benchmark" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trade Log Table */}
            {activeView === 'trades' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                      <th className="pb-2">Entry</th>
                      <th className="pb-2">Exit</th>
                      <th className="pb-2">Entry Price</th>
                      <th className="pb-2">Exit Price</th>
                      <th className="pb-2">Shares</th>
                      <th className="pb-2">Holding</th>
                      <th className="pb-2">P&L (₹)</th>
                      <th className="pb-2 text-right">Return %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {result.trades.map((t, idx) => {
                      const isUp = t.pnl > 0;
                      return (
                        <tr key={idx} className="h-9 hover:bg-[#161F33]/40">
                          <td className="py-2 text-[#dde2f6]">{t.entry_date}</td>
                          <td className="py-2 text-[#dde2f6]">{t.exit_date}</td>
                          <td className="py-2 text-[#9CA3AF]">₹{Number(t.entry_price).toFixed(2)}</td>
                          <td className="py-2 font-semibold text-white">₹{Number(t.exit_price).toFixed(2)}</td>
                          <td className="py-2 text-[#dde2f6]">{Number(t.quantity).toFixed(0)}</td>
                          <td className="py-2 text-[#9CA3AF]">{t.holding_period_days}d</td>
                          <td className={`py-2 font-bold ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {isUp ? '+' : ''}₹{Number(t.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                          <td className={`py-2 text-right font-bold ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {isUp ? '+' : ''}{Number(t.return_pct).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Monthly Return Matrix */}
            {activeView === 'monthly' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center font-mono border-collapse">
                  <thead>
                    <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                      <th className="p-2 text-left">Year</th>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                        <th key={m} className="p-2">{m}</th>
                      ))}
                      <th className="p-2 text-right font-bold text-white">YTD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {result.monthly_matrix.map((row) => (
                      <tr key={row.year} className="hover:bg-[#161F33]/40">
                        <td className="p-2 font-bold text-left text-white">{row.year}</td>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((mo) => {
                          const val = row.returns[mo];
                          if (val === undefined) return <td key={mo} className="p-2 text-[#6B7280]">-</td>;
                          const isPos = val >= 0;
                          return (
                            <td
                              key={mo}
                              className={`p-2 font-semibold ${isPos ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}
                            >
                              {Number(val).toFixed(1)}%
                            </td>
                          );
                        })}
                        <td className={`p-2 text-right font-bold ${row.total_year >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {row.total_year >= 0 ? '+' : ''}{Number(row.total_year).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grid Optimizer Results View */}
            {activeView === 'grid' && gridResult && (
              <div className="space-y-4">
                <div className="p-3 bg-[#3B82F6]/10 border border-[#3B82F6]/30 rounded-lg text-xs text-[#adc6ff] font-mono">
                  ⚡ <strong>Optimal Grid Parameters:</strong> Fast: {gridResult.best_parameters_by_sharpe?.fast_period ?? 'N/A'}, Slow: {gridResult.best_parameters_by_sharpe?.slow_period ?? 'N/A'} (Sharpe: {gridResult.results?.length ? Math.max(...gridResult.results.map((r: any) => Number(r.sharpe_ratio) || 0)).toFixed(2) : 'N/A'})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                        <th className="pb-2">Parameters</th>
                        <th className="pb-2">Return %</th>
                        <th className="pb-2">Sharpe</th>
                        <th className="pb-2">Max DD</th>
                        <th className="pb-2">Win Rate</th>
                        <th className="pb-2 text-right">Trades</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      {gridResult.results.map((item: any, i: number) => (
                        <tr key={i} className="h-9 hover:bg-[#161F33]/40">
                          <td className="py-2 text-[#dde2f6]">{JSON.stringify(item.parameters)}</td>
                          <td className={`py-2 font-bold ${item.total_return_pct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {Number(item.total_return_pct).toFixed(2)}%
                          </td>
                          <td className="py-2 font-bold text-[#adc6ff]">{Number(item.sharpe_ratio).toFixed(2)}</td>
                          <td className="py-2 text-[#EF4444]">{Number(item.max_drawdown_pct).toFixed(2)}%</td>
                          <td className="py-2 text-[#dde2f6]">{Number(item.win_rate).toFixed(1)}%</td>
                          <td className="py-2 text-right text-[#9CA3AF]">{item.total_trades}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
