export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'admin' | 'trader' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface SymbolData {
  id: number;
  ticker: string;
  name: string;
  sector?: string;
  industry?: string;
  exchange: string;
  currency: string;
  is_active: boolean;
  latest_price?: number;
  change_pct_1d?: number;
  volume_1d?: number;
}

export interface SymbolDetail extends SymbolData {
  first_date?: string;
  last_date?: string;
  total_records?: number;
  min_price_all_time?: number;
  max_price_all_time?: number;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  symbol: string;
  timeframe: string;
  indicators: {
    sma?: Array<{ date: string; sma20?: number; sma50?: number; sma200?: number }>;
    ema?: Array<{ date: string; ema12?: number; ema26?: number }>;
    rsi?: Array<{ date: string; value?: number }>;
    macd?: Array<{ date: string; macd?: number; signal?: number; hist?: number }>;
    bollinger?: Array<{ date: string; upper?: number; middle?: number; lower?: number }>;
    atr?: Array<{ date: string; value?: number }>;
    stochastic?: Array<{ date: string; k?: number; d?: number }>;
    vwap?: Array<{ date: string; value?: number }>;
    obv?: Array<{ date: string; value?: number }>;
  };
}

export interface MarketStats {
  symbol: string;
  mean_daily_return: number;
  annualized_return: number;
  annualized_volatility: number;
  max_drawdown: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  beta_vs_benchmark: number;
  skewness: number;
  kurtosis: number;
  current_rsi_14?: number;
  current_sma_50?: number;
  current_sma_200?: number;
}

export interface CorrelationMatrix {
  symbols: string[];
  matrix: number[][];
  start_date: string;
  end_date: string;
}

export interface Holding {
  id: number;
  symbol_id: number;
  ticker: string;
  name: string;
  sector?: string;
  quantity: number;
  average_buy_price: number;
  current_price: number;
  market_value: number;
  total_invested: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  weight_pct: number;
}

export interface Portfolio {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  initial_cash: number;
  cash_balance: number;
  holdings_value: number;
  total_equity: number;
  total_pnl: number;
  total_pnl_pct: number;
  realized_pnl: number;
  unrealized_pnl: number;
  currency: string;
  created_at: string;
  updated_at: string;
  holdings: Holding[];
}

export interface RiskMetrics {
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown: number;
  annualized_return: number;
  annualized_volatility: number;
  var_95_parametric: number;
  var_95_historical: number;
  cvar_95_historical: number;
  beta: number;
  alpha: number;
  r_squared: number;
}

export interface PerformancePoint {
  date: string;
  portfolio_equity: number;
  benchmark_equity: number;
  portfolio_return_pct: number;
  benchmark_return_pct: number;
}

export interface PortfolioPerformance {
  portfolio_id: number;
  start_date: string;
  end_date: string;
  equity_curve: PerformancePoint[];
  monthly_returns: Array<{ year: number; month: number; return_pct: number }>;
  risk_metrics: RiskMetrics;
}

export interface Order {
  id: number;
  portfolio_id: number;
  symbol_id: number;
  ticker: string;
  symbol_name: string;
  order_type: string;
  side: 'BUY' | 'SELL';
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED' | 'REJECTED';
  quantity: number;
  filled_quantity: number;
  price?: number;
  stop_price?: number;
  time_in_force: string;
  reject_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface Trade {
  id: number;
  order_id: number;
  portfolio_id: number;
  symbol_id: number;
  ticker: string;
  symbol_name: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  execution_price: number;
  commission: number;
  slippage: number;
  realized_pnl: number;
  executed_at: string;
}

export interface OrderPreview {
  symbol: string;
  side: string;
  quantity: number;
  estimated_price: number;
  estimated_gross: number;
  estimated_commission: number;
  estimated_slippage: number;
  estimated_total: number;
  can_execute: boolean;
  rejection_reason?: string;
  cash_balance_before: number;
  cash_balance_after: number;
}

export interface BacktestTrade {
  symbol: string;
  side: string;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  return_pct: number;
  holding_period_days: number;
}

export interface EquityCurveItem {
  date: string;
  equity: number;
  benchmark_equity: number;
  drawdown_pct: number;
  cash: number;
  holdings_value: number;
}

export interface BacktestResult {
  id?: number;
  name: string;
  strategy_type: string;
  symbol: string;
  start_date: string;
  end_date: string;
  initial_cash: number;
  final_equity: number;
  total_return_pct: number;
  benchmark_return_pct: number;
  cagr: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown_pct: number;
  win_rate: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  parameters: Record<string, any>;
  equity_curve: EquityCurveItem[];
  trades: BacktestTrade[];
  monthly_matrix: Array<{ year: number; returns: Record<number, number>; total_year: number }>;
}

export interface OptimizationResponse {
  max_sharpe: {
    weights: Record<string, number>;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  };
  min_variance: {
    weights: Record<string, number>;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  };
  risk_parity: {
    weights: Record<string, number>;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  };
  frontier_curve: Array<{
    volatility: number;
    expected_return: number;
    sharpe: number;
    weights: Record<string, number>;
  }>;
}

export interface ForecastResponse {
  symbol: string;
  model_type: string;
  forecast_horizon_days: number;
  train_end_date: string;
  forecast_end_date: string;
  current_price: number;
  predicted_target_price: number;
  projected_return_pct: number;
  metrics: {
    rmse: number;
    mae: number;
    mape: number;
    directional_accuracy_pct: number;
    r_squared: number;
    test_samples_count: number;
  };
  series: Array<{
    date: string;
    actual?: number;
    predicted?: number;
    lower_bound?: number;
    upper_bound?: number;
    is_forecast: boolean;
  }>;
  signal: {
    signal_type: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
    confidence_score: number;
    expected_30d_return_pct: number;
    momentum_score: number;
    trend_strength: string;
    summary_reasoning: string;
  };
  disclaimer: string;
}

export interface Alert {
  id: number;
  user_id: number;
  symbol_id: number;
  ticker: string;
  symbol_name: string;
  condition_type: string;
  target_value: number;
  is_triggered: boolean;
  triggered_at?: string;
  is_active: boolean;
  notes?: string;
  created_at: string;
}

export interface Watchlist {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  symbols: string[];
}
