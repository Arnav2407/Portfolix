import React, { useState } from 'react';
import {
  History,
  Play,
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
  const [momentumLookback] = useState('20');

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
      <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15 border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#0F172A] tracking-tight font-sans">
                  PORTFOLIX STRATEGY LAB & BACKTESTER
                </h2>
                <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                  ZERO LOOKAHEAD
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                Deterministic bar-by-bar engine simulating realistic slippage, transactional frictions, and fills
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRunGridOptimization}
            disabled={gridLoading}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Grid className="w-3.5 h-3.5 text-[#0284C7]" />
            {gridLoading ? 'Sweeping Grid...' : 'Parameter Grid Search'}
          </button>
        </div>

        <form onSubmit={handleRunBacktest} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Strategy Type */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">Strategy Architecture</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
            >
              <option value="SMA_CROSS">Dual Moving Average Crossover (SMA)</option>
              <option value="RSI_MEAN_REVERSION">RSI Mean Reversion (Statistical Bounds)</option>
              <option value="MACD">MACD Trend Momentum & Signal Divergence</option>
              <option value="MOMENTUM">Rate of Change (ROC) Dual Momentum</option>
            </select>
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">Asset</label>
            <select
              value={selectedSymbol}
              onChange={(e) => onSelectSymbol(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
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
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
            />
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <Play className="w-3.5 h-3.5" />
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </form>

        {/* Dynamic Parameter Sliders */}
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          {strategy === 'SMA_CROSS' && (
            <>
              <div>
                <label className="text-[#64748B] text-[11px]">Fast SMA: <strong className="text-[#0F172A]">{smaFast}</strong></label>
                <input type="range" min="5" max="50" value={smaFast} onChange={(e) => setSmaFast(e.target.value)} className="w-full mt-1 accent-[#0284C7]" />
              </div>
              <div>
                <label className="text-[#64748B] text-[11px]">Slow SMA: <strong className="text-[#0F172A]">{smaSlow}</strong></label>
                <input type="range" min="20" max="200" value={smaSlow} onChange={(e) => setSmaSlow(e.target.value)} className="w-full mt-1 accent-[#0284C7]" />
              </div>
            </>
          )}

          {strategy === 'RSI_MEAN_REVERSION' && (
            <>
              <div>
                <label className="text-[#64748B] text-[11px]">RSI Period: <strong className="text-[#0F172A]">{rsiPeriod}</strong></label>
                <input type="range" min="7" max="28" value={rsiPeriod} onChange={(e) => setRsiPeriod(e.target.value)} className="w-full mt-1 accent-[#0284C7]" />
              </div>
              <div>
                <label className="text-[#64748B] text-[11px]">Oversold Level: <strong className="text-[#10B981]">{rsiOversold}</strong></label>
                <input type="range" min="15" max="45" value={rsiOversold} onChange={(e) => setRsiOversold(e.target.value)} className="w-full mt-1 accent-[#10B981]" />
              </div>
              <div>
                <label className="text-[#64748B] text-[11px]">Overbought Level: <strong className="text-[#F43F5E]">{rsiOverbought}</strong></label>
                <input type="range" min="55" max="85" value={rsiOverbought} onChange={(e) => setRsiOverbought(e.target.value)} className="w-full mt-1 accent-[#F43F5E]" />
              </div>
            </>
          )}

          {strategy === 'MACD' && (
            <>
              <div>
                <label className="text-[#64748B] text-[11px]">Fast EMA: <strong className="text-[#0F172A]">{macdFast}</strong></label>
                <input type="range" min="5" max="20" value={macdFast} onChange={(e) => setMacdFast(e.target.value)} className="w-full mt-1 accent-[#0284C7]" />
              </div>
              <div>
                <label className="text-[#64748B] text-[11px]">Slow EMA: <strong className="text-[#0F172A]">{macdSlow}</strong></label>
                <input type="range" min="20" max="40" value={macdSlow} onChange={(e) => setMacdSlow(e.target.value)} className="w-full mt-1 accent-[#0284C7]" />
              </div>
              <div>
                <label className="text-[#64748B] text-[11px]">Signal EMA: <strong className="text-[#0F172A]">{macdSignal}</strong></label>
                <input type="range" min="5" max="15" value={macdSignal} onChange={(e) => setMacdSignal(e.target.value)} className="w-full mt-1 accent-[#0284C7]" />
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
            <div className="glass-panel p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
              <div className="label-caps text-[#64748B]">Total Return</div>
              <div className={`financial-lg font-bold mt-1 ${result.total_return_pct >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                {result.total_return_pct >= 0 ? '+' : ''}{Number(result.total_return_pct).toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Bench: {Number(result.benchmark_return_pct).toFixed(1)}%</div>
            </div>

            <div className="glass-panel p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
              <div className="label-caps text-[#64748B]">CAGR %</div>
              <div className="financial-lg font-bold text-[#0F172A] mt-1">
                {Number(result.cagr).toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Compounded Ann.</div>
            </div>

            <div className="glass-panel p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
              <div className="label-caps text-[#64748B]">Sharpe Ratio</div>
              <div className="financial-lg font-bold text-[#0284C7] mt-1">
                {Number(result.sharpe_ratio).toFixed(2)}
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Sortino: {Number(result.sortino_ratio).toFixed(2)}</div>
            </div>

            <div className="glass-panel p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
              <div className="label-caps text-[#64748B]">Max Drawdown</div>
              <div className="financial-lg font-bold text-[#F43F5E] mt-1">
                {Number(result.max_drawdown_pct).toFixed(2)}%
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Calmar: {Number(result.calmar_ratio).toFixed(2)}</div>
            </div>

            <div className="glass-panel p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
              <div className="label-caps text-[#64748B]">Win Rate</div>
              <div className="financial-lg font-bold text-[#10B981] mt-1">
                {Number(result.win_rate).toFixed(1)}%
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">{result.winning_trades}W / {result.losing_trades}L</div>
            </div>

            <div className="glass-panel p-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
              <div className="label-caps text-[#64748B]">Profit Factor</div>
              <div className="financial-lg font-bold text-[#0EA5E9] mt-1">
                {Number(result.profit_factor).toFixed(2)}
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">{result.total_trades} fills</div>
            </div>
          </div>

          {/* Sub-Views Tabs */}
          <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4 bg-[#F1F5F9] p-1.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveView('equity')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  activeView === 'equity'
                    ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Equity Curve & Drawdown
              </button>
              <button
                type="button"
                onClick={() => setActiveView('trades')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  activeView === 'trades'
                    ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Trade Log ({result.trades.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveView('monthly')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  activeView === 'monthly'
                    ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Monthly Returns Matrix
              </button>
              {gridResult && (
                <button
                  type="button"
                  onClick={() => setActiveView('grid')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                    activeView === 'grid'
                      ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A]'
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
                        <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
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
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#BAE6FD', borderRadius: '12px', fontSize: '12px', color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    />
                    <Area type="monotone" dataKey="equity" name="Strategy Equity" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#btEquityGrad)" />
                    <Area type="monotone" dataKey="benchmark_equity" name="Buy & Hold Benchmark" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trade Log Table */}
            {activeView === 'trades' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
                      <th className="pb-2.5">Entry</th>
                      <th className="pb-2.5">Exit</th>
                      <th className="pb-2.5">Entry Price</th>
                      <th className="pb-2.5">Exit Price</th>
                      <th className="pb-2.5">Shares</th>
                      <th className="pb-2.5">Holding</th>
                      <th className="pb-2.5">P&L (₹)</th>
                      <th className="pb-2.5 text-right">Return %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {result.trades.map((t, idx) => {
                      const isUp = t.pnl > 0;
                      return (
                        <tr key={idx} className="h-10 hover:bg-[#F8FAFC] transition">
                          <td className="py-2 text-[#334155]">{t.entry_date}</td>
                          <td className="py-2 text-[#334155]">{t.exit_date}</td>
                          <td className="py-2 text-[#64748B]">₹{Number(t.entry_price).toFixed(2)}</td>
                          <td className="py-2 font-semibold text-[#0F172A]">₹{Number(t.exit_price).toFixed(2)}</td>
                          <td className="py-2 text-[#334155]">{Number(t.quantity).toFixed(0)}</td>
                          <td className="py-2 text-[#64748B]">{t.holding_period_days}d</td>
                          <td className={`py-2 font-bold ${isUp ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                            {isUp ? '+' : ''}₹{Number(t.pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </td>
                          <td className={`py-2 text-right font-bold ${isUp ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
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
                    <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
                      <th className="p-2.5 text-left">Year</th>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                        <th key={m} className="p-2.5">{m}</th>
                      ))}
                      <th className="p-2.5 text-right font-bold text-[#0F172A]">YTD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {result.monthly_matrix.map((row) => (
                      <tr key={row.year} className="hover:bg-[#F8FAFC]">
                        <td className="p-2.5 font-bold text-left text-[#0F172A]">{row.year}</td>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((mo) => {
                          const val = row.returns[mo];
                          if (val === undefined) return <td key={mo} className="p-2.5 text-[#94A3B8]">-</td>;
                          const isPos = val >= 0;
                          return (
                            <td
                              key={mo}
                              className={`p-2.5 font-semibold ${isPos ? 'text-[#047857] bg-[#10B981]/15' : 'text-[#BE123C] bg-[#F43F5E]/15'}`}
                            >
                              {Number(val).toFixed(1)}%
                            </td>
                          );
                        })}
                        <td className={`p-2.5 text-right font-bold ${row.total_year >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
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
                <div className="p-3.5 bg-[#E0F2FE] border border-[#BAE6FD] rounded-xl text-xs text-[#0284C7] font-mono">
                  ⚡ <strong>Optimal Grid Parameters:</strong> Fast: {gridResult.best_parameters_by_sharpe?.fast_period ?? 'N/A'}, Slow: {gridResult.best_parameters_by_sharpe?.slow_period ?? 'N/A'} (Sharpe: {gridResult.results?.length ? Math.max(...gridResult.results.map((r: any) => Number(r.sharpe_ratio) || 0)).toFixed(2) : 'N/A'})
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
                        <th className="pb-2.5">Parameters</th>
                        <th className="pb-2.5">Return %</th>
                        <th className="pb-2.5">Sharpe</th>
                        <th className="pb-2.5">Max DD</th>
                        <th className="pb-2.5">Win Rate</th>
                        <th className="pb-2.5 text-right">Trades</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {gridResult.results.map((item: any, i: number) => (
                        <tr key={i} className="h-10 hover:bg-[#F8FAFC]">
                          <td className="py-2.5 text-[#334155]">{JSON.stringify(item.parameters)}</td>
                          <td className={`py-2.5 font-bold ${item.total_return_pct >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                            {Number(item.total_return_pct).toFixed(2)}%
                          </td>
                          <td className="py-2.5 font-bold text-[#0284C7]">{Number(item.sharpe_ratio).toFixed(2)}</td>
                          <td className="py-2.5 text-[#F43F5E]">{Number(item.max_drawdown_pct).toFixed(2)}%</td>
                          <td className="py-2.5 text-[#334155]">{Number(item.win_rate).toFixed(1)}%</td>
                          <td className="py-2.5 text-right text-[#64748B]">{item.total_trades}</td>
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

      {/* Initial Strategy State when no backtest has run yet */}
      {!result && !loading && (
        <div className="glass-panel p-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
          <img
            src="/images/audit-ledger.jpg"
            alt="Quantitative Strategy Simulation Lab"
            className="w-72 h-40 object-cover rounded-xl border border-[#E2E8F0] shadow-sm"
          />
          <div className="max-w-md">
            <h3 className="font-bold text-base text-[#0F172A] font-sans">
              Algorithmic Simulation Lab is Armed
            </h3>
            <p className="text-xs text-[#64748B] mt-1 font-sans">
              Test moving-average crossovers, RSI statistical mean-reversions, or momentum ROC against 8+ years of tick-verified historical daily bars.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
