import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  TrendingUp,
  Activity,
  BarChart2,
  Layers,
  ArrowRight,
  Sparkles,
  Grid,
} from 'lucide-react';
import { MarketChart } from '../components/MarketChart';
import {
  SymbolData,
  SymbolDetail,
  PricePoint,
  TechnicalIndicators,
  MarketStats,
  CorrelationMatrix,
} from '../types';

interface MarketExplorerProps {
  symbols: SymbolData[];
  selectedSymbol: string;
  onSelectSymbol: (ticker: string) => void;
  symbolDetail: SymbolDetail | null;
  prices: PricePoint[];
  indicators: TechnicalIndicators | null;
  marketStats: MarketStats | null;
  correlationMatrix: CorrelationMatrix | null;
  onNavigateTab: (tab: any) => void;
}

export const MarketExplorer: React.FC<MarketExplorerProps> = ({
  symbols,
  selectedSymbol,
  onSelectSymbol,
  symbolDetail,
  prices,
  indicators,
  marketStats,
  correlationMatrix,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  const sectors = ['ALL', ...Array.from(new Set(symbols.map((s) => s.sector).filter(Boolean)))];

  const filteredSymbols = symbols.filter((s) => {
    const matchesSearch =
      s.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-6">
      {/* Search & Sector Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121826] border border-[#1F2937] rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 20 NSE equities (e.g. RELIANCE, TCS)..."
            className="w-full pl-9 pr-4 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white placeholder-[#6B7280] focus:border-[#3B82F6]"
          />
        </div>

        {/* Sector Pill Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec as string}
              type="button"
              onClick={() => setSelectedSector(sec as string)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition font-mono cursor-pointer ${
                selectedSector === sec
                  ? 'bg-[#1E293B] text-white border border-[#3B82F6]/50 shadow-sm shadow-[#3B82F6]/10'
                  : 'bg-[#0B0F1A] text-[#9CA3AF] hover:text-white border border-[#1F2937]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {filteredSymbols.map((s) => {
          const isSelected = s.ticker === selectedSymbol;
          const isUp = (s.change_pct_1d || 0) >= 0;
          return (
            <button
              key={s.ticker}
              type="button"
              onClick={() => onSelectSymbol(s.ticker)}
              className={`px-3.5 py-2 rounded-xl text-left transition shrink-0 border cursor-pointer ${
                isSelected
                  ? 'bg-[#1E293B] border-[#3B82F6]/60 text-white shadow-md shadow-[#3B82F6]/10'
                  : 'bg-[#121826] border-[#1F2937] hover:border-[#3B82F6]/30 text-[#dde2f6]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 font-mono">
                <span className="font-bold text-xs">{s.ticker}</span>
                <span className={`text-[10px] font-semibold ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {isUp ? '+' : ''}{Number(s.change_pct_1d || 0).toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">
                ₹{Number(s.latest_price || 0).toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Candlestick Interactive Chart */}
      <MarketChart prices={prices} indicators={indicators} ticker={selectedSymbol} />

      {/* Action shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-panel bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9CA3AF] font-sans">
            Execution telemetry for <strong className="text-white font-mono">{selectedSymbol}</strong>:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('trade')}
            className="px-4 py-2 rounded-lg bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F1A] font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#22C55E]/20 transition cursor-pointer active:scale-98"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trade {selectedSymbol}
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('backtest')}
            className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-98"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#3B82F6]" />
            Backtest Strategy
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('forecast')}
            className="px-4 py-2 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            ML Forecast
          </button>
        </div>
      </div>

      {/* Quantitative Statistics & Metrics Deck */}
      {marketStats && (
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 font-sans">
            <Activity className="w-4 h-4 text-[#3B82F6]" />
            Statistical Risk & Factor Profile ({selectedSymbol})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Annualized Return</div>
              <div className={`financial-lg font-bold mt-1 ${marketStats.annualized_return >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {(Number(marketStats.annualized_return) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Annual Volatility</div>
              <div className="financial-lg font-bold text-white mt-1">
                {(Number(marketStats.annualized_volatility) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Sharpe Ratio</div>
              <div className="financial-lg font-bold text-[#adc6ff] mt-1">
                {Number(marketStats.sharpe_ratio).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Sortino Ratio</div>
              <div className="financial-lg font-bold text-[#4ae176] mt-1">
                {Number(marketStats.sortino_ratio).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Beta vs Market</div>
              <div className="financial-lg font-bold text-[#F59E0B] mt-1">
                {Number(marketStats.beta_vs_benchmark).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Max Drawdown</div>
              <div className="financial-lg font-bold text-[#EF4444] mt-1">
                {(Number(marketStats.max_drawdown) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Asset Correlation Heatmap Matrix */}
      {correlationMatrix && correlationMatrix.symbols.length > 0 && (
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <Grid className="w-4 h-4 text-[#3B82F6]" />
                Cross-Asset Correlation Matrix
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">Daily return co-movement across NSE basket</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-xs inline-block"></span> High (+1.0)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                <span className="w-2.5 h-2.5 bg-[#1F2937] rounded-xs inline-block"></span> Zero (0.0)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                <span className="w-2.5 h-2.5 bg-[#EF4444] rounded-xs inline-block"></span> Inverse (-1.0)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-bold text-[#9CA3AF] border-b border-[#1F2937]"></th>
                  {correlationMatrix.symbols.map((sym) => (
                    <th key={sym} className="p-2 text-center font-bold text-[#dde2f6] border-b border-[#1F2937]">
                      {sym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.symbols.map((symRow, rIdx) => (
                  <tr key={symRow} className="hover:bg-[#161F33]/40">
                    <td className="p-2 font-bold text-[#dde2f6] border-r border-[#1F2937]">{symRow}</td>
                    {correlationMatrix.matrix[rIdx].map((val, cIdx) => {
                      let bgColor = 'rgba(18, 24, 38, 0.8)';
                      let textColor = '#9CA3AF';
                      if (val > 0.6) {
                        bgColor = `rgba(34, 197, 94, ${Math.min(0.8, val * 0.7)})`;
                        textColor = '#ffffff';
                      } else if (val > 0.2) {
                        bgColor = `rgba(34, 197, 94, ${val * 0.35})`;
                        textColor = '#dde2f6';
                      } else if (val < -0.2) {
                        bgColor = `rgba(239, 68, 68, ${Math.abs(val) * 0.35})`;
                        textColor = '#dde2f6';
                      }
                      return (
                        <td
                          key={cIdx}
                          style={{ backgroundColor: bgColor, color: textColor }}
                          className="p-2 text-center text-[11px] font-semibold transition border border-[#1F2937]/50"
                        >
                          {Number(val).toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
