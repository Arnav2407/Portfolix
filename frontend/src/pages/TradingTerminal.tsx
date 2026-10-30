import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  AlertCircle,
  CheckCircle2,
  Trash2,
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
import { StockLogo } from '../components/StockLogo';

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
        <div className="glass-panel p-5 lg:col-span-1 flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2 font-sans tracking-wide">
                <ArrowLeftRight className="w-4 h-4 text-[#0284C7]" />
                PORTFOLIX EXECUTION TICKET
              </h3>
              <span className="label-caps px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] text-[9px] font-bold">
                FAST ROUTE
              </span>
            </div>

            {feedback && (
              <div
                className={`p-3 mb-4 rounded-xl text-xs flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-[#10B981]/10 border border-[#10B981]/30 text-[#047857]'
                    : 'bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#BE123C]'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#F43F5E] mt-0.5" />
                )}
                <span className="font-medium font-sans">{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Asset Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#475569] font-sans">Instrument</label>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
                    <StockLogo ticker={selectedSymbol} size="sm" />
                    <span className="text-[10px] font-bold text-[#0F172A] font-mono">{selectedSymbol}</span>
                  </div>
                </div>
                <select
                  value={selectedSymbol}
                  onChange={(e) => onSelectSymbol(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white cursor-pointer transition"
                >
                  {symbols.map((s) => (
                    <option key={s.ticker} value={s.ticker} className="bg-white text-[#0F172A]">
                      {s.ticker} • {s.name} (₹{Number(s.latest_price || 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Side toggle BUY / SELL */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer active:scale-98 ${
                    side === 'BUY'
                      ? 'bg-[#10B981] text-white font-extrabold shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-2 text-xs font-bold rounded-lg transition cursor-pointer active:scale-98 ${
                    side === 'SELL'
                      ? 'bg-[#F43F5E] text-white font-extrabold shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>

              {/* Order Type Pill Tabs */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Order Type</label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0] text-[10px] font-mono font-medium">
                  {['MARKET', 'LIMIT', 'STOP_LOSS', 'TAKE_PROFIT'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setOrderType(t)}
                      className={`py-1.5 rounded-lg text-center transition cursor-pointer ${
                        orderType === t
                          ? 'bg-white text-[#0284C7] font-bold border border-[#BAE6FD] shadow-xs'
                          : 'text-[#64748B] hover:text-[#0F172A]'
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
                  <label className="text-xs font-semibold text-[#475569] font-sans">Order Size</label>
                  <div className="flex items-center gap-1">
                    {[25, 50, 75, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleQuickPercent(pct)}
                        className="px-2 py-0.5 text-[10px] rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0284C7] border border-[#BAE6FD] font-mono cursor-pointer transition"
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
                    className="w-full pl-3.5 pr-24 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white transition"
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <span className="label-caps text-[#64748B] mr-1 text-[9px]">SHARES</span>
                    <button
                      type="button"
                      onClick={() => stepQuantity(-1)}
                      className="p-1 text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg cursor-pointer transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => stepQuantity(1)}
                      className="p-1 text-[#64748B] hover:text-[#0F172A] bg-white hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg cursor-pointer transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Limit Price if LIMIT or TAKE_PROFIT */}
              {(orderType === 'LIMIT' || orderType === 'TAKE_PROFIT') && (
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Limit Target Price (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder={`Current: ₹${Number(currentSymbolObj?.latest_price || 0).toFixed(2)}`}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white transition"
                    />
                    <span className="absolute right-3.5 top-3 label-caps text-[#64748B]">INR</span>
                  </div>
                </div>
              )}

              {/* Stop Price if STOP_LOSS */}
              {orderType === 'STOP_LOSS' && (
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1 font-sans">Stop Trigger Price (₹)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.05"
                      value={stopPrice}
                      onChange={(e) => setStopPrice(e.target.value)}
                      placeholder={`Current: ₹${Number(currentSymbolObj?.latest_price || 0).toFixed(2)}`}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] font-mono focus:border-[#0284C7] focus:bg-white transition"
                    />
                    <span className="absolute right-3.5 top-3 label-caps text-[#64748B]">INR</span>
                  </div>
                </div>
              )}

              {/* Live Preview Card with Slippage & Fees */}
              {preview && (
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-[#64748B]">
                    <span>Est. Spot Fill:</span>
                    <span className="text-[#0F172A] font-bold">₹{Number(preview.estimated_price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B] financial-sm">
                    <span>Brokerage Commission (0.10%):</span>
                    <span className="text-[#334155]">₹{Number(preview.estimated_commission).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#64748B] financial-sm">
                    <span>Market Impact / Slippage:</span>
                    <span className="text-[#334155]">₹{Number(preview.estimated_slippage).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-1.5 flex justify-between font-bold">
                    <span className="text-[#64748B]">Total Margin Req:</span>
                    <span className="text-[#10B981] financial-md">₹{Number(preview.estimated_total).toFixed(2)}</span>
                  </div>
                  {!preview.can_execute && (
                    <div className="text-[11px] text-[#F43F5E] font-medium pt-1 font-sans">
                      ⚠️ {preview.rejection_reason}
                    </div>
                  )}
                </div>
              )}

              {/* Execution Button */}
              <button
                type="submit"
                disabled={submitLoading || (preview ? !preview.can_execute : false)}
                className={`w-full py-3.5 rounded-xl font-black text-xs transition cursor-pointer active:scale-98 disabled:opacity-40 flex flex-col items-center justify-center ${
                  side === 'BUY'
                    ? 'btn-buy-primary'
                    : 'btn-sell-primary'
                }`}
              >
                <span>{submitLoading ? 'Routing Order...' : `CONFIRM ${side} • ${quantity} ${selectedSymbol}`}</span>
                {preview && (
                  <span className="financial-sm opacity-90 mt-0.5">
                    Est. Outlay ₹{Number(preview.estimated_total).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Tabbed Tables: Positions, Open Orders, Trade Ledger */}
        <div className="glass-panel p-5 lg:col-span-2 flex flex-col justify-between bg-white border border-[#E2E8F0] rounded-2xl shadow-sm">
          <div>
            {/* Pill Tab Track */}
            <div className="flex items-center gap-2 mb-4 bg-[#F1F5F9] p-1.5 rounded-xl border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveTab('positions')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  activeTab === 'positions'
                    ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Positions ({portfolio?.holdings?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Order Book ({orders.filter((o) => o.status === 'PENDING').length} Open)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trades')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                  activeTab === 'trades'
                    ? 'bg-white text-[#0284C7] border border-[#BAE6FD] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A]'
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
                    <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
                      <th className="pb-2.5">Asset</th>
                      <th className="pb-2.5">Shares</th>
                      <th className="pb-2.5">Avg Buy</th>
                      <th className="pb-2.5">Spot Price</th>
                      <th className="pb-2.5">Market Value</th>
                      <th className="pb-2.5">Unrealized P&L</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                      portfolio.holdings.map((h) => {
                        const isUp = h.unrealized_pnl >= 0;
                        return (
                          <tr key={h.id} className="hover:bg-[#F8FAFC] h-10 transition">
                            <td className="py-2.5 font-bold text-[#0F172A]">
                              <div className="flex items-center gap-2">
                                <StockLogo ticker={h.ticker} size="sm" />
                                <div>
                                  <span>{h.ticker}</span>
                                  <span className="block text-[10px] text-[#64748B] font-normal font-sans">{h.sector}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-[#334155]">{Number(h.quantity).toFixed(0)}</td>
                            <td className="py-2.5 text-[#64748B]">₹{Number(h.average_buy_price).toFixed(2)}</td>
                            <td className="py-2.5 font-semibold text-[#0F172A]">₹{Number(h.current_price).toFixed(2)}</td>
                            <td className="py-2.5 text-[#334155]">₹{Number(h.market_value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td className={`py-2.5 font-bold ${isUp ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                              {isUp ? '+' : ''}₹{Number(h.unrealized_pnl).toFixed(2)} ({Number(h.unrealized_pnl_pct || 0).toFixed(2)}%)
                            </td>
                            <td className="py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectSymbol(h.ticker);
                                  setSide('SELL');
                                  setQuantity(Number(h.quantity).toString());
                                }}
                                className="px-3 py-1 text-[11px] font-bold rounded-lg bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#BE123C] border border-[#F43F5E]/30 transition cursor-pointer"
                              >
                                Close
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <img
                              src="/images/empty-state.jpg"
                              alt="No open positions"
                              className="w-36 h-28 object-cover rounded-xl border border-[#E2E8F0] shadow-xs"
                            />
                            <div>
                              <p className="font-bold text-sm text-[#0F172A] font-sans">Trading Blotter is Ready</p>
                              <p className="text-xs text-[#64748B] font-sans mt-0.5">
                                No active positions in this portfolio book. Route an order on the left!
                              </p>
                            </div>
                          </div>
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
                    <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
                      <th className="pb-2.5">Timestamp</th>
                      <th className="pb-2.5">Symbol</th>
                      <th className="pb-2.5">Type</th>
                      <th className="pb-2.5">Side</th>
                      <th className="pb-2.5">Qty</th>
                      <th className="pb-2.5">Price</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {orders.length > 0 ? (
                      orders.map((o) => (
                        <tr
                          key={o.id}
                          className={`h-10 transition ${
                            o.side === 'BUY' ? 'hover:bg-[#10B981]/5' : 'hover:bg-[#F43F5E]/5'
                          }`}
                        >
                          <td className="py-2.5 text-[#64748B] text-[11px]">{new Date(o.created_at).toLocaleTimeString()}</td>
                          <td className="py-2.5 font-bold text-[#0F172A]">{o.ticker}</td>
                          <td className="py-2.5 text-[#64748B]">{o.order_type}</td>
                          <td className={`py-2.5 font-bold ${o.side === 'BUY' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                            {o.side}
                          </td>
                          <td className="py-2.5 text-[#334155]">{Number(o.quantity).toFixed(0)}</td>
                          <td className="py-2.5 text-[#334155]">
                            {o.price ? `₹${Number(o.price).toFixed(2)}` : 'Market'}
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === 'FILLED'
                                  ? 'bg-[#10B981]/10 text-[#047857] border border-[#10B981]/30'
                                  : o.status === 'PENDING'
                                  ? 'bg-[#F59E0B]/10 text-[#B45309] border border-[#F59E0B]/30'
                                  : 'bg-[#F43F5E]/10 text-[#BE123C] border border-[#F43F5E]/30'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {o.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(o.id)}
                                className="p-1 text-[#64748B] hover:text-[#F43F5E] rounded-lg hover:bg-[#F43F5E]/10 transition cursor-pointer"
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
                        <td colSpan={8} className="py-10 text-center text-[#64748B] text-xs font-sans">
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
                    <tr className="text-[#64748B] border-b border-[#E2E8F0] label-caps">
                      <th className="pb-2.5">Timestamp</th>
                      <th className="pb-2.5">Symbol</th>
                      <th className="pb-2.5">Side</th>
                      <th className="pb-2.5">Qty</th>
                      <th className="pb-2.5">Fill Price</th>
                      <th className="pb-2.5">Fee + Slip</th>
                      <th className="pb-2.5">Realized P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {trades.length > 0 ? (
                      trades.map((t) => (
                        <tr key={t.id} className="hover:bg-[#F8FAFC] h-10 transition">
                          <td className="py-2.5 text-[#64748B] text-[11px]">
                            {new Date(t.executed_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 font-bold text-[#0F172A]">{t.ticker}</td>
                          <td className={`py-2.5 font-bold ${t.side === 'BUY' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                            {t.side}
                          </td>
                          <td className="py-2.5 text-[#334155]">{Number(t.quantity).toFixed(0)}</td>
                          <td className="py-2.5 font-semibold text-[#0F172A]">₹{Number(t.execution_price).toFixed(2)}</td>
                          <td className="py-2.5 text-[#64748B]">₹{(Number(t.commission) + Number(t.slippage)).toFixed(2)}</td>
                          <td
                            className={`py-2.5 font-bold ${
                              Number(t.realized_pnl) > 0
                                ? 'text-[#10B981]'
                                : Number(t.realized_pnl) < 0
                                ? 'text-[#F43F5E]'
                                : 'text-[#64748B]'
                            }`}
                          >
                            ₹{Number(t.realized_pnl).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-[#64748B] text-xs font-sans">
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
