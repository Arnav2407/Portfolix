import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Wallet, Sparkles, Zap, Activity } from 'lucide-react';
import { Portfolio, SymbolData } from '../types';

export type BgTheme = 'sky' | 'mint' | 'violet';

interface NavbarProps {
  onOpenAuth: () => void;
  symbols: SymbolData[];
  portfolios: Portfolio[];
  activePortfolio: Portfolio | null;
  onSelectPortfolio: (p: Portfolio) => void;
  triggeredAlertsCount: number;
  bgTheme?: BgTheme;
  onSelectBgTheme?: (theme: BgTheme) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  symbols,
  portfolios,
  activePortfolio,
  onSelectPortfolio,
  triggeredAlertsCount,
  bgTheme = 'sky',
  onSelectBgTheme,
}) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E2E8F0]">
      {/* Top Ticker Ribbon - Portfolix Live Stream */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-1.5 px-4 overflow-x-auto whitespace-nowrap flex items-center gap-6 text-[11px] font-mono scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
          </span>
          <span className="text-[#0284C7] label-caps font-bold">PORTFOLIX STREAM:</span>
          <span className="text-[10px] text-[#64748B] flex items-center gap-1 font-mono">
            <Zap className="w-2.5 h-2.5 text-[#10B981]" /> 9ms
          </span>
        </div>

        {symbols.slice(0, 16).map((s) => {
          const isUp = (s.change_pct_1d || 0) >= 0;
          return (
            <div key={s.ticker} className="flex items-center gap-2 shrink-0 hover:opacity-80 transition cursor-pointer">
              <span className="font-bold text-[#0F172A] tracking-tight">{s.ticker}</span>
              <span className="text-[#475569] font-mono">
                ₹{Number(s.latest_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono flex items-center gap-0.5 ${
                isUp
                  ? 'text-[#059669] bg-[#ECFDF5] border border-[#A7F3D0]'
                  : 'text-[#E11D48] bg-[#FFF1F2] border border-[#FECDD3]'
              }`}>
                {isUp ? '+' : ''}{Number(s.change_pct_1d || 0).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] p-0.5 shadow-md shadow-[#0284C7]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#FFFFFF] rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#0284C7]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#0F172A] font-sans">
                PORTFOLIX
              </span>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                TRADING DESK
              </span>
            </div>
            <span className="text-[10px] text-[#64748B] font-mono tracking-wider -mt-0.5">
              QUANTITATIVE ANALYTICS TERMINAL
            </span>
          </div>
        </div>

        {/* Portfolio Quick Selector & Status */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-1.5">
              <Wallet className="w-4 h-4 text-[#0284C7]" />
              <div className="text-xs">
                <span className="text-[#64748B] font-medium mr-1.5">Book:</span>
                {portfolios.length > 1 ? (
                  <select
                    value={activePortfolio?.id || ''}
                    onChange={(e) => {
                      const p = portfolios.find((x) => x.id === Number(e.target.value));
                      if (p) onSelectPortfolio(p);
                    }}
                    className="bg-transparent text-[#0F172A] font-bold font-mono focus:outline-none cursor-pointer pr-1"
                  >
                    {portfolios.map((p) => (
                      <option key={p.id} value={p.id} className="bg-[#FFFFFF] text-[#0F172A]">
                        {p.name} (₹{Number(p.total_equity).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-[#0F172A] font-sans">
                    {activePortfolio?.name || 'Alpha Book'}{' '}
                    <span className="text-[#059669] font-mono ml-1 font-bold">
                      ₹{Number(activePortfolio?.total_equity || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Live Environment Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[10px] font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              LIVE SIMULATION
            </div>

            {/* Light Colored Matching Background Theme Switcher */}
            {onSelectBgTheme && (
              <div className="hidden lg:flex items-center gap-1 bg-[#F1F5F9]/80 border border-[#E2E8F0] p-1 rounded-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => onSelectBgTheme('sky')}
                  title="Sky Blue Matching Background"
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer ${
                    bgTheme === 'sky'
                      ? 'bg-white text-[#0284C7] shadow-xs border border-[#BAE6FD]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                  Sky
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBgTheme('mint')}
                  title="Mint Emerald Matching Background"
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer ${
                    bgTheme === 'mint'
                      ? 'bg-white text-[#059669] shadow-xs border border-[#A7F3D0]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                  Mint
                </button>
                <button
                  type="button"
                  onClick={() => onSelectBgTheme('violet')}
                  title="Quant Violet Matching Background"
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer ${
                    bgTheme === 'violet'
                      ? 'bg-white text-[#8B5CF6] shadow-xs border border-[#DDD6FE]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span>
                  Violet
                </button>
              </div>
            )}
          </div>
        )}

        {/* User / Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && triggeredAlertsCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FEF3C7] border border-[#FDE68A] text-[#B45309] rounded-xl text-xs font-bold font-mono animate-pulse">
              <Bell className="w-3.5 h-3.5" />
              <span>{triggeredAlertsCount} Alert{triggeredAlertsCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <div className="relative shrink-0">
                  <img
                    src="/images/trader-avatar.jpg"
                    alt={user.full_name || 'Alex Mercer'}
                    className="w-7 h-7 rounded-lg object-cover border border-[#BAE6FD] shadow-2xs"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#10B981] ring-1 ring-white" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#0F172A] leading-tight font-sans">
                    {user.full_name || user.email.split('@')[0]}
                  </div>
                  <div className="label-caps text-[#0284C7] text-[9px]">
                    {user.role}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="px-2.5 py-1.5 text-[#64748B] hover:text-[#E11D48] hover:bg-[#FFF1F2] rounded-xl border border-transparent hover:border-[#FECDD3] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
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
                className="btn-cyan-primary px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer active:scale-98"
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
