import React, { useState } from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  BarChart2,
  RefreshCw,
  Gauge,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../api/client';
import { SymbolData, ForecastResponse } from '../types';

interface ForecastStudioProps {
  symbols: SymbolData[];
  selectedSymbol: string;
  onSelectSymbol: (ticker: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const ForecastStudio: React.FC<ForecastStudioProps> = ({
  symbols,
  selectedSymbol,
  onSelectSymbol,
  onNavigateTab: _onNavigateTab,
}) => {
  const [modelType, setModelType] = useState<string>('GRADIENT_BOOSTING');
  const [horizonDays, setHorizonDays] = useState<number>(30);
  const [lookbackYears, setLookbackYears] = useState<number>(3);

  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);

  const handleGenerateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<ForecastResponse>('/forecasts/generate', {
        symbol: selectedSymbol,
        model_type: modelType,
        forecast_days: horizonDays,
        lookback_years: lookbackYears,
      });
      setForecast(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Forecast generation failed');
    } finally {
      setLoading(false);
    }
  };

  const getSignalBadgeColor = (sig: string) => {
    switch (sig) {
      case 'STRONG_BUY':
        return 'bg-[#10B981]/15 text-[#047857] border-[#10B981]/30 shadow-xs';
      case 'BUY':
        return 'bg-[#10B981]/10 text-[#047857] border-[#10B981]/20';
      case 'STRONG_SELL':
        return 'bg-[#F43F5E]/15 text-[#BE123C] border-[#F43F5E]/30 shadow-xs';
      case 'SELL':
        return 'bg-[#F43F5E]/10 text-[#BE123C] border-[#F43F5E]/20';
      default:
        return 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header with AI Neural Graphic */}
      <div className="glass-panel p-5 sm:p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-5 pb-5 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15 border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs shrink-0">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#0F172A] tracking-tight font-sans">
                  PORTFOLIX AI ALPHA FORECASTING
                </h2>
                <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                  TEMPORAL OOS
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                Predictive gradient boosting and statistical regression partitioned strictly by temporal train/test splits
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-1.5 rounded-xl">
            <img
              src="/images/ai-forecast.jpg"
              alt="AI Neural Forecasting"
              className="w-28 h-14 object-cover rounded-lg border border-[#E2E8F0]"
            />
            <div className="pr-3 font-mono">
              <div className="text-[11px] font-bold text-[#0F172A]">Neural Engine v2.4</div>
              <div className="text-[10px] text-[#059669] flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                Trained on 83k Bars
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerateForecast} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                  {s.ticker} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">Predictive Model</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
            >
              <option value="GRADIENT_BOOSTING">Gradient Boosting Trees (GBRT)</option>
              <option value="RIDGE">Ridge Regressor (L2 + Momentum Lags)</option>
              <option value="ARIMA">ARIMA(2,1,1) Autoregressive Engine</option>
              <option value="EXPONENTIAL_SMOOTHING">Holt-Winters Smoothing</option>
            </select>
          </div>

          {/* Forecast Horizon Slider */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">
              Horizon: <strong className="text-[#0F172A] font-mono">{horizonDays} Days</strong>
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
              className="w-full mt-1.5 accent-[#0284C7]"
            />
          </div>

          {/* Lookback Years */}
          <div>
            <label className="block text-[11px] font-semibold text-[#475569] mb-1 font-sans">
              Lookback: <strong className="text-[#0F172A] font-mono">{lookbackYears} Years</strong>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={lookbackYears}
              onChange={(e) => setLookbackYears(Number(e.target.value))}
              className="w-full mt-1.5 accent-[#0284C7]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Projecting...' : 'Generate Forecast'}
            </button>
          </div>
        </form>
      </div>

      {/* Forecast Output Views */}
      {forecast && (
        <div className="space-y-6">
          {/* Signal & Model Validation Deck */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quantitative Algorithmic Signal Card */}
            <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="label-caps text-[#64748B]">Algorithmic Signal</span>
                  <span className="financial-sm text-[#0284C7] font-bold">
                    Target: ₹{Number(forecast.predicted_target_price).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold font-mono tracking-wider ${getSignalBadgeColor(
                      forecast.signal.signal_type
                    )}`}
                  >
                    {forecast.signal.signal_type.replace('_', ' ')}
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-[#64748B]">Exp. Alpha: </span>
                    <strong
                      className={`text-sm ${
                        forecast.projected_return_pct >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'
                      }`}
                    >
                      {forecast.projected_return_pct >= 0 ? '+' : ''}
                      {Number(forecast.projected_return_pct).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] font-sans">
                  {forecast.signal.summary_reasoning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[#64748B]">Confidence: </span>
                  <strong className="text-[#0284C7] font-bold">{forecast.signal.confidence_score}%</strong>
                </div>
                <div>
                  <span className="text-[#64748B]">Momentum: </span>
                  <strong className="text-[#0F172A] font-bold">{forecast.signal.momentum_score}/100</strong>
                </div>
              </div>
            </div>

            {/* Model Validation Metrics Deck */}
            <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl lg:col-span-2 shadow-sm">
              <h3 className="label-caps text-[#64748B] mb-3 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#0284C7]" />
                Holdout Validation Metrics ({forecast.model_type})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="label-caps text-[#64748B]">Directional Accuracy</div>
                  <div className="financial-lg font-bold text-[#10B981] mt-1">
                    {Number(forecast.metrics.directional_accuracy_pct).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Hit rate</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="label-caps text-[#64748B]">RMSE Error</div>
                  <div className="financial-lg font-bold text-[#0F172A] mt-1">
                    ₹{Number(forecast.metrics.rmse).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Root Mean Sq</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="label-caps text-[#64748B]">MAE Error</div>
                  <div className="financial-lg font-bold text-[#0F172A] mt-1">
                    ₹{Number(forecast.metrics.mae).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Mean Abs Error</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="label-caps text-[#64748B]">MAPE Error</div>
                  <div className="financial-lg font-bold text-[#0EA5E9] mt-1">
                    {Number(forecast.metrics.mape).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Mean % Error</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="label-caps text-[#64748B]">R-Squared (R²)</div>
                  <div className="financial-lg font-bold text-[#0284C7] mt-1">
                    {Number(forecast.metrics.r_squared).toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Variance fit</div>
                </div>

                <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                  <div className="label-caps text-[#64748B]">Test Samples</div>
                  <div className="financial-lg font-bold text-[#334155] mt-1">
                    {forecast.metrics.test_samples_count}
                  </div>
                  <div className="text-[10px] text-[#64748B] mt-0.5">Holdout period</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Projected Path & 95% Confidence Band Chart */}
          <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
                  <BarChart2 className="w-4 h-4 text-[#0284C7]" />
                  Price Trajectory & 95% Confidence Cone ({forecast.symbol})
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5 font-sans">
                  Historical actuals through {forecast.train_end_date} • Projected path to {forecast.forecast_end_date}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-[#334155]">
                  <span className="w-3 h-0.5 bg-[#10B981] inline-block"></span> Actual
                </span>
                <span className="flex items-center gap-1 text-[#0284C7]">
                  <span className="w-3 h-0.5 bg-[#0284C7] inline-block"></span> Projected Path
                </span>
                <span className="flex items-center gap-1 text-[#64748B]">
                  <span className="w-3 h-2 bg-[#0284C7]/20 inline-block rounded-xs"></span> 95% Band
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.series}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} fontFamily="'JetBrains Mono', monospace" />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    fontFamily="'JetBrains Mono', monospace"
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `₹${val.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#BAE6FD', borderRadius: '12px', fontSize: '12px', color: '#0F172A', fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, '']}
                  />
                  {/* Actual price line */}
                  <Line type="monotone" dataKey="actual" name="Historical Close" stroke="#10B981" strokeWidth={2} dot={false} />
                  {/* Projected target path */}
                  <Line type="monotone" dataKey="predicted" name="Predicted Horizon" stroke="#0284C7" strokeWidth={2.5} strokeDasharray="4 2" dot={false} />
                  {/* 95% Upper bound */}
                  <Line type="monotone" dataKey="upper_bound" name="95% Upper Bound" stroke="#0EA5E9" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                  {/* 95% Lower bound */}
                  <Line type="monotone" dataKey="lower_bound" name="95% Lower Bound" stroke="#0EA5E9" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Disclaimer Box */}
            <div className="mt-4 p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#64748B] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0" />
              <span>{forecast.disclaimer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
