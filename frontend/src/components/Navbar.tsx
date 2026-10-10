import React from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Bell, LogOut, Wallet, Sparkles, Activity, Shield } from 'lucide-react';
import { Portfolio, SymbolData } from '../types';

interface NavbarProps {
  onOpenAuth: () => void;
  symbols: SymbolData[];
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  onSelectPortfolio: (p: Portfolio) => void;
  triggeredAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  symbols,
  portfolios,
  activePortfolio,
  onSelectPortfolio,
  triggeredAlertsCount,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0F1A]/95 backdrop-blur-md border-b border-[#1F2937]">
      {/* Top Ticker Ribbon */}
      <div className="bg-[#080E1C] border-b border-[#1F2937] py-1 px-4 overflow-x-auto whitespace-nowrap flex items-center gap-6 text-[11px] font-mono scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
          </span>
          <span className="text-[#9CA3AF] label-caps">NSE TICK FEED:</span>
        </div>
        {symbols.slice(0, 14).map((s) => {
          const isUp = (s.change_pct_1d || 0) >= 0;
          return (
            <div key={s.ticker} className="flex items-center gap-1.5 shrink-0">
              <span className="font-semibold text-[#dde2f6]">{s.ticker}</span>
              <span className="text-[#9CA3AF] font-mono">
                ₹{Number(s.latest_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full font-mono ${
                isUp ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'
              }`}>
                {isUp ? '+' : ''}{Number(s.change_pct_1d || 0).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#3B82F6]/20">
            <Activity className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-base tracking-tight text-white font-sans">
              PORTFOLIX
            </span>
            <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
              QUANTEDGE
            </span>
          </div>
        </div>

        {/* Portfolio Quick Selector */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-2 bg-[#121826] border border-[#1F2937] rounded-lg px-3 py-1.5">
            <Wallet className="w-4 h-4 text-[#3B82F6]" />
            <div className="text-xs">
              <span className="text-[#9CA3AF]">Active Book: </span>
              {portfolios.length > 1 ? (
                <select
                  value={activePortfolio?.id || ''}
                  onChange={(e) => {
                    const p = portfolios.find((x) => x.id === Number(e.target.value));
                    if (p) onSelectPortfolio(p);
                  }}
                  className="bg-transparent text-white font-semibold font-mono focus:outline-none cursor-pointer"
                >
                  {portfolios.map((p) => (
                    <option key={p.id} value={p.id} className="bg-[#121826] text-white">
                      {p.name} (₹{Number(p.total_equity).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="font-semibold text-white">
                  {activePortfolio?.name || 'Main Alpha Book'}{' '}
                  <span className="text-[#22C55E] font-mono ml-1">
                    (₹{Number(activePortfolio?.total_equity || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })})
                  </span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && triggeredAlertsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] rounded-lg text-xs animate-pulse font-mono">
              <Bell className="w-3.5 h-3.5" />
              <span>{triggeredAlertsCount} Alert{triggeredAlertsCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121826] border border-[#1F2937] rounded-lg">
                <div className="w-6 h-6 rounded-md bg-[#3B82F6]/20 text-[#adc6ff] flex items-center justify-center text-xs font-bold font-mono">
                  {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {user.full_name || user.email.split('@')[0]}
                  </div>
                  <div className="label-caps text-[#3B82F6]">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="px-2.5 py-1.5 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg border border-transparent hover:border-[#EF4444]/20 transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-4 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-xs transition shadow-md shadow-[#3B82F6]/25 flex items-center gap-1.5 cursor-pointer active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sign In / Demo
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
