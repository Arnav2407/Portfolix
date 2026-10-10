import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';

import { Dashboard } from './pages/Dashboard';
import { MarketExplorer } from './pages/MarketExplorer';
import { TradingTerminal } from './pages/TradingTerminal';
import { Portfolios } from './pages/Portfolios';
import { BacktestStudio } from './pages/BacktestStudio';
import { ForecastStudio } from './pages/ForecastStudio';
import { AlertsWatchlists } from './pages/AlertsWatchlists';
import { Reports } from './pages/Reports';
import { SettingsAdmin } from './pages/SettingsAdmin';

import api from './api/client';
import {
  SymbolData,
  SymbolDetail,
  PricePoint,
  TechnicalIndicators,
  MarketStats,
  CorrelationMatrix,
  Portfolio,
  PortfolioPerformance,
  Order,
} from './types';

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Global State
  const [symbols, setSymbols] = useState<SymbolData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [symbolDetail, setSymbolDetail] = useState<SymbolDetail | null>(null);
  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | null>(null);

  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(null);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [triggeredAlertsCount, setTriggeredAlertsCount] = useState<number>(0);

  // 1. Initial load of symbols and market data
  const fetchMarketData = async () => {
    try {
      const symRes = await api.get<SymbolData[]>('/market/symbols?limit=20');
      setSymbols(symRes.data);
      if (symRes.data.length > 0 && !selectedSymbol) {
        setSelectedSymbol(symRes.data[0].ticker);
      }
    } catch (err) {
      console.error('Failed to fetch market symbols', err);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  // 2. Fetch specific symbol detail, price history, indicators, and stats
  const fetchSymbolDetails = async (ticker: string) => {
    if (!ticker) return;
    try {
      const [detailRes, pricesRes, indRes, statsRes] = await Promise.all([
        api.get<SymbolDetail>(`/market/symbols/${ticker}`),
        api.get<PricePoint[]>(`/market/prices/${ticker}?limit=400`),
        api.get<TechnicalIndicators>(`/market/indicators/${ticker}`),
        api.get<MarketStats>(`/market/stats/${ticker}`),
      ]);
      setSymbolDetail(detailRes.data);
      setPrices(pricesRes.data);
      setIndicators(indRes.data);
      setMarketStats(statsRes.data);
    } catch (err) {
      console.error(`Failed to fetch details for ${ticker}`, err);
    }
  };

  useEffect(() => {
    if (selectedSymbol) {
      fetchSymbolDetails(selectedSymbol);
    }
  }, [selectedSymbol]);

  // 3. Fetch correlations once
  useEffect(() => {
    const fetchCorrelations = async () => {
      try {
        const res = await api.get<CorrelationMatrix>(
          '/market/correlations?symbols=RELIANCE,TCS,HDFCBANK,INFY,ICICIBANK,LT,MARUTI,ITC'
        );
        setCorrelationMatrix(res.data);
      } catch (err) {
        console.error('Failed to fetch correlations', err);
      }
    };
    fetchCorrelations();
  }, []);

  // 4. Fetch user portfolios & performance when authenticated
  const fetchUserPortfolios = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get<Portfolio[]>('/portfolios');
      setPortfolios(res.data);
      if (res.data.length > 0) {
        const currentActive = activePortfolio
          ? res.data.find((p) => p.id === activePortfolio.id) || res.data[0]
          : res.data[0];
        setActivePortfolio(currentActive);

        // Fetch performance
        const perfRes = await api.get<PortfolioPerformance>(`/portfolios/${currentActive.id}/performance`);
        setPerformance(perfRes.data);

        // Fetch recent orders
        const ordersRes = await api.get<Order[]>(`/orders/portfolio/${currentActive.id}?limit=10`);
        setRecentOrders(ordersRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch portfolios', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPortfolios();
    } else {
      setPortfolios([]);
      setActivePortfolio(null);
      setPerformance(null);
      setRecentOrders([]);
    }
  }, [isAuthenticated]);

  const handleSelectPortfolio = async (p: Portfolio) => {
    setActivePortfolio(p);
    try {
      const perfRes = await api.get<PortfolioPerformance>(`/portfolios/${p.id}/performance`);
      setPerformance(perfRes.data);
      const ordersRes = await api.get<Order[]>(`/orders/portfolio/${p.id}?limit=10`);
      setRecentOrders(ordersRes.data);
    } catch (err) {
      console.error('Failed to switch portfolio', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#dde2f6] flex flex-col selection:bg-[#3B82F6]/30 selection:text-white font-sans">
      {/* Educational Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        symbols={symbols}
        portfolios={portfolios}
        activePortfolio={activePortfolio}
        onSelectPortfolio={handleSelectPortfolio}
        triggeredAlertsCount={triggeredAlertsCount}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-5xl">
          {activeTab === 'dashboard' && (
            <Dashboard
              portfolio={activePortfolio}
              performance={performance}
              symbols={symbols}
              recentOrders={recentOrders}
              onNavigateTab={setActiveTab}
              onSelectSymbol={setSelectedSymbol}
            />
          )}

          {activeTab === 'market' && (
            <MarketExplorer
              symbols={symbols}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
              symbolDetail={symbolDetail}
              prices={prices}
              indicators={indicators}
              marketStats={marketStats}
              correlationMatrix={correlationMatrix}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'trade' && (
            <TradingTerminal
              symbols={symbols}
              portfolio={activePortfolio}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
              onRefreshPortfolio={fetchUserPortfolios}
            />
          )}

          {activeTab === 'portfolio' && (
            <Portfolios
              portfolios={portfolios}
              activePortfolio={activePortfolio}
              onSelectPortfolio={handleSelectPortfolio}
              performance={performance}
              symbols={symbols}
              onRefresh={fetchUserPortfolios}
            />
          )}

          {activeTab === 'backtest' && (
            <BacktestStudio
              symbols={symbols}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastStudio
              symbols={symbols}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsWatchlists
              symbols={symbols}
              onSelectSymbol={setSelectedSymbol}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && <Reports portfolio={activePortfolio} />}

          {activeTab === 'settings' && <SettingsAdmin />}
        </main>
      </div>

      {/* Persistent Simulation Disclaimer Footer */}
      <footer aria-label="Simulation Notice" className="w-full bg-[#080E1C] border-t border-[#1F2937] py-2 px-4 text-center">
        <p className="financial-sm text-[#6B7280]">
          Educational simulation software. Not investment advice.
        </p>
      </footer>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default App;
