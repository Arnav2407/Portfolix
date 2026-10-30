import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Shield,
  Activity,
  Plus,
  Sparkles,
  Download,
  DollarSign,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import api from '../api/client';
import {
  Portfolio,
  PortfolioPerformance,
  OptimizationResponse,
  SymbolData,
} from '../types';
import { StockLogo } from '../components/StockLogo';

interface PortfoliosProps {
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  onSelectPortfolio: (p: Portfolio) => void;
  performance: PortfolioPerformance | null;
  symbols: SymbolData[];
  onRefresh: () => void;
}

export const Portfolios: React.FC<PortfoliosProps> = ({
  portfolios: _portfolios,
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
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15 border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#0F172A] tracking-tight font-sans">
                {activePortfolio?.name || 'Main Alpha Portfolio'}
              </h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                PORTFOLIX MPT
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">
              Markowitz Mean-Variance Optimization, Quadratic Efficient Frontier & Risk Parity
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
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#10B981]" />
            Cash Transfer
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-buy-primary px-3.5 py-2 text-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            New Book
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-secondary px-3.5 py-2 text-[#0284C7] text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            Audit CSV
          </button>
        </div>
      </div>

      {/* Risk Profile & VaR Matrix */}
      {performance?.risk_metrics && (
        <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-3.5 font-sans">
            <Shield className="w-4 h-4 text-[#0284C7]" />
            Value-at-Risk (VaR / CVaR) & Factor Exposure Deck
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Sharpe</div>
              <div className="financial-lg font-bold text-[#0284C7] mt-1">
                {Number(performance.risk_metrics.sharpe_ratio).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Sortino</div>
              <div className="financial-lg font-bold text-[#10B981] mt-1">
                {Number(performance.risk_metrics.sortino_ratio).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Calmar</div>
              <div className="financial-lg font-bold text-[#0EA5E9] mt-1">
                {Number(performance.risk_metrics.calmar_ratio).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Max DD</div>
              <div className="financial-lg font-bold text-[#F43F5E] mt-1">
                {Number(performance.risk_metrics.max_drawdown).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">VaR (95%)</div>
              <div className="financial-lg font-bold text-[#D97706] mt-1">
                {Number(performance.risk_metrics.var_95_historical).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">CVaR (95%)</div>
              <div className="financial-lg font-bold text-[#F43F5E] mt-1">
                {Number(performance.risk_metrics.cvar_95_historical).toFixed(2)}%
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Beta</div>
              <div className="financial-lg font-bold text-[#0F172A] mt-1">
                {Number(performance.risk_metrics.beta).toFixed(2)}
              </div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Alpha (Ann)</div>
              <div className="financial-lg font-bold text-[#10B981] mt-1">
                {Number(performance.risk_metrics.alpha).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holdings Table */}
      <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-3.5 font-sans">
          <PieIcon className="w-4 h-4 text-[#8B5CF6]" />
          Asset Holdings & Valuation Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead>
              <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
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
            <tbody className="divide-y divide-[#E2E8F0]">
              {activePortfolio?.holdings && activePortfolio.holdings.length > 0 ? (
                activePortfolio.holdings.map((h) => {
                  const isUp = h.unrealized_pnl >= 0;
                  return (
                    <tr key={h.id} className="hover:bg-[#F8FAFC] h-10 transition">
                      <td className="py-2.5 font-bold text-[#0F172A]">
                        <div className="flex items-center gap-2">
                          <StockLogo ticker={h.ticker} size="sm" />
                          <div>
                            <span>{h.ticker}</span>
                            <span className="block text-[10px] text-[#64748B] font-normal font-sans">{h.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 text-[#334155]">{Number(h.quantity).toFixed(0)}</td>
                      <td className="py-2.5 text-[#64748B]">₹{Number(h.average_buy_price).toFixed(2)}</td>
                      <td className="py-2.5 font-semibold text-[#0F172A]">₹{Number(h.current_price).toFixed(2)}</td>
                      <td className="py-2.5 text-[#334155]">
                        ₹{Number(h.total_invested).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-2.5 font-bold text-[#0F172A]">
                        ₹{Number(h.market_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-2.5 font-bold ${isUp ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                        {isUp ? '+' : ''}₹{Number(h.unrealized_pnl).toFixed(2)} ({Number(h.unrealized_pnl_pct || 0).toFixed(2)}%)
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#334155]">
                        {Number(h.weight_pct || 0).toFixed(2)}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <img
                        src="/images/empty-state.jpg"
                        alt="No active positions"
                        className="w-36 h-28 object-cover rounded-xl border border-[#E2E8F0] shadow-xs"
                      />
                      <div>
                        <p className="font-bold text-sm text-[#0F172A] font-sans">No Holdings in this Book</p>
                        <p className="text-xs text-[#64748B] font-sans mt-0.5">
                          Route paper trades in the Trading Terminal to build this portfolio.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Markowitz Modern Portfolio Theory (MPT) Optimization Suite */}
      <div className="glass-panel p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
              <Sparkles className="w-4 h-4 text-[#0284C7]" />
              Markowitz Mean-Variance Optimization (Efficient Frontier)
            </h3>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">
              Quadratic programming solver for Tangency Portfolio & Equal Risk Contribution
            </p>
          </div>
          <button
            type="button"
            onClick={handleRunOptimization}
            disabled={optLoading}
            className="btn-primary px-4 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${optLoading ? 'animate-spin' : ''}`} />
            {optLoading ? 'Solving Frontier...' : 'Run MPT Solver'}
          </button>
        </div>

        {/* Selected Universe for Optimization */}
        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#64748B] label-caps mr-1">Asset Universe:</span>
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
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold border transition cursor-pointer ${
                  isIncluded
                    ? 'bg-[#E0F2FE] border-[#BAE6FD] text-[#0284C7] shadow-xs'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
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
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#BAE6FD] shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#0284C7] mb-2 font-sans">
                  <span className="label-caps">MAXIMUM SHARPE (TANGENCY)</span>
                  <Sparkles className="w-4 h-4 text-[#0284C7]" />
                </div>
                <div className="text-xs text-[#64748B] space-y-1 font-mono">
                  <div>Expected Return: <strong className="text-[#10B981]">{(Number(optResult.max_sharpe.expected_return) * 100).toFixed(2)}%</strong></div>
                  <div>Annual Volatility: <strong className="text-[#0F172A]">{(Number(optResult.max_sharpe.volatility) * 100).toFixed(2)}%</strong></div>
                  <div>Sharpe Ratio: <strong className="text-[#0284C7] font-bold">{Number(optResult.max_sharpe.sharpe_ratio).toFixed(2)}</strong></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1 text-xs">
                  <div className="label-caps text-[#64748B]">Optimal Weights:</div>
                  {Object.entries(optResult.max_sharpe.weights).map(([s, w]) => (
                    <div key={s} className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#334155]">{s}:</span>
                      <span className="font-bold text-[#10B981]">{(Number(w) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Min Variance */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] mb-2 font-sans">
                  <span className="label-caps">MINIMUM VARIANCE</span>
                  <Shield className="w-4 h-4 text-[#10B981]" />
                </div>
                <div className="text-xs text-[#64748B] space-y-1 font-mono">
                  <div>Expected Return: <strong className="text-[#10B981]">{(Number(optResult.min_variance.expected_return) * 100).toFixed(2)}%</strong></div>
                  <div>Annual Volatility: <strong className="text-[#0F172A]">{(Number(optResult.min_variance.volatility) * 100).toFixed(2)}%</strong></div>
                  <div>Sharpe Ratio: <strong className="text-[#0F172A] font-bold">{Number(optResult.min_variance.sharpe_ratio).toFixed(2)}</strong></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1 text-xs">
                  <div className="label-caps text-[#64748B]">Optimal Weights:</div>
                  {Object.entries(optResult.min_variance.weights).map(([s, w]) => (
                    <div key={s} className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#334155]">{s}:</span>
                      <span className="font-bold text-[#0F172A]">{(Number(w) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Parity */}
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] mb-2 font-sans">
                  <span className="label-caps">EQUAL RISK CONTRIBUTION</span>
                  <Activity className="w-4 h-4 text-[#8B5CF6]" />
                </div>
                <div className="text-xs text-[#64748B] space-y-1 font-mono">
                  <div>Expected Return: <strong className="text-[#10B981]">{(Number(optResult.risk_parity.expected_return) * 100).toFixed(2)}%</strong></div>
                  <div>Annual Volatility: <strong className="text-[#0F172A]">{(Number(optResult.risk_parity.volatility) * 100).toFixed(2)}%</strong></div>
                  <div>Sharpe Ratio: <strong className="text-[#0F172A] font-bold">{Number(optResult.risk_parity.sharpe_ratio).toFixed(2)}</strong></div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] space-y-1 text-xs">
                  <div className="label-caps text-[#64748B]">Parity Weights:</div>
                  {Object.entries(optResult.risk_parity.weights).map(([s, w]) => (
                    <div key={s} className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#334155]">{s}:</span>
                      <span className="font-bold text-[#0F172A]">{(Number(w) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Rebalance Tool */}
            <div className="p-5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5 font-sans">
                  <SlidersHorizontal className="w-4 h-4 text-[#0284C7]" />
                  Target Portfolio Rebalance & Order Delta Engine
                </h4>
                <button
                  type="button"
                  onClick={handleCalculateRebalance}
                  disabled={rebLoading}
                  className="btn-buy-primary px-3.5 py-1.5 text-xs cursor-pointer active:scale-98"
                >
                  {rebLoading ? 'Calculating...' : 'Generate Rebalance Orders'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                {optSymbols.map((sym) => (
                  <div key={sym} className="p-2.5 bg-white rounded-xl border border-[#E2E8F0]">
                    <label className="block text-[11px] font-bold text-[#334155] font-mono">{sym} Target %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={targetWeights[sym] ?? 0}
                      onChange={(e) =>
                        setTargetWeights({ ...targetWeights, [sym]: Number(e.target.value) })
                      }
                      className="w-full mt-1 px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
                    />
                  </div>
                ))}
              </div>

              {rebalancePlan && (
                <div className="mt-4 border-t border-[#E2E8F0] pt-4 overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead>
                      <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
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
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {rebalancePlan.actions.map((act: any) => (
                        <tr key={act.symbol} className="h-9 hover:bg-white">
                          <td className="py-2 font-bold text-[#0F172A]">{act.symbol}</td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                act.action === 'BUY'
                                  ? 'bg-[#10B981]/10 text-[#047857] border border-[#10B981]/30'
                                  : act.action === 'SELL'
                                  ? 'bg-[#F43F5E]/10 text-[#BE123C] border border-[#F43F5E]/30'
                                  : 'bg-[#F1F5F9] text-[#64748B]'
                              }`}
                            >
                              {act.action}
                            </span>
                          </td>
                          <td className="py-2 text-[#334155]">{Number(act.current_quantity).toFixed(0)}</td>
                          <td className="py-2 text-[#334155]">{Number(act.target_quantity).toFixed(0)}</td>
                          <td className="py-2 font-bold text-[#0F172A]">
                            {Number(act.quantity_delta) > 0 ? `+${Number(act.quantity_delta).toFixed(0)}` : Number(act.quantity_delta).toFixed(0)}
                          </td>
                          <td className="py-2 text-[#334155]">₹{Number(act.estimated_cost).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td className="py-2 text-[#64748B]">{Number(act.current_weight_pct).toFixed(1)}%</td>
                          <td className="py-2 text-right font-bold text-[#10B981]">{Number(act.target_weight_pct).toFixed(1)}%</td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="card-level-2 w-full max-w-md p-6 bg-white border border-[#E2E8F0] rounded-2xl relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A] font-sans">Initialize New Investment Book</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Book Name</label>
                <input
                  type="text"
                  required
                  value={newPortName}
                  onChange={(e) => setNewPortName(e.target.value)}
                  placeholder="e.g. Portfolix Momentum Book"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Initial Capital Allocation (₹)</label>
                <input
                  type="number"
                  required
                  value={newPortCash}
                  onChange={(e) => setNewPortCash(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
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
                  className="btn-buy-primary px-4 py-2 text-xs cursor-pointer active:scale-98"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="card-level-2 w-full max-w-md p-6 bg-white border border-[#E2E8F0] rounded-2xl relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[#0F172A] font-sans">
                {isDeposit ? 'Deposit Simulated Capital' : 'Withdraw Capital'}
              </h3>
              <button
                type="button"
                onClick={() => setShowCashModal(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCashAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
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
                  className="btn-buy-primary px-4 py-2 text-xs cursor-pointer active:scale-98"
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
