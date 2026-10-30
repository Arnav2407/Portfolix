import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Navbar, BgTheme } from './components/Navbar';
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
  const [bgTheme, setBgTheme] = useState<BgTheme>(() => {
    return (localStorage.getItem('portfolix_bg_theme') as BgTheme) || 'sky';
  });

  const handleSelectBgTheme = (theme: BgTheme) => {
    setBgTheme(theme);
    localStorage.setItem('portfolix_bg_theme', theme);
  };

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

  const bgStyles = {
    sky: {
      bg: 'bg-[#F0F7FD]',
      glow1: 'from-[#0284C7]/15 to-[#38BDF8]/8',
      glow2: 'from-[#10B981]/12 to-[#34D399]/6',
      glow3: 'from-[#8B5CF6]/9 to-[#A855F7]/4',
      glow4: 'from-[#0284C7]/12 to-[#0EA5E9]/6',
    },
    mint: {
      bg: 'bg-[#F0FDF4]',
      glow1: 'from-[#10B981]/16 to-[#34D399]/8',
      glow2: 'from-[#0284C7]/12 to-[#38BDF8]/6',
      glow3: 'from-[#059669]/10 to-[#10B981]/5',
      glow4: 'from-[#10B981]/12 to-[#047857]/6',
    },
    violet: {
      bg: 'bg-[#F5F3FF]',
      glow1: 'from-[#8B5CF6]/16 to-[#C084FC]/8',
      glow2: 'from-[#0284C7]/12 to-[#38BDF8]/6',
      glow3: 'from-[#F43F5E]/8 to-[#FB7185]/5',
      glow4: 'from-[#8B5CF6]/12 to-[#7C3AED]/6',
    },
  }[bgTheme];

  return (
    <div className={`min-h-screen ${bgStyles.bg} text-[#0F172A] flex flex-col selection:bg-[#0284C7]/20 selection:text-[#0284C7] font-sans relative overflow-x-hidden transition-colors duration-500`}>
      {/* Light Colored Matching Ambient Glows & Dot Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left soft matching glow */}
        <div className={`absolute -top-32 -left-32 w-[540px] h-[540px] bg-gradient-to-br ${bgStyles.glow1} rounded-full blur-3xl opacity-85 transition-all duration-700`} />
        {/* Top-right soft matching glow */}
        <div className={`absolute top-6 -right-24 w-[480px] h-[480px] bg-gradient-to-bl ${bgStyles.glow2} rounded-full blur-3xl opacity-80 transition-all duration-700`} />
        {/* Mid-screen ambient glow */}
        <div className={`absolute top-1/2 left-1/3 -translate-x-1/2 w-[620px] h-[450px] bg-gradient-to-r ${bgStyles.glow3} rounded-full blur-3xl opacity-75 transition-all duration-700`} />
        {/* Bottom-right soft glow */}
        <div className={`absolute -bottom-28 right-8 w-[520px] h-[520px] bg-gradient-to-tl ${bgStyles.glow4} rounded-full blur-3xl opacity-80 transition-all duration-700`} />
        {/* Subtle Geometric Dot Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
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
          bgTheme={bgTheme}
          onSelectBgTheme={handleSelectBgTheme}
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
        <footer aria-label="Simulation Notice" className="w-full bg-[#FFFFFF]/90 backdrop-blur-md border-t border-[#E2E8F0] py-2 px-4 text-center">
          <p className="financial-sm text-[#64748B]">
            PORTFOLIX • QUANTITATIVE TRADING & ANALYTICS TERMINAL • EDUCATIONAL SIMULATION SOFTWARE • NOT INVESTMENT ADVICE
          </p>
        </footer>
      </div>

      {/* Authentication Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default App;
