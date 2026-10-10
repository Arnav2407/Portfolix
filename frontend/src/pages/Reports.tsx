import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Portfolio } from '../types';

interface ReportsProps {
  portfolio: Portfolio | null;
}

export const Reports: React.FC<ReportsProps> = ({ portfolio }) => {
  const handleDownloadPortfolioCSV = () => {
    if (!portfolio) return;
    window.open(`/api/v1/reports/portfolio/${portfolio.id}/csv`, '_blank');
  };

  const handleDownloadTradesCSV = () => {
    window.open('/api/v1/reports/trades/csv', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/15 border border-[#3B82F6]/30 flex items-center justify-center text-[#3B82F6]">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                Institutional Reports & Audit Exports
              </h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
                RFC 4180
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
              Download audit-ready CSV ledgers, cost-basis calculations, and comprehensive blotter confirmations
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Valuation & P&L Report */}
        <div className="glass-panel p-5 flex flex-col justify-between bg-[#121826] border border-[#1F2937] rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <Wallet className="w-4 h-4 text-[#22C55E]" />
                Portfolio Holdings & Valuation Statement
              </h3>
              <span className="label-caps px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] font-bold">
                CSV EXPORT
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-4 leading-relaxed font-sans">
              Generates an institutional snapshot of all current equity holdings, weighted average buy prices, invested capital, mark-to-market valuations, and cash reserves.
            </p>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] space-y-1 font-mono">
              <div>Target: <strong className="text-white">{portfolio?.name || 'Main Portfolio'}</strong></div>
              <div>Equity: <strong className="text-[#22C55E]">₹{Number(portfolio?.total_equity || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPortfolioCSV}
            className="mt-6 w-full py-2.5 bg-[#22C55E] hover:bg-[#16a34a] text-[#0B0F1A] font-extrabold text-xs rounded-lg shadow-md shadow-[#22C55E]/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Download Portfolio CSV
          </button>
        </div>

        {/* Trade Execution Ledger */}
        <div className="glass-panel p-5 flex flex-col justify-between bg-[#121826] border border-[#1F2937] rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <FileText className="w-4 h-4 text-[#3B82F6]" />
                Trade Blotter & Transaction Ledger
              </h3>
              <span className="label-caps px-2 py-0.5 rounded bg-[#3B82F6]/15 text-[#adc6ff] font-bold">
                CSV EXPORT
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-4 leading-relaxed font-sans">
              Complete trade ledger including order IDs, fill timestamps, executed prices, brokerage commissions, estimated slippage metrics, and realized profit/loss calculations.
            </p>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] text-xs text-[#9CA3AF] space-y-1 font-mono">
              <div>Format: <strong className="text-white">Standard CSV (RFC 4180)</strong></div>
              <div>Ledger: <strong className="text-[#adc6ff]">All simulated executions</strong></div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTradesCSV}
            className="mt-6 w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs rounded-lg shadow-md shadow-[#3B82F6]/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Download Trade Blotter CSV
          </button>
        </div>
      </div>
    </div>
  );
};
