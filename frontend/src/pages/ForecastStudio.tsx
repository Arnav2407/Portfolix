import React, { useState } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Activity,
  BarChart2,
  Layers,
  ArrowRight,
  RefreshCw,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Area,
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
  onNavigateTab,
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
        return 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/40';
      case 'BUY':
        return 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/25';
      case 'STRONG_SELL':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40';
      case 'SELL':
        return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/25';
      default:
        return 'bg-[#1F2937] text-[#9CA3AF] border-[#374151]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                  Quantitative Machine Learning Forecasts & Signals
                </h2>
                <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
                  OOS SPLIT
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
                Predictive regression and ARIMA statistical models strictly partitioned by temporal train/test splits
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerateForecast} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                  {s.ticker} ({s.name})
                </option>
              ))}
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">Predictive Model</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white focus:border-[#3B82F6]"
            >
              <option value="GRADIENT_BOOSTING">Gradient Boosting Trees (GBRT)</option>
              <option value="RIDGE">Ridge Regressor (L2 + Momentum Lags)</option>
              <option value="ARIMA">ARIMA(2,1,1) Autoregressive Engine</option>
              <option value="EXPONENTIAL_SMOOTHING">Holt-Winters Smoothing</option>
            </select>
          </div>

          {/* Forecast Horizon Slider */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">
              Horizon: <strong className="text-white font-mono">{horizonDays} Days</strong>
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={horizonDays}
              onChange={(e) => setHorizonDays(Number(e.target.value))}
              className="w-full mt-1.5 accent-[#3B82F6]"
            />
          </div>

          {/* Lookback Years */}
          <div>
            <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1 font-sans">
              History: <strong className="text-white font-mono">{lookbackYears} Years</strong>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={lookbackYears}
              onChange={(e) => setLookbackYears(Number(e.target.value))}
              className="w-full mt-1.5 accent-[#3B82F6]"
            />
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs rounded-lg shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 active:scale-98"
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
            <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="label-caps text-[#9CA3AF]">Algorithmic Signal</span>
                  <span className="financial-sm text-[#adc6ff]">
                    Target: ₹{Number(forecast.predicted_target_price).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold font-mono tracking-wider ${getSignalBadgeColor(
                      forecast.signal.signal_type
                    )}`}
                  >
                    {forecast.signal.signal_type.replace('_', ' ')}
                  </div>
                  <div className="font-mono text-xs">
                    <span className="text-[#9CA3AF]">Exp. Return: </span>
                    <strong
                      className={`text-sm ${
                        forecast.projected_return_pct >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
                      }`}
                    >
                      {forecast.projected_return_pct >= 0 ? '+' : ''}
                      {Number(forecast.projected_return_pct).toFixed(2)}%
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-[#dde2f6] leading-relaxed bg-[#0B0F1A] p-3 rounded-lg border border-[#1F2937] font-sans">
                  {forecast.signal.summary_reasoning}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1F2937] flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[#9CA3AF]">Confidence: </span>
                  <strong className="text-[#adc6ff]">{forecast.signal.confidence_score}%</strong>
                </div>
                <div>
                  <span className="text-[#9CA3AF]">Momentum Rating: </span>
                  <strong className="text-white">{forecast.signal.momentum_score}/100</strong>
                </div>
              </div>
            </div>

            {/* Model Validation Metrics Deck */}
            <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl lg:col-span-2">
              <h3 className="label-caps text-[#9CA3AF] mb-3 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#3B82F6]" />
                Holdout Validation Metrics ({forecast.model_type})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                  <div className="label-caps text-[#9CA3AF]">Directional Accuracy</div>
                  <div className="financial-lg font-bold text-[#22C55E] mt-1">
                    {Number(forecast.metrics.directional_accuracy_pct).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Hit rate</div>
                </div>

                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                  <div className="label-caps text-[#9CA3AF]">RMSE Error</div>
                  <div className="financial-lg font-bold text-white mt-1">
                    ₹{Number(forecast.metrics.rmse).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Root Mean Sq</div>
                </div>

                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                  <div className="label-caps text-[#9CA3AF]">MAE Error</div>
                  <div className="financial-lg font-bold text-white mt-1">
                    ₹{Number(forecast.metrics.mae).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Mean Abs Error</div>
                </div>

                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                  <div className="label-caps text-[#9CA3AF]">MAPE Error</div>
                  <div className="financial-lg font-bold text-[#4ae176] mt-1">
                    {Number(forecast.metrics.mape).toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Mean % Error</div>
                </div>

                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                  <div className="label-caps text-[#9CA3AF]">R-Squared (R²)</div>
                  <div className="financial-lg font-bold text-[#adc6ff] mt-1">
                    {Number(forecast.metrics.r_squared).toFixed(3)}
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Variance fit</div>
                </div>

                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                  <div className="label-caps text-[#9CA3AF]">Test Sample Bars</div>
                  <div className="financial-lg font-bold text-[#dde2f6] mt-1">
                    {forecast.metrics.test_samples_count}
                  </div>
                  <div className="text-[10px] text-[#6B7280] mt-0.5">Holdout period</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Projected Path & 95% Confidence Band Chart */}
          <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                  <BarChart2 className="w-4 h-4 text-[#3B82F6]" />
                  Price Trajectory & 95% Statistical Confidence Band ({forecast.symbol})
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
                  Historical actuals through {forecast.train_end_date} • Projected path to {forecast.forecast_end_date}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1 text-[#dde2f6]">
                  <span className="w-3 h-0.5 bg-[#22C55E] inline-block"></span> Actual
                </span>
                <span className="flex items-center gap-1 text-[#adc6ff]">
                  <span className="w-3 h-0.5 bg-[#3B82F6] inline-block"></span> Projected Path
                </span>
                <span className="flex items-center gap-1 text-[#9CA3AF]">
                  <span className="w-3 h-2 bg-[#3B82F6]/20 inline-block rounded-xs"></span> 95% Band
                </span>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecast.series}>
                  <XAxis dataKey="date" stroke="#4B5563" fontSize={10} tickLine={false} fontFamily="'JetBrains Mono', monospace" />
                  <YAxis
                    stroke="#4B5563"
                    fontSize={10}
                    tickLine={false}
                    fontFamily="'JetBrains Mono', monospace"
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `₹${val.toFixed(0)}`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#161F33', borderColor: '#374151', borderRadius: '8px', fontSize: '12px', color: '#dde2f6', fontFamily: "'JetBrains Mono', monospace" }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, '']}
                  />
                  {/* Actual price line */}
                  <Line type="monotone" dataKey="actual" name="Historical Close" stroke="#22C55E" strokeWidth={2} dot={false} />
                  {/* Projected target path */}
                  <Line type="monotone" dataKey="predicted" name="Predicted Horizon" stroke="#3B82F6" strokeWidth={2.5} strokeDasharray="4 2" dot={false} />
                  {/* 95% Upper bound */}
                  <Line type="monotone" dataKey="upper_bound" name="95% Upper Bound" stroke="#adc6ff" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                  {/* 95% Lower bound */}
                  <Line type="monotone" dataKey="lower_bound" name="95% Lower Bound" stroke="#adc6ff" strokeWidth={1} strokeDasharray="2 2" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Disclaimer Box */}
            <div className="mt-4 p-3 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-[#9CA3AF] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>{forecast.disclaimer}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
