import React, { useState } from 'react';
import { X, Cpu } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Educational Disclaimer" className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-1.5 text-xs text-[#64748B] flex items-center justify-between z-50">
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] label-caps font-bold">
          <Cpu className="w-3 h-3 text-[#0284C7]" />
          <span>PORTFOLIX ENGINE</span>
        </div>
        <p className="text-[11px] leading-tight text-[#334155] truncate sm:whitespace-normal font-sans">
          <strong className="font-semibold text-[#0F172A]">Simulated Trading & Analytics Environment:</strong> Real-time streaming market flow, Greeks, algorithmic backtests, MPT frontiers, and ML forecasts are computed for institutional paper research. Educational platform.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto p-1 text-[#94A3B8] hover:text-[#0F172A] rounded-md hover:bg-[#E2E8F0] transition shrink-0 cursor-pointer"
          title="Dismiss notice"
          aria-label="Dismiss educational notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
