import React from 'react';
import {
  LayoutDashboard,
  CandlestickChart,
  ArrowLeftRight,
  PieChart,
  History,
  BrainCircuit,
  BellRing,
  FileSpreadsheet,
  Settings,
  Cpu,
  Zap,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'market'
  | 'trade'
  | 'portfolio'
  | 'backtest'
  | 'forecast'
  | 'alerts'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const sections = [
    {
      group: 'MARKET OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Market Flow & Overview', icon: LayoutDashboard },
        { id: 'market', label: 'Technical Explorer', icon: CandlestickChart },
      ],
    },
    {
      group: 'EXECUTION DESK',
      items: [
        { id: 'trade', label: 'Trading Terminal', icon: ArrowLeftRight },
        { id: 'portfolio', label: 'Portfolio & MPT Lab', icon: PieChart },
      ],
    },
    {
      group: 'QUANT & AI INTELLIGENCE',
      items: [
        { id: 'backtest', label: 'Backtest Studio', icon: History },
        { id: 'forecast', label: 'ML Forecasts & Alpha', icon: BrainCircuit },
        { id: 'alerts', label: 'Alerts & Watchlist', icon: BellRing },
      ],
    },
    {
      group: 'COMPLIANCE & SYSTEM',
      items: [
        { id: 'reports', label: 'Reports & Audits', icon: FileSpreadsheet },
        { id: 'settings', label: 'Engine Settings', icon: Settings },
      ],
    },
  ] as const;

  return (
    <aside aria-label="Main Navigation" className="w-64 bg-[#FFFFFF]/85 backdrop-blur-md border-r border-[#E2E8F0] flex flex-col shrink-0 min-h-[calc(100vh-5.5rem)]">
      <div className="p-3.5 space-y-5 flex-1">
        {sections.map((section) => (
          <div key={section.group} className="space-y-1">
            <div className="label-caps text-[#94A3B8] text-[9px] px-3 py-1 font-bold tracking-wider">
              {section.group}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id as NavTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] font-bold shadow-xs'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
                  <span className={`truncate ${isActive ? 'text-[#0284C7]' : 'text-[#475569]'}`}>{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0284C7]" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Portfolix Telemetry Box */}
      <div className="p-3.5 m-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#0F172A]">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#0284C7]" />
            <span className="font-sans">Engine Status</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-[#059669] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            ACTIVE
          </span>
        </div>
        <div className="financial-sm text-[#64748B] mt-1.5">20 NSE Equities • 83,979 Bars</div>
        <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[10px]">
          <span className="text-[#64748B] font-mono font-bold">LATENCY</span>
          <span className="text-[#0284C7] font-mono font-bold flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" /> 9ms
          </span>
        </div>
      </div>
    </aside>
  );
};
