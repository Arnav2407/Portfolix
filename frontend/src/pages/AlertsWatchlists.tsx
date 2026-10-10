import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import api from '../api/client';
import { SymbolData, Alert, Watchlist } from '../types';

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

  // New watchlist form state
  const [newWlName, setNewWlName] = useState('');
  const [selectedWlSymbols, setSelectedWlSymbols] = useState<string[]>(['RELIANCE', 'TCS']);

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
      <div className="glass-panel p-5 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight font-sans">
                Real-Time Price & Threshold Alerts
              </h2>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B]">
                EVENT DISPATCHER
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">
              Rule-based telemetry monitoring spot prices and statistical momentum indicators
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="px-3.5 py-1.5 rounded-lg bg-[#1F2937] hover:bg-[#374151] border border-[#374151] text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer active:scale-98"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Alert Form */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 font-sans">
            <Plus className="w-4 h-4 text-[#3B82F6]" />
            Arm Real-time Alert
          </h3>

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Instrument</label>
              <select
                value={alertSymbol}
                onChange={(e) => setAlertSymbol(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white font-mono focus:border-[#3B82F6]"
              >
                {symbols.map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} (₹{Number(s.latest_price || 0).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Condition Trigger</label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white focus:border-[#3B82F6]"
              >
                <option value="PRICE_ABOVE">Price Rises Above Target (₹)</option>
                <option value="PRICE_BELOW">Price Drops Below Target (₹)</option>
                <option value="RSI_OVERBOUGHT">RSI Exceeds Level (&gt; 70)</option>
                <option value="RSI_OVERSOLD">RSI Drops Below Level (&lt; 30)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Target Value (₹)</label>
              <input
                type="number"
                step="0.05"
                required
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="e.g. 1550.00"
                className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white font-mono focus:border-[#3B82F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Note / Trigger Rationale</label>
              <input
                type="text"
                value={alertNotes}
                onChange={(e) => setAlertNotes(e.target.value)}
                placeholder="e.g. Resistance level test"
                className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white focus:border-[#3B82F6]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs rounded-lg shadow-md shadow-[#3B82F6]/20 transition cursor-pointer active:scale-98"
            >
              Arm Alert
            </button>
          </form>
        </div>

        {/* Active Alerts List */}
        <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4 font-sans">
              <Bell className="w-4 h-4 text-[#F59E0B]" />
              Active Monitored Signals ({alerts.length})
            </h3>

            <div className="space-y-2.5">
              {alerts.length > 0 ? (
                alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`p-3 rounded-lg border flex items-center justify-between transition ${
                      a.is_triggered
                        ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
                        : 'bg-[#0B0F1A] border-[#1F2937]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          a.is_triggered ? 'bg-[#F59E0B]/20 text-[#F59E0B]' : 'bg-[#1F2937] text-[#9CA3AF]'
                        }`}
                      >
                        {a.is_triggered ? <AlertCircle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-sm text-white">{a.ticker}</span>
                          <span className="text-xs text-[#9CA3AF]">
                            {a.condition_type.replace('_', ' ')}:
                          </span>
                          <span className="text-xs font-bold text-[#22C55E]">
                            ₹{Number(a.target_value).toFixed(2)}
                          </span>
                          {a.is_triggered && (
                            <span className="label-caps px-1.5 py-0.5 rounded bg-[#F59E0B] text-[#0B0F1A] font-extrabold">
                              TRIGGERED
                            </span>
                          )}
                        </div>
                        {a.notes && <p className="text-xs text-[#9CA3AF] mt-0.5 font-sans">{a.notes}</p>}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAlert(a.id)}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#EF4444] rounded hover:bg-[#EF4444]/10 transition cursor-pointer"
                      title="Delete alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-[#9CA3AF] text-xs font-sans">
                  No active alert rules configured.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Watchlists Section */}
      <div className="glass-panel p-5 bg-[#121826] border border-[#1F2937] rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
            <Eye className="w-4 h-4 text-[#3B82F6]" />
            Watchlists & Sector Baskets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlists.map((wl) => (
            <div key={wl.id} className="p-4 bg-[#0B0F1A] rounded-xl border border-[#1F2937] space-y-3">
              <div className="font-bold text-sm text-white flex items-center justify-between font-sans">
                <span>{wl.name}</span>
                <span className="financial-sm text-[#9CA3AF]">{wl.symbols.length} Assets</span>
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
                      className="flex items-center justify-between p-2 rounded-lg bg-[#121826] hover:bg-[#161F33] cursor-pointer transition border border-[#1F2937]"
                    >
                      <span className="font-bold text-xs text-white font-mono">{symTicker}</span>
                      <div className="text-right font-mono">
                        <span className="text-xs text-[#dde2f6]">₹{Number(s?.latest_price || 0).toFixed(2)}</span>
                        <span
                          className={`text-[10px] font-semibold ml-2 ${
                            isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'
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
