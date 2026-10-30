import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import api from '../api/client';
import { SymbolData, Alert, Watchlist } from '../types';
import { StockLogo } from '../components/StockLogo';

interface AlertsWatchlistsProps {
  symbols: SymbolData[];
  onSelectSymbol: (ticker: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const AlertsWatchlists: React.FC<AlertsWatchlistsProps> = ({
  symbols,
  onSelectSymbol,
  onNavigateTab,
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);

  // New alert form state
  const [alertSymbol, setAlertSymbol] = useState(symbols[0]?.ticker || 'RELIANCE');
  const [conditionType, setConditionType] = useState('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState('');
  const [alertNotes, setAlertNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, wlRes] = await Promise.all([
        api.get<Alert[]>('/alerts'),
        api.get<Watchlist[]>('/alerts/watchlists'),
      ]);
      setAlerts(alertsRes.data);
      setWatchlists(wlRes.data);
    } catch (err) {
      console.error('Failed to fetch alerts/watchlists', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/alerts', {
        symbol: alertSymbol,
        condition_type: conditionType,
        target_value: Number(targetValue),
        notes: alertNotes,
      });
      setTargetValue('');
      setAlertNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create alert');
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await api.delete(`/alerts/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete alert');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15 border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] shadow-xs">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-[#0F172A] tracking-tight font-sans">
                PORTFOLIX REAL-TIME SIGNAL ALERTS
              </h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                EVENT ROUTER
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 font-sans">
              Rule-based telemetry monitoring spot levels, volatility boundaries, and quantitative momentum
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="btn-secondary px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Alert Form */}
        <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4 font-sans">
            <Plus className="w-4 h-4 text-[#0284C7]" />
            Arm Real-time Alert
          </h3>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Instrument</label>
              <select
                value={alertSymbol}
                onChange={(e) => setAlertSymbol(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
              >
                {symbols.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} (₹{Number(s.latest_price || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Condition Trigger</label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
              >
                <option value="PRICE_ABOVE">Price Rises Above Target (₹)</option>
                <option value="PRICE_BELOW">Price Drops Below Target (₹)</option>
                <option value="RSI_OVERBOUGHT">RSI Exceeds Level (&gt; 70)</option>
                <option value="RSI_OVERSOLD">RSI Drops Below Level (&lt; 30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Target Value (₹)</label>
              <input
                type="number"
                step="0.05"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 1550.00"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Note / Trigger Rationale</label>
              <input
                type="text"
                value={alertNotes}
                onChange={(e) => setAlertNotes(e.target.value)}
                placeholder="e.g. Key breakout resistance"
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-primary py-2.5 text-xs font-bold transition cursor-pointer active:scale-98"
            >
              Arm Alert
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl lg:col-span-2 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 mb-4 font-sans">
              <Bell className="w-4 h-4 text-[#D97706]" />
              Active Monitored Signals ({alerts.length})
            </h3>

            <div className="space-y-2.5">
              {alerts.length > 0 ? (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                      a.is_triggered
                        ? 'bg-[#FFFBEB] border-[#FDE68A] shadow-xs'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-xl ${
                          a.is_triggered ? 'bg-[#FEF3C7] text-[#D97706]' : 'bg-[#E0F2FE] text-[#0284C7]'
                        }`}
                      >
                        {a.is_triggered ? <AlertCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-sm text-[#0F172A]">{a.ticker}</span>
                          <span className="text-xs text-[#64748B]">
                            {a.condition_type.replace('_', ' ')}:
                          </span>
                          <span className="text-xs font-bold text-[#10B981]">
                            ₹{Number(a.target_value).toFixed(2)}
                          </span>
                          {a.is_triggered && (
                            <span className="label-caps px-2 py-0.5 rounded-full bg-[#F59E0B] text-white font-black text-[9px]">
                              TRIGGERED
                            </span>
                          )}
                        </div>
                        {a.notes && <p className="text-xs text-[#64748B] mt-0.5 font-sans">{a.notes}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1.5 text-[#64748B] hover:text-[#F43F5E] rounded-lg hover:bg-[#F43F5E]/10 transition cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
                  <img
                    src="/images/empty-state.jpg"
                    alt="No active alerts"
                    className="w-32 h-24 object-cover rounded-xl border border-[#E2E8F0] shadow-xs"
                  />
                  <div>
                    <p className="font-bold text-sm text-[#0F172A] font-sans">No Monitored Alerts</p>
                    <p className="text-xs text-[#64748B] font-sans mt-0.5">
                      Arm a price boundary or statistical RSI trigger using the panel on the left.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Watchlists Section */}
      <div className="glass-panel p-5 bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans">
            <Eye className="w-4 h-4 text-[#0284C7]" />
            Watchlists & Sector Baskets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlists.map((wl) => (
            <div key={wl.id} className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] space-y-3">
              <div className="font-bold text-sm text-[#0F172A] flex items-center justify-between font-sans">
                <span>{wl.name}</span>
                <span className="financial-sm text-[#0284C7] font-bold">{wl.symbols.length} Assets</span>
              </div>
              <div className="space-y-1.5">
                {wl.symbols.map((symTicker) => {
                  const s = symbols.find((x) => x.ticker === symTicker);
                  const isUp = (s?.change_pct_1d || 0) >= 0;
                  return (
                    <div
                      key={symTicker}
                      onClick={() => {
                        onSelectSymbol(symTicker);
                        onNavigateTab('market');
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-[#F1F5F9] cursor-pointer transition border border-[#E2E8F0] hover:border-[#BAE6FD]"
                    >
                      <div className="flex items-center gap-2">
                        <StockLogo ticker={symTicker} size="sm" />
                        <span className="font-bold text-xs text-[#0F172A] font-mono">{symTicker}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs text-[#334155]">₹{Number(s?.latest_price || 0).toFixed(2)}</span>
                        <span
                          className={`text-[10px] font-bold ml-2 ${
                            isUp ? 'text-[#10B981]' : 'text-[#F43F5E]'
                          }`}
                        >
                          {isUp ? '+' : ''}
                          {Number(s?.change_pct_1d || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
