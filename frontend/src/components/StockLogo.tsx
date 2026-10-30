import React from 'react';
import {
  TrendingUp,
  Cpu,
  Building2,
  Zap,
  Car,
  Pill,
  Radio,
  ShoppingBag,
  Flame,
  Shield,
  Layers,
} from 'lucide-react';

interface StockLogoProps {
  ticker: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const STOCK_META: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ElementType; label: string }
> = {
  RELIANCE: {
    bg: 'bg-gradient-to-tr from-[#DC2626]/10 to-[#1E3A8A]/10',
    text: 'text-[#DC2626]',
    border: 'border-[#DC2626]/30',
    icon: Flame,
    label: 'RIL',
  },
  TCS: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#6366F1]/15',
    text: 'text-[#0284C7]',
    border: 'border-[#0284C7]/30',
    icon: Cpu,
    label: 'TCS',
  },
  INFY: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#3B82F6]/15',
    text: 'text-[#2563EB]',
    border: 'border-[#2563EB]/30',
    icon: Cpu,
    label: 'INFY',
  },
  HDFCBANK: {
    bg: 'bg-gradient-to-tr from-[#1E40AF]/15 to-[#DC2626]/15',
    text: 'text-[#1E40AF]',
    border: 'border-[#1E40AF]/30',
    icon: Building2,
    label: 'HDFC',
  },
  ICICIBANK: {
    bg: 'bg-gradient-to-tr from-[#EA580C]/15 to-[#991B1B]/15',
    text: 'text-[#EA580C]',
    border: 'border-[#EA580C]/30',
    icon: Building2,
    label: 'ICICI',
  },
  SBIN: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#0369A1]/15',
    text: 'text-[#0369A1]',
    border: 'border-[#0369A1]/30',
    icon: Building2,
    label: 'SBI',
  },
  KOTAKBANK: {
    bg: 'bg-gradient-to-tr from-[#DC2626]/15 to-[#1D4ED8]/15',
    text: 'text-[#DC2626]',
    border: 'border-[#DC2626]/30',
    icon: Building2,
    label: 'KOTAK',
  },
  AXISBANK: {
    bg: 'bg-gradient-to-tr from-[#991B1B]/15 to-[#BE123C]/15',
    text: 'text-[#991B1B]',
    border: 'border-[#991B1B]/30',
    icon: Building2,
    label: 'AXIS',
  },
  BAJFINANCE: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#0EA5E9]/15',
    text: 'text-[#0284C7]',
    border: 'border-[#BAE6FD]',
    icon: Shield,
    label: 'BAJAJ',
  },
  LT: {
    bg: 'bg-gradient-to-tr from-[#D97706]/15 to-[#1E3A8A]/15',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    icon: Layers,
    label: 'L&T',
  },
  TATAMOTORS: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#1E40AF]/15',
    text: 'text-[#0284C7]',
    border: 'border-[#0284C7]/30',
    icon: Car,
    label: 'TATA',
  },
  MARUTI: {
    bg: 'bg-gradient-to-tr from-[#DC2626]/15 to-[#1E3A8A]/15',
    text: 'text-[#DC2626]',
    border: 'border-[#DC2626]/30',
    icon: Car,
    label: 'MSIL',
  },
  BHARTIARTL: {
    bg: 'bg-gradient-to-tr from-[#DC2626]/15 to-[#F43F5E]/15',
    text: 'text-[#E11D48]',
    border: 'border-[#FDA4AF]',
    icon: Radio,
    label: 'AIRTEL',
  },
  HCLTECH: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#06B6D4]/15',
    text: 'text-[#0891B2]',
    border: 'border-[#A5F3FC]',
    icon: Cpu,
    label: 'HCL',
  },
  ITC: {
    bg: 'bg-gradient-to-tr from-[#D97706]/15 to-[#15803D]/15',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
    icon: ShoppingBag,
    label: 'ITC',
  },
  NESTLEIND: {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#0284C7]/25',
    text: 'text-[#0369A1]',
    border: 'border-[#BAE6FD]',
    icon: ShoppingBag,
    label: 'NEST',
  },
  ASIANPAINT: {
    bg: 'bg-gradient-to-tr from-[#DC2626]/15 to-[#F59E0B]/15',
    text: 'text-[#D97706]',
    border: 'border-[#FDE68A]',
    icon: ShoppingBag,
    label: 'APNT',
  },
  SUNPHARMA: {
    bg: 'bg-gradient-to-tr from-[#EA580C]/15 to-[#D97706]/15',
    text: 'text-[#EA580C]',
    border: 'border-[#FDBA74]',
    icon: Pill,
    label: 'SUN',
  },
  NTPC: {
    bg: 'bg-gradient-to-tr from-[#16A34A]/15 to-[#0284C7]/15',
    text: 'text-[#15803D]',
    border: 'border-[#BBF7D0]',
    icon: Zap,
    label: 'NTPC',
  },
  POWERGRID: {
    bg: 'bg-gradient-to-tr from-[#0891B2]/15 to-[#16A34A]/15',
    text: 'text-[#0E7490]',
    border: 'border-[#A5F3FC]',
    icon: Zap,
    label: 'PGRID',
  },
};

export const StockLogo: React.FC<StockLogoProps> = ({
  ticker,
  size = 'md',
  className = '',
}) => {
  const meta = STOCK_META[ticker.toUpperCase()] || {
    bg: 'bg-gradient-to-tr from-[#0284C7]/15 to-[#8B5CF6]/15',
    text: 'text-[#0284C7]',
    border: 'border-[#BAE6FD]',
    icon: TrendingUp,
    label: ticker.slice(0, 3),
  };

  const Icon = meta.icon;

  const sizeClasses = {
    sm: 'w-6 h-6 text-[9px] rounded-md',
    md: 'w-8 h-8 text-[11px] rounded-lg',
    lg: 'w-10 h-10 text-xs rounded-xl',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center font-bold font-mono tracking-tight shrink-0 border shadow-2xs ${meta.bg} ${meta.text} ${meta.border} ${sizeClasses} ${className}`}
      title={ticker}
    >
      <Icon className={iconSizes} />
    </div>
  );
};

