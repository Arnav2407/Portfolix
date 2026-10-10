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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="card-level-2 w-full max-w-md p-6 bg-[#161F33] border border-[#374151] rounded-2xl shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9CA3AF] hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white font-sans">
            Portfolix QuantEdge
          </h2>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-6 font-sans">
          {isRegister ? 'Create an institutional quantitative simulation account' : 'Sign in to access your portfolio books & paper execution terminal'}
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-mono">
            {error}
          </div>
        )}

        {/* 1-Click Instant Demo Logins */}
        <div className="mb-6 p-3 rounded-lg bg-[#0B0F1A] border border-[#1F2937]">
          <div className="text-[11px] font-medium text-[#9CA3AF] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
            Instant 1-Click Access (No credentials required)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('trader')}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold rounded-md bg-[#22C55E]/15 hover:bg-[#22C55E]/25 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Quant Trader
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              disabled={loading}
              className="px-3 py-2 text-xs font-semibold rounded-md bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/30 text-[#adc6ff] flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98"
            >
              <Shield className="w-3.5 h-3.5" />
              Administrator
            </button>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1F2937]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#161F33] px-2 text-[#9CA3AF]">Or use credentials</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full pl-9 pr-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white placeholder-[#6B7280] focus:border-[#3B82F6]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@portfolix.com"
                className="w-full pl-9 pr-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white placeholder-[#6B7280] focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#9CA3AF] mb-1 font-sans">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#0B0F1A] border border-[#1F2937] rounded-lg text-sm text-white placeholder-[#6B7280] focus:border-[#3B82F6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-xs transition shadow-md shadow-[#3B82F6]/25 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegister ? 'Create Quant Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-[#9CA3AF] hover:text-white transition cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};
