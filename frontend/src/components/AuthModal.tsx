import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Shield, TrendingUp, Sparkles, Activity } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'trader' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin(role);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="card-level-2 w-full max-w-md p-6 bg-[#FFFFFF] border border-[#CBD5E1] rounded-2xl shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#64748B] hover:text-[#0F172A] rounded-lg hover:bg-[#F1F5F9] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0284C7] to-[#0369A1] flex items-center justify-center text-white shadow-md shadow-[#0284C7]/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#0F172A] font-sans tracking-tight">
              PORTFOLIX
            </h2>
            <span className="text-[10px] text-[#0284C7] font-mono tracking-wider label-caps font-bold">
              TRADING DESK ACCESS
            </span>
          </div>
        </div>
        <p className="text-xs text-[#64748B] mb-6 font-sans">
          {isRegister ? 'Register an institutional quantitative paper trading account' : 'Sign in to access your trading desk, books & live market stream'}
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] text-xs font-mono">
            {error}
          </div>
        )}

        {/* 1-Click Instant Demo Logins */}
        <div className="mb-6 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="text-[11px] font-bold text-[#334155] mb-2.5 flex items-center gap-1.5 font-sans">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            Instant 1-Click Simulated Access
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemo('trader')}
              disabled={loading}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center gap-2 transition cursor-pointer active:scale-98 shadow-xs"
            >
              <img
                src="/images/trader-avatar.jpg"
                alt="Quant Trader"
                className="w-5 h-5 rounded-full object-cover border border-[#A7F3D0]"
              />
              Quant Trader
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={loading}
              className="px-3 py-2 text-xs font-bold rounded-xl bg-[#F0F9FF] hover:bg-[#E0F2FE] border border-[#BAE6FD] text-[#0284C7] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98 shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              Desk Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1 font-sans">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Arnav Sharma"
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0284C7]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1 font-sans">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@portfolix.io"
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] mb-1 font-sans">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs text-[#0F172A] placeholder-[#94A3B8] focus:border-[#0284C7]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cyan-primary py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-sm"
          >
            {loading ? (
              <span className="animate-pulse">Authorizing...</span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In to Terminal'
            )}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#64748B] font-sans">
          {isRegister ? 'Already have an institutional profile?' : "Don't have an account yet?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-[#0284C7] hover:underline font-bold cursor-pointer ml-1"
          >
            {isRegister ? 'Sign In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
