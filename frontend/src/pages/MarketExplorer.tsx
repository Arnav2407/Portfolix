import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  Activity,
  BarChart2,
  Sparkles,
  Grid,
} from 'lucide-react';
import { MarketChart } from '../components/MarketChart';
import { StockLogo } from '../components/StockLogo';
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
  symbolDetail: _symbolDetail,
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
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#0284C7] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search equities (e.g. RELIANCE, TCS)..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0284C7]"
          />
        </div>

        {/* Sector Pill Chips */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {sectors.map((sec) => (
            <button
              key={sec as string}
              type="button"
              onClick={() => setSelectedSector(sec as string)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition font-mono cursor-pointer ${
                selectedSector === sec
                  ? 'bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] hover:text-[#0F172A] border border-[#E2E8F0]'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Selection Pills */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {filteredSymbols.map((s) => {
          const isSelected = s.ticker === selectedSymbol;
          const isUp = (s.change_pct_1d || 0) >= 0;
          return (
            <button
              key={s.ticker}
              type="button"
              onClick={() => onSelectSymbol(s.ticker)}
              className={`px-3 py-2 rounded-xl text-left transition shrink-0 border cursor-pointer flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-[#E0F2FE] border-[#0284C7] text-[#0F172A] shadow-xs'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#CBD5E1] text-[#334155]'
              }`}
            >
              <StockLogo ticker={s.ticker} size="sm" />
              <div>
                <div className="flex items-center justify-between gap-2.5 font-mono">
                  <span className="font-bold text-xs">{s.ticker}</span>
                  <span className={`text-[10px] font-bold ${isUp ? 'text-[#059669]' : 'text-[#E11D48]'}`}>
                    {isUp ? '+' : ''}{Number(s.change_pct_1d || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                  ₹{Number(s.latest_price || 0).toFixed(2)}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Candlestick Interactive Chart */}
      <MarketChart prices={prices} indicators={indicators} ticker={selectedSymbol} />

      {/* Action shortcuts */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 glass-panel bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B] font-sans">
            Direct execution for <strong className="text-[#0F172A] font-mono">{selectedSymbol}</strong>:
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigateTab('trade')}
            className="btn-buy-primary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer active:scale-98 shadow-xs"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Trade {selectedSymbol}
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('backtest')}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer active:scale-98 font-semibold"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#0284C7]" />
            Backtest Strategy
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('forecast')}
            className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer active:scale-98 font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            ML Forecast
          </button>
        </div>
      </div>

      {/* Quantitative Statistics & Metrics Deck */}
      {marketStats && (
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4 font-sans">
            <Activity className="w-4 h-4 text-[#0284C7]" />
            Statistical Risk & Quantitative Profile ({selectedSymbol})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Annualized Return</div>
              <div className={`financial-lg font-bold mt-1 ${marketStats.annualized_return >= 0 ? 'text-[#059669]' : 'text-[#E11D48]'}`}>
                {(Number(marketStats.annualized_return) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Annual Volatility</div>
              <div className="financial-lg font-bold text-[#0F172A] mt-1">
                {(Number(marketStats.annualized_volatility) * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Sharpe Ratio</div>
              <div className="financial-lg font-bold text-[#0284C7] mt-1">
                {Number(marketStats.sharpe_ratio).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Sortino Ratio</div>
              <div className="financial-lg font-bold text-[#059669] mt-1">
                {Number(marketStats.sortino_ratio).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Beta vs Market</div>
              <div className="financial-lg font-bold text-[#D97706] mt-1">
                {Number(marketStats.beta_vs_benchmark).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Max Drawdown</div>
              <div className="financial-lg font-bold text-[#E11D48] mt-1">
                {(Number(marketStats.max_drawdown) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Asset Correlation Heatmap Matrix */}
      {correlationMatrix && correlationMatrix.symbols.length > 0 && (
        <div className="glass-panel p-5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
                <Grid className="w-4 h-4 text-[#0284C7]" />
                Cross-Asset Correlation Heatmap Matrix
              </h3>
              <p className="text-xs text-[#64748B] mt-0.5 font-sans">Daily return co-movement across NSE universe</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-[11px] text-[#475569]">
                <span className="w-2.5 h-2.5 bg-[#10B981] rounded-xs inline-block"></span> High (+1.0)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#475569]">
                <span className="w-2.5 h-2.5 bg-[#E2E8F0] rounded-xs inline-block"></span> Neutral (0.0)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#475569]">
                <span className="w-2.5 h-2.5 bg-[#F43F5E] rounded-xs inline-block"></span> Inverse (-1.0)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr>
                  <th className="p-2.5 text-left font-bold text-[#64748B] border-b border-[#E2E8F0]"></th>
                  {correlationMatrix.symbols.map((sym) => (
                    <th key={sym} className="p-2.5 text-center font-bold text-[#0F172A] border-b border-[#E2E8F0]">
                      {sym}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.symbols.map((symRow, rIdx) => (
                  <tr key={symRow} className="hover:bg-[#F8FAFC]">
                    <td className="p-2.5 font-bold text-[#0F172A] border-r border-[#E2E8F0]">{symRow}</td>
                    {correlationMatrix.matrix[rIdx].map((val, cIdx) => {
                      let bgColor = '#F8FAFC';
                      let textColor = '#475569';
                      if (val > 0.6) {
                        bgColor = '#DCFCE7';
                        textColor = '#166534';
                      } else if (val > 0.2) {
                        bgColor = '#F0FDF4';
                        textColor = '#15803D';
                      } else if (val < -0.2) {
                        bgColor = '#FFE4E6';
                        textColor = '#BE123C';
                      }
                      return (
                        <td
                          key={cIdx}
                          style={{ backgroundColor: bgColor, color: textColor }}
                          className="p-2.5 text-center text-[11px] font-bold transition border border-[#E2E8F0]"
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
