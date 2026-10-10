import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  Trash2,
  Check,
  Percent,
  Plus,
  Minus,
} from 'lucide-react';
import api from '../api/client';
import {
  SymbolData,
  Portfolio,
  Order,
  Trade,
  OrderPreview,
} from '../types';

interface TradingTerminalProps {
  symbols: SymbolData[];
  portfolio: Portfolio | null;
  selectedSymbol: string;
  onSelectSymbol: (ticker: string) => void;
  onRefreshPortfolio: () => void;
}

export const TradingTerminal: React.FC<TradingTerminalProps> = ({
  symbols,
  portfolio,
  selectedSymbol,
  onSelectSymbol,
  onRefreshPortfolio,
}) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<string>('MARKET');
  const [quantity, setQuantity] = useState<string>('10');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [stopPrice, setStopPrice] = useState<string>('');
  const [timeInForce, setTimeInForce] = useState<string>('GTC');

  const [preview, setPreview] = useState<OrderPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<'positions' | 'orders' | 'trades'>('positions');

  const currentSymbolObj = symbols.find((s) => s.ticker === selectedSymbol) || symbols[0];

  // Fetch open orders and trades
  const fetchOrdersAndTrades = async () => {
    if (!portfolio) return;
    try {
      const [ordersRes, tradesRes] = await Promise.all([
        api.get<Order[]>(`/orders/portfolio/${portfolio.id}`),
        api.get<Trade[]>(`/orders/trades?portfolio_id=${portfolio.id}`),
      ]);
      setOrders(ordersRes.data);
      setTrades(tradesRes.data);
    } catch (err) {
      console.error('Failed to fetch orders/trades', err);
    }
  };

  useEffect(() => {
    fetchOrdersAndTrades();
  }, [portfolio?.id]);

  // Fetch live order preview
  useEffect(() => {
    const fetchPreview = async () => {
      if (!portfolio || !selectedSymbol || !quantity || Number(quantity) <= 0) {
        setPreview(null);
        return;
      }
      setPreviewLoading(true);
      try {
        const res = await api.post<OrderPreview>('/orders/preview', {
          symbol: selectedSymbol,
          portfolio_id: portfolio.id,
          side: side,
          quantity: Number(quantity),
          order_type: orderType,
          price: limitPrice ? Number(limitPrice) : undefined,
        });
        setPreview(res.data);
      } catch (err) {
        setPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    };

    const timer = setTimeout(fetchPreview, 250);
    return () => clearTimeout(timer);
  }, [selectedSymbol, side, orderType, quantity, limitPrice, portfolio?.id]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolio) return;

    setFeedback(null);
    setSubmitLoading(true);
    try {
      const res = await api.post<Order>('/orders', {
        symbol: selectedSymbol,
        portfolio_id: portfolio.id,
        side: side,
        order_type: orderType,
        quantity: Number(quantity),
        price: limitPrice ? Number(limitPrice) : undefined,
        stop_price: stopPrice ? Number(stopPrice) : undefined,
        time_in_force: timeInForce,
      });

      const orderRes = res.data;
      if (orderRes.status === 'FILLED') {
        setFeedback({
          type: 'success',
          message: `Order FILLED! Executed ${side} ${quantity} shares of ${selectedSymbol}.`,
        });
      } else if (orderRes.status === 'PENDING') {
        setFeedback({
          type: 'success',
          message: `Order PLACED! Limit ${side} order submitted to book.`,
        });
      } else if (orderRes.status === 'REJECTED') {
        setFeedback({
          type: 'error',
          message: `Order REJECTED: ${orderRes.reject_reason || 'Execution rejected by risk engine.'}`,
        });
      }

      onRefreshPortfolio();
      fetchOrdersAndTrades();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Order placement failed.',
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await api.post(`/orders/${orderId}/cancel`);
      fetchOrdersAndTrades();
      onRefreshPortfolio();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to cancel order');
    }
  };

  const handleQuickPercent = (pct: number) => {
    if (!portfolio || !currentSymbolObj?.latest_price) return;
    const price = currentSymbolObj.latest_price;
    if (side === 'BUY') {
      const cashToUse = Number(portfolio.cash_balance) * (pct / 100);
      const maxQty = Math.floor(cashToUse / (price * 1.002));
      setQuantity(Math.max(1, maxQty).toString());
    } else {
      const holding = portfolio.holdings.find((h) => h.ticker === selectedSymbol);
      if (holding) {
        const qtyToSell = Math.floor(Number(holding.quantity) * (pct / 100));
        setQuantity(Math.max(1, qtyToSell).toString());
      }
    }
  };

  const stepQuantity = (delta: number) => {
    const current = Number(quantity) || 0;
    const next = Math.max(1, current + delta);
    setQuantity(next.toString());
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Placement Ticket - Level 1 Surface */}
        <div className="glass-panel p-5 lg:col-span-1 flex flex-col justify-between bg-[#121826] border border-[#1F2937] rounded-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <ArrowLeftRight className="w-4 h-4 text-[#3B82F6]" />
                Order Execution Ticket
              </h3>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[#adc6ff]">
                ACID SIM
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3 mb-4 rounded-lg text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]'
                    : 'bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E] mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444] mt-0.5" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Asset Selector */}
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Instrument</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => onSelectSymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-xs text-white font-mono focus:border-[#3B82F6] cursor-pointer"
                >
                  {symbols.map((s) => (
                    <option key={s.ticker} value={s.ticker} className="bg-[#121826]">
                      {s.ticker} • {s.name} (₹{Number(s.latest_price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Side toggle BUY / SELL */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0F1A] rounded-lg border border-[#1F2937]">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-2 text-xs font-bold rounded-md transition cursor-pointer active:scale-98 ${
                    side === 'BUY'
                      ? 'bg-[#22C55E] text-[#0B0F1A] font-extrabold shadow-md shadow-[#22C55E]/20'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-2 text-xs font-bold rounded-md transition cursor-pointer active:scale-98 ${
                    side === 'SELL'
                      ? 'bg-[#EF4444] text-white font-bold shadow-md shadow-[#EF4444]/20'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Order Type Pill Tabs */}
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Order Type</label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B0F1A] rounded-lg border border-[#1F2937] text-[10px] font-mono font-medium">
                  {['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 rounded text-center transition cursor-pointer ${
                        orderType === t
                          ? 'bg-[#1E293B] text-white font-bold border border-[#3B82F6]/50'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity input & Stepper + quick percentages */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-[#9CA3AF] font-sans">Order Size</label>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleQuickPercent(pct)}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-[#1F2937] hover:bg-[#374151] text-[#9CA3AF] hover:text-white font-mono cursor-pointer transition"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full pl-3 pr-24 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white font-mono focus:border-[#3B82F6]"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <span className="label-caps text-[#6B7280] mr-1">SHARES</span>
                    <button
                      type="button"
                      onClick={() => stepQuantity(-1)}
                      className="p-1 text-[#9CA3AF] hover:text-white bg-[#1F2937] hover:bg-[#374151] rounded cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepQuantity(1)}
                      className="p-1 text-[#9CA3AF] hover:text-white bg-[#1F2937] hover:bg-[#374151] rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Limit Price if LIMIT or TAKE_PROFIT */}
              {(orderType === 'LIMIT' || orderType === 'TAKE_PROFIT') && (
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Limit Target Price (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder={`Current: ₹${Number(currentSymbolObj?.latest_price || 0).toFixed(2)}`}
                      className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white font-mono focus:border-[#3B82F6]"
                    />
                    <span className="absolute right-3 top-2.5 label-caps text-[#6B7280]">INR</span>
                  </div>
                </div>
              )}

              {/* Stop Price if STOP_LOSS */}
              {orderType === 'STOP_LOSS' && (
                <div>
                  <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Stop Trigger Price (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      placeholder={`Current: ₹${Number(currentSymbolObj?.latest_price || 0).toFixed(2)}`}
                      className="w-full px-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white font-mono focus:border-[#3B82F6]"
                    />
                    <span className="absolute right-3 top-2.5 label-caps text-[#6B7280]">INR</span>
                  </div>
                </div>
              )}

              {/* Live Preview Card with Slippage & Fees */}
              {preview && (
                <div className="p-3 bg-[#0B0F1A] rounded-lg border border-[#1F2937] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#9CA3AF]">
                    <span>Est. Price:</span>
                    <span className="text-white">₹{Number(preview.estimated_price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#9CA3AF] financial-sm">
                    <span>Est. Commission (0.10%):</span>
                    <span className="text-[#dde2f6]">₹{Number(preview.estimated_commission).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#9CA3AF] financial-sm">
                    <span>Est. Slippage (0.05%):</span>
                    <span className="text-[#dde2f6]">₹{Number(preview.estimated_slippage).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#1F2937] pt-1.5 flex justify-between font-bold">
                    <span className="text-[#9CA3AF]">Total Capital Req:</span>
                    <span className="text-[#22C55E] financial-md">₹{Number(preview.estimated_total).toFixed(2)}</span>
                  </div>
                  {!preview.can_execute && (
                    <div className="text-[11px] text-[#EF4444] font-medium pt-1">
                      ⚠️ {preview.rejection_reason}
                    </div>
                  )}
                </div>
              )}

              {/* Execution Button adhering to DESIGN.md */}
              <button
                type="submit"
                disabled={submitLoading || (preview ? !preview.can_execute : false)}
                className={`w-full py-3 rounded-lg font-bold text-xs transition cursor-pointer active:scale-98 disabled:opacity-40 flex flex-col items-center justify-center ${
                  side === 'BUY'
                    ? 'btn-buy-primary'
                    : 'btn-sell-primary'
                }`}
              >
                <span>{submitLoading ? 'Routing Order...' : `Execute ${side} • ${quantity} ${selectedSymbol}`}</span>
                {preview && (
                  <span className="financial-sm opacity-80 mt-0.5">
                    Est. Total ₹{Number(preview.estimated_total).toLocaleString('en-IN', { maximumFractionDigits: 0 })} (incl. slip & fees)
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Tabbed Tables: Positions, Open Orders, Trade Ledger */}
        <div className="glass-panel p-5 lg:col-span-2 flex flex-col justify-between bg-[#121826] border border-[#1F2937] rounded-xl">
          <div>
            {/* Pill Tab Track */}
            <div className="flex items-center gap-2 mb-4 bg-[#0B0F1A] p-1 rounded-lg border border-[#1F2937]">
              <button
                type="button"
                onClick={() => setActiveTab('positions')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                  activeTab === 'positions'
                    ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Positions ({portfolio?.holdings?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Order Book ({orders.filter((o) => o.status === 'PENDING').length} Open)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trades')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold font-mono transition cursor-pointer ${
                  activeTab === 'trades'
                    ? 'bg-[#1E293B] text-white border border-[#3B82F6]/40'
                    : 'text-[#9CA3AF] hover:text-white'
                }`}
              >
                Execution Ledger ({trades.length})
              </button>
            </div>

            {/* Positions Table */}
            {activeTab === 'positions' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                      <th className="pb-2">Asset</th>
                      <th className="pb-2">Shares</th>
                      <th className="pb-2">Avg Price</th>
                      <th className="pb-2">Current</th>
                      <th className="pb-2">Market Value</th>
                      <th className="pb-2">Unrealized P&L</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                      portfolio.holdings.map((h) => {
                        const isUp = h.unrealized_pnl >= 0;
                        return (
                          <tr key={h.id} className="hover:bg-[#161F33]/50 h-9 transition">
                            <td className="py-2 font-bold text-white">
                              {h.ticker}
                              <span className="block text-[10px] text-[#9CA3AF] font-normal font-sans">{h.sector}</span>
                            </td>
                            <td className="py-2 text-[#dde2f6]">{Number(h.quantity).toFixed(0)}</td>
                            <td className="py-2 text-[#9CA3AF]">₹{Number(h.average_buy_price).toFixed(2)}</td>
                            <td className="py-2 font-semibold text-white">₹{Number(h.current_price).toFixed(2)}</td>
                            <td className="py-2 text-[#dde2f6]">₹{Number(h.market_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td className={`py-2 font-bold ${isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                              {isUp ? '+' : ''}₹{Number(h.unrealized_pnl).toFixed(2)} ({Number(h.unrealized_pnl_pct || 0).toFixed(2)}%)
                            </td>
                            <td className="py-2 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSymbol(h.ticker);
                                  setSide('SELL');
                                  setQuantity(Number(h.quantity).toString());
                                }}
                                className="px-2.5 py-1 text-[11px] rounded bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 transition cursor-pointer"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#9CA3AF] text-xs font-sans">
                          No open positions in active portfolio. Place an execution order on the left!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Orders Table with Bids/Asks depth styling */}
            {activeTab === 'orders' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">Side</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Price</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {orders.length > 0 ? (
                      orders.map((o) => (
                        <tr
                          key={o.id}
                          className={`h-9 transition ${
                            o.side === 'BUY' ? 'hover:bg-[#22C55E]/5' : 'hover:bg-[#EF4444]/5'
                          }`}
                        >
                          <td className="py-2 text-[#9CA3AF] text-[11px]">{new Date(o.created_at).toLocaleTimeString()}</td>
                          <td className="py-2 font-bold text-white">{o.ticker}</td>
                          <td className="py-2 text-[#9CA3AF]">{o.order_type}</td>
                          <td className={`py-2 font-bold ${o.side === 'BUY' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {o.side}
                          </td>
                          <td className="py-2 text-[#dde2f6]">{Number(o.quantity).toFixed(0)}</td>
                          <td className="py-2 text-[#dde2f6]">
                            {o.price ? `₹${Number(o.price).toFixed(2)}` : 'Market'}
                          </td>
                          <td className="py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'FILLED'
                                  ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                  : o.status === 'PENDING'
                                  ? 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                  : 'bg-[#EF4444]/15 text-[#EF4444]'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            {o.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(o.id)}
                                className="p-1 text-[#9CA3AF] hover:text-[#EF4444] rounded hover:bg-[#EF4444]/10 transition cursor-pointer"
                                title="Cancel Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-[#9CA3AF] text-xs font-sans">
                          No pending or open orders in the book.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Trades Ledger Table */}
            {activeTab === 'trades' && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="text-[#9CA3AF] border-b border-[#1F2937] label-caps">
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Symbol</th>
                      <th className="pb-2">Side</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2">Fill Price</th>
                      <th className="pb-2">Fee + Slip</th>
                      <th className="pb-2">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F2937]">
                    {trades.length > 0 ? (
                      trades.map((t) => (
                        <tr key={t.id} className="hover:bg-[#161F33]/50 h-9 transition">
                          <td className="py-2 text-[#9CA3AF] text-[11px]">
                            {new Date(t.executed_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2 font-bold text-white">{t.ticker}</td>
                          <td className={`py-2 font-bold ${t.side === 'BUY' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {t.side}
                          </td>
                          <td className="py-2 text-[#dde2f6]">{Number(t.quantity).toFixed(0)}</td>
                          <td className="py-2 font-semibold text-white">₹{Number(t.execution_price).toFixed(2)}</td>
                          <td className="py-2 text-[#9CA3AF]">₹{(Number(t.commission) + Number(t.slippage)).toFixed(2)}</td>
                          <td
                            className={`py-2 font-bold ${
                              Number(t.realized_pnl) > 0
                                ? 'text-[#22C55E]'
                                : Number(t.realized_pnl) < 0
                                ? 'text-[#EF4444]'
                                : 'text-[#9CA3AF]'
                            }`}
                          >
                            ₹{Number(t.realized_pnl).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-[#9CA3AF] text-xs font-sans">
                          No trade fills recorded in the ledger yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
