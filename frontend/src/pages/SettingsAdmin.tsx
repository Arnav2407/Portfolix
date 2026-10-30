import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Shield,
  User,
  Server,
  CheckCircle2,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import api from '../api/client';

export const SettingsAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const [health, setHealth] = useState<any | null>(null);
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const hRes = await api.get('/health');
      setHealth(hRes.data);

      if (user?.role === 'admin') {
        const statsRes = await api.get('/admin/stats');
        setAdminStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch system status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user?.role]);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15 border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] tracking-tight font-sans">
                PORTFOLIX DIAGNOSTICS & SYSTEM TELEMETRY
              </h2>
              <p className="text-xs text-[#64748B] font-sans">
                Real-time API cluster health, database ledger connectivity, and authorization privilege levels
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchStatus}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Profile */}
        <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
              <User className="w-4 h-4 text-[#0284C7]" />
              Authenticated Session
            </h3>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1 rounded-xl bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 border border-[#F43F5E]/30 text-[#BE123C] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="relative shrink-0">
              <img
                src="/images/trader-avatar.jpg"
                alt={user?.full_name || 'Alex Mercer'}
                className="w-14 h-14 rounded-xl object-cover border border-[#BAE6FD] shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-white" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0F172A] font-sans">{user?.full_name || 'Alex Mercer'}</div>
              <div className="text-xs text-[#64748B] font-mono">{user?.email || 'alex.mercer@portfolix.quant'}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                  {user?.role || 'trader'}
                </span>
                <span className="text-[10px] text-[#059669] font-mono font-semibold">● ONLINE SIMULATION</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <span className="text-[#64748B]">Email:</span>
              <span className="font-bold text-[#0F172A]">{user?.email || 'N/A'}</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <span className="text-[#64748B]">Full Name:</span>
              <span className="font-bold text-[#0F172A] font-sans">{user?.full_name || 'Quant Trader'}</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <span className="text-[#64748B]">Role Privilege:</span>
              <span className="label-caps px-2.5 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                {user?.role || 'trader'}
              </span>
            </div>
          </div>
        </div>

        {/* System & Database Health */}
        <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
            <Server className="w-4 h-4 text-[#0284C7]" />
            Backend Infrastructure Telemetry
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <span className="text-[#64748B]">API Status:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30 font-bold flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                {health?.status || 'HEALTHY'}
              </span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <span className="text-[#64748B]">Database Engine:</span>
              <span className="font-bold text-[#10B981]">{health?.database || 'healthy (sqlite)'}</span>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex justify-between items-center">
              <span className="text-[#64748B]">Environment:</span>
              <span className="font-bold text-[#0F172A]">{health?.environment || 'production/simulation'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel (If user is Admin) */}
      {user?.role === 'admin' && adminStats && (
        <div className="glass-panel p-5 bg-white border border-[#BAE6FD] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#0284C7]" />
            <h3 className="text-sm font-bold text-[#0F172A] font-sans">Administrator Telemetry Database Statistics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-center">
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Total Prices</div>
              <div className="financial-lg font-black text-[#10B981] mt-1">{adminStats.total_prices.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Symbols</div>
              <div className="financial-lg font-black text-[#0F172A] mt-1">{adminStats.total_symbols}</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Portfolios</div>
              <div className="financial-lg font-black text-[#0284C7] mt-1">{adminStats.total_portfolios}</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Users</div>
              <div className="financial-lg font-black text-[#0284C7] mt-1">{adminStats.total_users}</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Orders</div>
              <div className="financial-lg font-black text-[#0F172A] mt-1">{adminStats.total_orders}</div>
            </div>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <div className="label-caps text-[#64748B]">Trades</div>
              <div className="financial-lg font-black text-[#10B981] mt-1">{adminStats.total_trades}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
