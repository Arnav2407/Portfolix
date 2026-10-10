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
  Database,
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
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'market', label: 'Market Explorer', icon: CandlestickChart },
    { id: 'trade', label: 'Paper Trading', icon: ArrowLeftRight },
    { id: 'portfolio', label: 'Portfolio & MPT', icon: PieChart },
    { id: 'backtest', label: 'Backtest Studio', icon: History },
    { id: 'forecast', label: 'ML Forecasts & Signals', icon: BrainCircuit },
    { id: 'alerts', label: 'Alerts & Watchlist', icon: BellRing },
    { id: 'reports', label: 'Reports & Export', icon: FileSpreadsheet },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ] as const;

  return (
    <aside aria-label="Main Navigation" className="w-64 bg-[#121826] border-r border-[#1F2937] flex flex-col shrink-0 min-h-[calc(100vh-5.5rem)]">
      <div className="p-3 space-y-1 flex-1">
        <div className="label-caps text-[#9CA3AF] px-3 py-2">
          Telemetry & Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as NavTab)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-[#1E293B] text-white border border-[#3B82F6]/50 shadow-sm shadow-[#3B82F6]/10'
                  : 'text-[#9CA3AF] hover:text-[#dde2f6] hover:bg-[#161F33] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#3B82F6]' : 'text-[#9CA3AF]'}`} />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Institutional Telemetry Box */}
      <div className="p-3 m-3 bg-[#0B0F1A] border border-[#1F2937] rounded-lg">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#dde2f6]">
          <Database className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Market Feed Coverage</span>
        </div>
        <div className="financial-sm text-[#9CA3AF] mt-1">20 NSE Equities • 83,979 Bars</div>
        <div className="mt-2 pt-2 border-t border-[#1F2937] flex items-center justify-between text-[10px]">
          <span className="text-[#9CA3AF]">Engine</span>
          <span className="text-[#22C55E] font-mono font-medium">SQLite / In-Memory</span>
        </div>
      </div>
    </aside>
  );
};
