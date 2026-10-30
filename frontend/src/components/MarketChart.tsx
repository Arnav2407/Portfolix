import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';
import { PricePoint, TechnicalIndicators } from '../types';
import { Layers } from 'lucide-react';

interface MarketChartProps {
  prices: PricePoint[];
  indicators?: TechnicalIndicators | null;
  ticker: string;
}

export const MarketChart: React.FC<MarketChartProps> = ({ prices, indicators, ticker }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Indicator toggle states
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVWAP, setShowVWAP] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current || !prices || prices.length === 0) return;

    // Clean up previous chart instance
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#FFFFFF' },
        textColor: '#64748B',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: '#F1F5F9' },
        horzLines: { color: '#F1F5F9' },
      },
      crosshair: {
        vertLine: { color: '#0284C7', width: 1, style: 3 },
        horzLine: { color: '#0284C7', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: '#E2E8F0',
      },
      timeScale: {
        borderColor: '#E2E8F0',
        timeVisible: true,
      },
      height: 480,
    });

    chartRef.current = chart;

    // 1. Candlestick series (Bright Emerald & Rose)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#F43F5E',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#F43F5E',
    });

    const candleData = prices.map((p) => ({
      time: p.date as any,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    }));
    candlestickSeries.setData(candleData);

    // 2. Volume series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#0284C7',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const volumeData = prices.map((p) => ({
      time: p.date as any,
      value: p.volume,
      color: p.close >= p.open ? 'rgba(16, 185, 129, 0.45)' : 'rgba(244, 63, 94, 0.45)',
    }));
    volumeSeries.setData(volumeData);

    // 3. Technical Indicator Overlays
    if (indicators?.indicators) {
      const inds = indicators.indicators;

      // SMA 20 (Sky Blue)
      if (showSMA20 && inds.sma) {
        const sma20Series = chart.addSeries(LineSeries, { color: '#0284C7', lineWidth: 2, title: 'SMA 20' });
        const data = inds.sma
          .filter((item) => item.sma20 !== undefined && item.sma20 !== null)
          .map((item) => ({ time: item.date as any, value: item.sma20! }));
        sma20Series.setData(data);
      }

      // SMA 50 (Purple)
      if (showSMA50 && inds.sma) {
        const sma50Series = chart.addSeries(LineSeries, { color: '#8B5CF6', lineWidth: 2, title: 'SMA 50' });
        const data = inds.sma
          .filter((item) => item.sma50 !== undefined && item.sma50 !== null)
          .map((item) => ({ time: item.date as any, value: item.sma50! }));
        sma50Series.setData(data);
      }

      // SMA 200 (Amber)
      if (showSMA200 && inds.sma) {
        const sma200Series = chart.addSeries(LineSeries, { color: '#D97706', lineWidth: 2, title: 'SMA 200' });
        const data = inds.sma
          .filter((item) => item.sma200 !== undefined && item.sma200 !== null)
          .map((item) => ({ time: item.date as any, value: item.sma200! }));
        sma200Series.setData(data);
      }

      // Bollinger Bands
      if (showBollinger && inds.bollinger) {
        const upperSeries = chart.addSeries(LineSeries, { color: '#0EA5E9', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
        const lowerSeries = chart.addSeries(LineSeries, { color: '#0EA5E9', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });
        const midSeries = chart.addSeries(LineSeries, { color: '#0284C7', lineWidth: 1, lineStyle: 3, title: 'BB Mid' });

        upperSeries.setData(
          inds.bollinger.filter((b) => b.upper != null).map((b) => ({ time: b.date as any, value: b.upper! }))
        );
        lowerSeries.setData(
          inds.bollinger.filter((b) => b.lower != null).map((b) => ({ time: b.date as any, value: b.lower! }))
        );
        midSeries.setData(
          inds.bollinger.filter((b) => b.middle != null).map((b) => ({ time: b.date as any, value: b.middle! }))
        );
      }

      // VWAP (Emerald)
      if (showVWAP && inds.vwap) {
        const vwapSeries = chart.addSeries(LineSeries, { color: '#10B981', lineWidth: 2, title: 'VWAP' });
        const data = inds.vwap
          .filter((item) => item.value != null)
          .map((item) => ({ time: item.date as any, value: item.value! }));
        vwapSeries.setData(data);
      }
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [prices, indicators, showSMA20, showSMA50, showSMA200, showBollinger, showVWAP]);

  const latestPrice = prices && prices.length > 0 ? prices[prices.length - 1] : null;
  const prevPrice = prices && prices.length > 1 ? prices[prices.length - 2] : null;
  const change1d =
    latestPrice && prevPrice ? ((latestPrice.close - prevPrice.close) / prevPrice.close) * 100 : 0;

  return (
    <div className="glass-panel p-5 flex flex-col bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl shadow-xs">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight font-sans">{ticker}</h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                NSE REAL-TIME
              </span>
            </div>
            {latestPrice && (
              <div className="flex items-center gap-2.5 mt-1">
                <span className="financial-xl text-[#0F172A]">
                  ₹{latestPrice.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-0.5 ${
                    change1d >= 0
                      ? 'text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0]'
                      : 'text-[#E11D48] bg-[#FFF1F2] border border-[#FECDD3]'
                  }`}
                >
                  {change1d >= 0 ? '+' : ''}
                  {change1d.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Indicator Toggles as Bright Pill Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#64748B] flex items-center gap-1 label-caps mr-1 font-bold">
            <Layers className="w-3.5 h-3.5 text-[#0284C7]" /> Overlays:
          </span>
          <button
            type="button"
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showSMA20
                ? 'bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] font-bold shadow-xs'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            SMA 20
          </button>
          <button
            type="button"
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showSMA50
                ? 'bg-[#EDE9FE] border border-[#DDD6FE] text-[#7C3AED] font-bold shadow-xs'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            SMA 50
          </button>
          <button
            type="button"
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showSMA200
                ? 'bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] font-bold shadow-xs'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            SMA 200
          </button>
          <button
            type="button"
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showBollinger
                ? 'bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] font-bold shadow-xs'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Bollinger
          </button>
          <button
            type="button"
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-3 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showVWAP
                ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] font-bold shadow-xs'
                : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            VWAP
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full rounded-xl overflow-hidden border border-[#E2E8F0] min-h-[480px] bg-white" />
    </div>
  );
};
