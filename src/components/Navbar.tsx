import React from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Calendar, 
  FileText, 
  Coins, 
  Layers, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Database
} from 'lucide-react';
import { SolanaWalletState } from '../types/profile';

interface NavbarProps {
  activeTab: 'profile' | 'matches' | 'scheduled';
  setActiveTab: (tab: 'profile' | 'matches' | 'scheduled') => void;
  walletState: SolanaWalletState;
  onOpenWalletModal: () => void;
  matchCount: number;
  scheduledCount: number;
  onOpenSavedProfiles?: () => void;
  savedProfilesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  walletState,
  onOpenWalletModal,
  matchCount,
  scheduledCount,
  onOpenSavedProfiles,
  savedProfilesCount = 0
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <span className="font-black text-base sm:text-lg tracking-tight whitespace-nowrap bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  Spark Chat
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  Web3
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-indigo-300/80 font-normal whitespace-nowrap">
                灵感通话一周一次
              </p>
            </div>
          </div>

          {/* Desktop Central Navigation Tabs (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>合作画像档案</span>
            </button>

            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'matches'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${activeTab === 'matches' ? 'animate-spin-slow' : ''}`} />
              <span>每周转动卡片</span>
              <span className="w-5 h-5 rounded-full bg-purple-500/30 text-purple-300 border border-purple-400/30 text-[10px] flex items-center justify-center font-bold">
                {matchCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('scheduled')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === 'scheduled'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>约聊日程</span>
              {scheduledCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 text-[10px] flex items-center justify-center font-bold">
                  {scheduledCount}
                </span>
              )}
            </button>
          </nav>

          {/* Solana Web3 Wallet Button & Storage */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenSavedProfiles && (
              <button
                onClick={onOpenSavedProfiles}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 transition-all text-xs text-slate-300 shadow-sm shrink-0"
                title="查看与管理已留存的简历档案"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">已留存档案</span>
                {savedProfilesCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {savedProfilesCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenWalletModal}
              className="group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-850 transition-all shadow-sm shrink-0"
              title="查看 Solana 去中心化钱包状态与撮合消耗"
            >
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 relative" />
              </div>

              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {walletState.publicKey
                      ? `${walletState.publicKey.substring(0, 4)}...${walletState.publicKey.substring(walletState.publicKey.length - 4)}`
                      : '未连接'}
                  </span>
                  <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-purple-500/20 text-purple-300">
                    {walletState.network}
                  </span>
                </div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  <span>{walletState.balance.toFixed(2)} SOL</span>
                </div>
              </div>

              {/* Mobile compact wallet badge */}
              <div className="sm:hidden flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                <Coins className="w-3 h-3 text-emerald-400" />
                <span>{walletState.balance.toFixed(2)} SOL</span>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Dock) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'profile'
              ? 'text-indigo-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'profile' ? 'bg-indigo-600/20' : ''}`}>
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-[10px]">合作画像</span>
          {activeTab === 'profile' && (
            <span className="w-1 h-1 rounded-full bg-indigo-400 absolute -bottom-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'matches'
              ? 'text-purple-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg relative ${activeTab === 'matches' ? 'bg-purple-600/20' : ''}`}>
            <RotateCw className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-500 text-white text-[9px] flex items-center justify-center font-bold">
              {matchCount}
            </span>
          </div>
          <span className="text-[10px]">5人卡片</span>
          {activeTab === 'matches' && (
            <span className="w-1 h-1 rounded-full bg-purple-400 absolute -bottom-0.5" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('scheduled')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
            activeTab === 'scheduled'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg relative ${activeTab === 'scheduled' ? 'bg-emerald-600/20' : ''}`}>
            <Calendar className="w-4 h-4" />
            {scheduledCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                {scheduledCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">已约日程</span>
          {activeTab === 'scheduled' && (
            <span className="w-1 h-1 rounded-full bg-emerald-400 absolute -bottom-0.5" />
          )}
        </button>
      </nav>
    </>
  );
};
