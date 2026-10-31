import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Wallet,
} from 'lucide-react';
import { Portfolio } from '../types';
import { API_BASE_URL } from '../api/client';

interface ReportsProps {
  portfolio: Portfolio | null;
}

export const Reports: React.FC<ReportsProps> = ({ portfolio }) => {
  const handleDownloadPortfolioCSV = () => {
    if (!portfolio) return;
    window.open(`${API_BASE_URL}/reports/portfolio/${portfolio.id}/csv`, '_blank');
  };

  const handleDownloadTradesCSV = () => {
    window.open(`${API_BASE_URL}/reports/trades/csv`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 sm:p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15 border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#0F172A] tracking-tight font-sans">
                PORTFOLIX INSTITUTIONAL REPORTS & AUDIT BLOTTER
              </h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                RFC 4180
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">
              Download audit-ready CSV ledgers, cost-basis calculations, and comprehensive trade blotter confirmations
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] p-1.5 rounded-xl shrink-0">
          <img
            src="/images/audit-ledger.jpg"
            alt="Institutional Audit Ledger"
            className="w-32 h-16 object-cover rounded-lg border border-[#E2E8F0]"
          />
          <div className="pr-3 font-mono">
            <div className="text-[11px] font-bold text-[#0F172A]">SEBI & IFRS Compatible</div>
            <div className="text-[10px] text-[#059669] flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Deterministic Ledger Verified
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Valuation & P&L Report */}
        <div className="glass-panel p-5 flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
                <Wallet className="w-4 h-4 text-[#10B981]" />
                Portfolio Holdings & Valuation Statement
              </h3>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30 font-bold text-[9px]">
                CSV EXPORT
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-4 leading-relaxed font-sans">
              Generates an institutional snapshot of all current equity holdings, weighted average buy prices, invested capital, mark-to-market valuations, and cash reserves.
            </p>
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1 font-mono">
              <div>Target Book: <strong className="text-[#0F172A]">{portfolio?.name || 'Alpha Portfolio'}</strong></div>
              <div>Net Equity: <strong className="text-[#10B981]">₹{Number(portfolio?.total_equity || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</strong></div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadPortfolioCSV}
            className="mt-6 w-full btn-buy-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Download Portfolio CSV
          </button>
        </div>

        {/* Trade Execution Ledger */}
        <div className="glass-panel p-5 flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
                <FileText className="w-4 h-4 text-[#0284C7]" />
                Trade Blotter & Transaction Ledger
              </h3>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD] font-bold text-[9px]">
                CSV EXPORT
              </span>
            </div>
            <p className="text-xs text-[#64748B] mb-4 leading-relaxed font-sans">
              Complete trade ledger including order IDs, fill timestamps, executed prices, brokerage commissions, estimated slippage metrics, and realized profit/loss calculations.
            </p>
            <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#64748B] space-y-1 font-mono">
              <div>Format: <strong className="text-[#0F172A]">Standard CSV (RFC 4180)</strong></div>
              <div>Ledger: <strong className="text-[#0284C7]">All simulated executions</strong></div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadTradesCSV}
            className="mt-6 w-full btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4" />
            Download Blotter CSV
          </button>
        </div>
      </div>
    </div>
  );
};
