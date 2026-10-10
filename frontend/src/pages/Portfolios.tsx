import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Shield,
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Download,
  Sliders,
  DollarSign,
  TrendingUp,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  Cell,
  Line,
} from 'recharts';
import api from '../api/client';
import {
  Portfolio,
  PortfolioPerformance,
  OptimizationResponse,
  SymbolData,
} from '../types';

interface PortfoliosProps {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  onSelectPortfolio: (p: Portfolio) => void;
  performance: PortfolioPerformance | null;
  symbols: SymbolData[];
  onRefresh: () => void;
}

export const Portfolios: React.FC<PortfoliosProps> = ({
  portfolios,
  activePortfolio,
  onSelectPortfolio,
  performance,
  symbols,
  onRefresh,
}) => {
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCashModal, setShowCashModal] = useState(false);
  const [isDeposit, setIsDeposit] = useState(true);
  const [cashAmount, setCashAmount] = useState('50000');
  const [newPortName, setNewPortName] = useState('');
  const [newPortCash, setNewPortCash] = useState('1000000');

  // MPT Optimization states
  const [optLoading, setOptLoading] = useState(false);
  const [optResult, setOptResult] = useState<OptimizationResponse | null>(null);
  const [optSymbols, setOptSymbols] = useState<string[]>([
    'RELIANCE',
    'TCS',
    'HDFCBANK',
    'INFY',
    'ICICIBANK',
    'LT',
  ]);

  // Rebalancing states
  const [rebalancePlan, setRebalancePlan] = useState<any | null>(null);
  const [rebLoading, setRebLoading] = useState(false);
  const [targetWeights, setTargetWeights] = useState<Record<string, number>>({});

  const handleCreatePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/portfolios', {
        name: newPortName,
        initial_cash: Number(newPortCash),
      });
      setShowCreateModal(false);
      setNewPortName('');
      onRefresh();
      onSelectPortfolio(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create portfolio');
    }
  };

  const handleCashAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePortfolio) return;
    try {
      const endpoint = isDeposit ? 'deposit' : 'withdraw';
      await api.post(`/portfolios/${activePortfolio.id}/${endpoint}`, {
        amount: Number(cashAmount),
        notes: isDeposit ? 'User cash funding' : 'User cash withdrawal',
      });
      setShowCashModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Cash transaction failed');
    }
  };

  const handleRunOptimization = async () => {
    setOptLoading(true);
    try {
      const res = await api.post<OptimizationResponse>('/portfolios/optimize', {
        symbols: optSymbols,
        risk_free_rate: 0.06,
      });
      setOptResult(res.data);

      // Initialize rebalance weights from max sharpe
      const msWeights = res.data.max_sharpe.weights;
      const initialTargets: Record<string, number> = {};
      Object.entries(msWeights).forEach(([s, w]) => {
        initialTargets[s] = Math.round(w * 100);
      });
      setTargetWeights(initialTargets);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Optimization failed');
    } finally {
      setOptLoading(false);
    }
  };

  const handleCalculateRebalance = async () => {
    if (!activePortfolio) return;
    setRebLoading(true);
    try {
      const targetsList = Object.entries(targetWeights).map(([sym, wt]) => ({
        symbol: sym,
        target_weight_pct: wt,
      }));
      const res = await api.post(`/portfolios/${activePortfolio.id}/rebalance`, {
        targets: targetsList,
      });
      setRebalancePlan(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Rebalancing calculation failed');
    } finally {
      setRebLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!activePortfolio) return;
    window.open(`/api/v1/reports/portfolio/${activePortfolio.id}/csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Header & Switcher */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                {activePortfolio?.name || 'Main Alpha Portfolio'}
              </h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
                MPT ENGINE
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
              Modern Portfolio Theory & Multi-Asset Markowitz Optimization Suite
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setIsDeposit(true);
              setShowCashModal(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer active:scale-98"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#22C55E]" />
            Cash Transfer
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F1A] text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-[#22C55E]/20 transition cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            New Book
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-[#adc6ff] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            Audit CSV
          </button>
        </div>
      </div>

      {/* Risk Profile & VaR Matrix */}
      {performance?.risk_metrics && (
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 font-sans">
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            Value-at-Risk (VaR / CVaR) & Factor Exposure Deck
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Sharpe</div>
              <div className="financial-lg font-bold text-[#adc6ff] mt-1">
                {Number(performance.risk_metrics.sharpe_ratio).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Sortino</div>
              <div className="financial-lg font-bold text-[#4ae176] mt-1">
                {Number(performance.risk_metrics.sortino_ratio).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Calmar</div>
              <div className="financial-lg font-bold text-[#3B82F6] mt-1">
                {Number(performance.risk_metrics.calmar_ratio).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Max DD</div>
              <div className="financial-lg font-bold text-[#EF4444] mt-1">
                {Number(performance.risk_metrics.max_drawdown).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">VaR (95%)</div>
              <div className="financial-lg font-bold text-[#F59E0B] mt-1">
                {Number(performance.risk_metrics.var_95_historical).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">CVaR (95%)</div>
              <div className="financial-lg font-bold text-[#EF4444] mt-1">
                {Number(performance.risk_metrics.cvar_95_historical).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Beta</div>
              <div className="financial-lg font-bold text-[#dde2f6] mt-1">
                {Number(performance.risk_metrics.beta).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Alpha (Ann)</div>
              <div className="financial-lg font-bold text-[#22C55E] mt-1">
                {Number(performance.risk_metrics.alpha).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3 font-sans">
          <PieIcon className="w-4 h-4 text-[#8B5CF6]" />
          Asset Holdings & Valuation Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead>
              <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                <th className="pb-2.5">Asset</th>
                <th className="pb-2.5">Quantity</th>
                <th className="pb-2.5">Avg Buy Price</th>
                <th className="pb-2.5">Live Price</th>
                <th className="pb-2.5">Total Invested</th>
                <th className="pb-2.5">Market Value</th>
                <th className="pb-2.5">Unrealized P&L</th>
                <th className="pb-2.5 text-right">Portfolio Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]">
              {activePortfolio?.holdings && activePortfolio.holdings.length > 0 ? (
                activePortfolio.holdings.map((h) => {
                  const isUp = h.unrealized_pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#161F33]/50 h-9 transition">
                      <td className="py-2.5 font-bold text-white">
                        {h.ticker}
                        <span className="block text-[10px] text-[#9CA3AF] font-normal font-sans">{h.name}</span>
                      </td>
                      <td className="py-2.5 text-[#dde2f6]">{Number(h.quantity).toFixed(0)}</td>
                      <td className="py-2.5 text-[#9CA3AF]">₹{Number(h.average_buy_price).toFixed(2)}</td>
                      <td className="py-2.5 font-semibold text-white">₹{Number(h.current_price).toFixed(2)}</td>
                      <td className="py-2.5 text-[#dde2f6]">
                        ₹{Number(h.total_invested).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 font-bold text-white">
                        ₹{Number(h.market_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-2.5 font-bold ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {isUp ? '+' : ''}₹{Number(h.unrealized_pnl).toFixed(2)} ({Number(h.unrealized_pnl_pct || 0).toFixed(2)}%)
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#dde2f6]">
                        {Number(h.weight_pct || 0).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#9CA3AF] text-xs font-sans">
                    No holdings in this book. Place simulated orders in the Trading Terminal!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Markowitz Modern Portfolio Theory (MPT) Optimization Suite */}
      <div className="glass-panel p-6 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              Markowitz Mean-Variance Optimization (Efficient Frontier)
            </h3>
            <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
              Quadratic programming solver for Tangency Portfolio & Risk Parity Weights
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunOptimization}
            disabled={optLoading}
            className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs shadow-lg shadow-[#3B82F6]/20 flex items-center gap-2 transition cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${optLoading ? 'animate-spin' : ''}`} />
            {optLoading ? 'Solving Frontier...' : 'Run MPT Solver'}
          </button>
        </div>

        {/* Selected Universe for Optimization */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#9CA3AF] label-caps mr-1">Asset Basket:</span>
          {symbols.slice(0, 10).map((s) => {
            const isIncluded = optSymbols.includes(s.ticker);
            return (
              <button
                key={s.ticker}
                type="button"
                onClick={() => {
                  if (isIncluded) {
                    if (optSymbols.length > 2) setOptSymbols(optSymbols.filter((x) => x !== s.ticker));
                  } else {
                    setOptSymbols([...optSymbols, s.ticker]);
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border transition cursor-pointer ${
                  isIncluded
                    ? 'bg-[#3B82F6]/15 border-[#3B82F6]/50 text-[#adc6ff]'
                    : 'bg-[#0B0F1A] border-[#1F2937] text-[#9CA3AF] hover:text-white'
                }`}
              >
                {s.ticker}
              </button>
            );
          })}
        </div>

        {/* Optimal Portfolios Result Cards */}
        {optResult && (
          <div className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Max Sharpe */}
              <div className="p-4 bg-[#0B0F1A] rounded-xl border border-[#3B82F6]/40">
                <div className="flex items-center justify-between text-xs font-bold text-[#adc6ff] mb-2 font-sans">
                  <span className="label-caps">MAXIMUM SHARPE (TANGENCY)</span>
                  <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                </div>
                <div className="text-xs text-[#9CA3AF] space-y-1 font-mono">
                  <div>Expected Return: <strong className="text-[#22C55E]">{(Number(optResult.max_sharpe.expected_return) * 100).toFixed(2)}%</strong></div>
                  <div>Annual Volatility: <strong className="text-white">{(Number(optResult.max_sharpe.volatility) * 100).toFixed(2)}%</strong></div>
                  <div>Sharpe Ratio: <strong className="text-[#adc6ff]">{Number(optResult.max_sharpe.sharpe_ratio).toFixed(2)}</strong></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1F2937] space-y-1 text-xs">
                  <div className="label-caps text-[#9CA3AF]">Optimal Weights:</div>
                  {Object.entries(optResult.max_sharpe.weights).map(([s, w]) => (
                    <div key={s} className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#dde2f6]">{s}:</span>
                      <span className="font-bold text-[#22C55E]">{(Number(w) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Min Variance */}
              <div className="p-4 bg-[#0B0F1A] rounded-xl border border-[#1F2937]">
                <div className="flex items-center justify-between text-xs font-bold text-[#dde2f6] mb-2 font-sans">
                  <span className="label-caps">MINIMUM VARIANCE</span>
                  <Shield className="w-4 h-4 text-[#22C55E]" />
                </div>
                <div className="text-xs text-[#9CA3AF] space-y-1 font-mono">
                  <div>Expected Return: <strong className="text-[#22C55E]">{(Number(optResult.min_variance.expected_return) * 100).toFixed(2)}%</strong></div>
                  <div>Annual Volatility: <strong className="text-white">{(Number(optResult.min_variance.volatility) * 100).toFixed(2)}%</strong></div>
                  <div>Sharpe Ratio: <strong className="text-[#dde2f6]">{Number(optResult.min_variance.sharpe_ratio).toFixed(2)}</strong></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1F2937] space-y-1 text-xs">
                  <div className="label-caps text-[#9CA3AF]">Optimal Weights:</div>
                  {Object.entries(optResult.min_variance.weights).map(([s, w]) => (
                    <div key={s} className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#dde2f6]">{s}:</span>
                      <span className="font-bold text-white">{(Number(w) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Parity */}
              <div className="p-4 bg-[#0B0F1A] rounded-xl border border-[#1F2937]">
                <div className="flex items-center justify-between text-xs font-bold text-[#dde2f6] mb-2 font-sans">
                  <span className="label-caps">EQUAL RISK CONTRIBUTION</span>
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="text-xs text-[#9CA3AF] space-y-1 font-mono">
                  <div>Expected Return: <strong className="text-[#22C55E]">{(Number(optResult.risk_parity.expected_return) * 100).toFixed(2)}%</strong></div>
                  <div>Annual Volatility: <strong className="text-white">{(Number(optResult.risk_parity.volatility) * 100).toFixed(2)}%</strong></div>
                  <div>Sharpe Ratio: <strong className="text-[#dde2f6]">{Number(optResult.risk_parity.sharpe_ratio).toFixed(2)}</strong></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#1F2937] space-y-1 text-xs">
                  <div className="label-caps text-[#9CA3AF]">Parity Weights:</div>
                  {Object.entries(optResult.risk_parity.weights).map(([s, w]) => (
                    <div key={s} className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#dde2f6]">{s}:</span>
                      <span className="font-bold text-white">{(Number(w) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Rebalance Tool */}
            <div className="p-5 bg-[#0B0F1A] rounded-xl border border-[#1F2937]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                  <SlidersHorizontal className="w-4 h-4 text-[#3B82F6]" />
                  Target Portfolio Rebalance & Order Delta Engine
                </h4>
                <button
                  type="button"
                  onClick={handleCalculateRebalance}
                  disabled={rebLoading}
                  className="px-3 py-1.5 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F1A] font-extrabold text-xs transition shadow-md shadow-[#22C55E]/20 cursor-pointer active:scale-98"
                >
                  {rebLoading ? 'Calculating...' : 'Generate Rebalance Orders'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {optSymbols.map((sym) => (
                  <div key={sym} className="p-2.5 bg-[#121826] rounded-lg border border-[#1F2937]">
                    <label className="block text-[11px] font-bold text-[#dde2f6] font-mono">{sym} Target %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={targetWeights[sym] ?? 0}
                      onChange={(e) =>
                        setTargetWeights({ ...targetWeights, [sym]: Number(e.target.value) })
                      }
                      className="w-full mt-1 px-2 py-1 bg-[#0B0F1A] border border-[#1F2937] rounded text-xs text-white font-mono focus:border-[#3B82F6]"
                    />
                  </div>
                ))}
              </div>

              {rebalancePlan && (
                <div className="mt-4 border-t border-[#1F2937] pt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                        <th className="pb-2">Asset</th>
                        <th className="pb-2">Action</th>
                        <th className="pb-2">Current Qty</th>
                        <th className="pb-2">Target Qty</th>
                        <th className="pb-2">Order Delta</th>
                        <th className="pb-2">Est. Cost</th>
                        <th className="pb-2">Current Wt</th>
                        <th className="pb-2 text-right">Target Wt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2937]">
                      {rebalancePlan.actions.map((act: any) => (
                        <tr key={act.symbol} className="h-9 hover:bg-[#161F33]/40">
                          <td className="py-2 font-bold text-white">{act.symbol}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                act.action === 'BUY'
                                  ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                  : act.action === 'SELL'
                                  ? 'bg-[#EF4444]/15 text-[#EF4444]'
                                  : 'bg-[#1F2937] text-[#9CA3AF]'
                              }`}
                            >
                              {act.action}
                            </span>
                          </td>
                          <td className="py-2 text-[#dde2f6]">{Number(act.current_quantity).toFixed(0)}</td>
                          <td className="py-2 text-[#dde2f6]">{Number(act.target_quantity).toFixed(0)}</td>
                          <td className="py-2 font-bold text-white">
                            {Number(act.quantity_delta) > 0 ? `+${Number(act.quantity_delta).toFixed(0)}` : Number(act.quantity_delta).toFixed(0)}
                          </td>
                          <td className="py-2 text-[#dde2f6]">₹{Number(act.estimated_cost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td className="py-2 text-[#9CA3AF]">{Number(act.current_weight_pct).toFixed(1)}%</td>
                          <td className="py-2 text-right font-bold text-[#22C55E]">{Number(act.target_weight_pct).toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* New Portfolio Modal - Level 2 Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-level-2 w-full max-w-md p-6 bg-[#161F33] border border-[#374151] rounded-2xl relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans">Initialize New Investment Book</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#9CA3AF] hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Book Name</label>
                <input
                  type="text"
                  required
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  placeholder="e.g. Dividend Factor Portfolio"
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white focus:border-[#3B82F6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Initial Paper Allocation (₹)</label>
                <input
                  type="number"
                  required
                  value={newPortCash}
                  onChange={(e) => setNewPortCash(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white font-mono focus:border-[#3B82F6]"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F1A] font-extrabold text-xs cursor-pointer active:scale-98"
                >
                  Create Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash Modal - Level 2 Overlay */}
      {showCashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="card-level-2 w-full max-w-md p-6 bg-[#161F33] border border-[#374151] rounded-2xl relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white font-sans">
                {isDeposit ? 'Deposit Simulated Capital' : 'Withdraw Capital'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCashModal(false)}
                className="p-1 text-[#9CA3AF] hover:text-white rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCashAction} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white font-mono focus:border-[#3B82F6]"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCashModal(false)}
                  className="btn-secondary px-4 py-2 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F1A] font-extrabold text-xs cursor-pointer active:scale-98"
                >
                  Confirm {isDeposit ? 'Deposit' : 'Withdrawal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
