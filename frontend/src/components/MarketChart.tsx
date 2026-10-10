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
import { Layers, Activity } from 'lucide-react';

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
        background: { type: ColorType.Solid, color: '#0B0F1A' },
        textColor: '#9CA3AF',
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: '#1F2937' },
        horzLines: { color: '#1F2937' },
      },
      crosshair: {
        vertLine: { color: '#3B82F6', width: 1, style: 3 },
        horzLine: { color: '#3B82F6', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: '#1F2937',
      },
      timeScale: {
        borderColor: '#1F2937',
        timeVisible: true,
      },
      height: 480,
    });

    chartRef.current = chart;

    // 1. Candlestick series (QuantEdge Trading Green & Crimson)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444',
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
      color: '#3B82F6',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // overlay
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const volumeData = prices.map((p) => ({
      time: p.date as any,
      value: p.volume,
      color: p.close >= p.open ? 'rgba(34, 197, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)',
    }));
    volumeSeries.setData(volumeData);

    // 3. Technical Indicator Overlays
    if (indicators?.indicators) {
      const inds = indicators.indicators;

      // SMA 20
      if (showSMA20 && inds.sma) {
        const sma20Series = chart.addSeries(LineSeries, { color: '#F59E0B', lineWidth: 1, title: 'SMA 20' });
        const data = inds.sma
          .filter((item) => item.sma20 !== undefined && item.sma20 !== null)
          .map((item) => ({ time: item.date as any, value: item.sma20! }));
        sma20Series.setData(data);
      }

      // SMA 50
      if (showSMA50 && inds.sma) {
        const sma50Series = chart.addSeries(LineSeries, { color: '#3B82F6', lineWidth: 2, title: 'SMA 50' });
        const data = inds.sma
          .filter((item) => item.sma50 !== undefined && item.sma50 !== null)
          .map((item) => ({ time: item.date as any, value: item.sma50! }));
        sma50Series.setData(data);
      }

      // SMA 200
      if (showSMA200 && inds.sma) {
        const sma200Series = chart.addSeries(LineSeries, { color: '#A855F7', lineWidth: 2, title: 'SMA 200' });
        const data = inds.sma
          .filter((item) => item.sma200 !== undefined && item.sma200 !== null)
          .map((item) => ({ time: item.date as any, value: item.sma200! }));
        sma200Series.setData(data);
      }

      // Bollinger Bands
      if (showBollinger && inds.bollinger) {
        const upperSeries = chart.addSeries(LineSeries, { color: '#06B6D4', lineWidth: 1, lineStyle: 2, title: 'BB Upper' });
        const lowerSeries = chart.addSeries(LineSeries, { color: '#06B6D4', lineWidth: 1, lineStyle: 2, title: 'BB Lower' });
        const midSeries = chart.addSeries(LineSeries, { color: '#0891B2', lineWidth: 1, lineStyle: 3, title: 'BB Mid' });

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

      // VWAP
      if (showVWAP && inds.vwap) {
        const vwapSeries = chart.addSeries(LineSeries, { color: '#EA580C', lineWidth: 2, title: 'VWAP' });
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
    <div className="glass-panel p-5 flex flex-col bg-[#121826] border border-[#1F2937] rounded-xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight font-sans">{ticker}</h2>
              <span className="label-caps px-2 py-0.5 rounded bg-[#1F2937] text-[#9CA3AF]">
                NSE EQUITY
              </span>
            </div>
            {latestPrice && (
              <div className="flex items-center gap-2 mt-1">
                <span className="financial-xl text-white">
                  ₹{latestPrice.close.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full font-mono ${
                    change1d >= 0 ? 'text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20' : 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20'
                  }`}
                >
                  {change1d >= 0 ? '+' : ''}
                  {change1d.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Indicator Toggles as QuantEdge Pill Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#9CA3AF] flex items-center gap-1 label-caps mr-1">
            <Layers className="w-3.5 h-3.5 text-[#3B82F6]" /> Overlays:
          </span>
          <button
            type="button"
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showSMA20
                ? 'bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B] font-semibold'
                : 'bg-[#0B0F1A] border border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            SMA 20
          </button>
          <button
            type="button"
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showSMA50
                ? 'bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-[#3B82F6] font-semibold'
                : 'bg-[#0B0F1A] border border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            SMA 50
          </button>
          <button
            type="button"
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showSMA200
                ? 'bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] font-semibold'
                : 'bg-[#0B0F1A] border border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            SMA 200
          </button>
          <button
            type="button"
            onClick={() => setShowBollinger(!showBollinger)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showBollinger
                ? 'bg-[#06B6D4]/15 border border-[#06B6D4]/40 text-[#06B6D4] font-semibold'
                : 'bg-[#0B0F1A] border border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            Bollinger
          </button>
          <button
            type="button"
            onClick={() => setShowVWAP(!showVWAP)}
            className={`px-2.5 py-1 rounded-full text-xs font-mono transition cursor-pointer ${
              showVWAP
                ? 'bg-[#EA580C]/15 border border-[#EA580C]/40 text-[#EA580C] font-semibold'
                : 'bg-[#0B0F1A] border border-[#1F2937] text-[#9CA3AF] hover:text-white'
            }`}
          >
            VWAP
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full rounded-lg overflow-hidden border border-[#1F2937] min-h-[480px]" />
    </div>
  );
};
