import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Educational Disclaimer" className="bg-[#121826] border-b border-[#1F2937] px-4 py-1.5 text-xs text-[#9CA3AF] flex items-center justify-between z-50">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] label-caps">
          <ShieldAlert className="w-3 h-3" />
          <span>Simulation Engine</span>
        </div>
        <p className="text-[11px] leading-tight text-[#c2c6d6] truncate sm:whitespace-normal">
          <strong className="font-semibold text-white">Quantitative Research Platform:</strong> All paper execution, algorithmic backtests, MPT frontiers, and ML signals are simulated for academic/educational research. Not investment advice.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="ml-auto p-1 text-[#9CA3AF] hover:text-white rounded hover:bg-[#1F2937] transition shrink-0 cursor-pointer"
          title="Dismiss notice"
          aria-label="Dismiss educational notice"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
