import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Shield,
  User,
  Database,
  Server,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
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
      <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F2937] border border-[#374151] flex items-center justify-center text-[#dde2f6]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">System Diagnostics & Account Settings</h2>
              <p className="text-xs text-[#9CA3AF] font-sans">API cluster telemetry, database status, and authorization role profile</p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchStatus}
            className="px-3.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Run Diagnostics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Account Profile */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
              <User className="w-4 h-4 text-[#3B82F6]" />
              Authenticated Session
            </h3>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="px-3 py-1 rounded-lg bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] flex justify-between items-center">
              <span className="text-[#9CA3AF]">Email:</span>
              <span className="font-bold text-white">{user?.email || 'N/A'}</span>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] flex justify-between items-center">
              <span className="text-[#9CA3AF]">Full Name:</span>
              <span className="font-bold text-white font-sans">{user?.full_name || 'Trader'}</span>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] flex justify-between items-center">
              <span className="text-[#9CA3AF]">Role Privilege:</span>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
                {user?.role || 'trader'}
              </span>
            </div>
          </div>
        </div>

        {/* System & Database Health */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <Server className="w-4 h-4 text-[#3B82F6]" />
            Backend Infrastructure Health
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] flex justify-between items-center">
              <span className="text-[#9CA3AF]">API Status:</span>
              <span className="px-2 py-0.5 rounded bg-[#22C55E]/15 text-[#22C55E] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {health?.status || 'HEALTHY'}
              </span>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] flex justify-between items-center">
              <span className="text-[#9CA3AF]">Database Engine:</span>
              <span className="font-bold text-[#22C55E]">{health?.database || 'healthy'}</span>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] flex justify-between items-center">
              <span className="text-[#9CA3AF]">Environment:</span>
              <span className="font-bold text-white">{health?.environment || 'development'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel (If user is Admin) */}
      {user?.role === 'admin' && adminStats && (
        <div className="glass-panel p-5 bg-[#121826] border border-[#3B82F6]/30 rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#3B82F6]" />
            <h3 className="text-sm font-bold text-white font-sans">Administrator Telemetry Database Statistics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-center">
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Total Prices</div>
              <div className="financial-lg font-black text-[#22C55E] mt-1">{adminStats.total_prices.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Symbols</div>
              <div className="financial-lg font-black text-white mt-1">{adminStats.total_symbols}</div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Portfolios</div>
              <div className="financial-lg font-black text-[#adc6ff] mt-1">{adminStats.total_portfolios}</div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Users</div>
              <div className="financial-lg font-black text-[#adc6ff] mt-1">{adminStats.total_users}</div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Orders</div>
              <div className="financial-lg font-black text-white mt-1">{adminStats.total_orders}</div>
            </div>
            <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
              <div className="label-caps text-[#9CA3AF]">Trades</div>
              <div className="financial-lg font-black text-[#4ae176] mt-1">{adminStats.total_trades}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
