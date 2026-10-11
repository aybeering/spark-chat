import React, { useState, useRef, useEffect } from 'react';
import { 
  MatchedPartner, 
  CollaborationProfile, 
  SolanaWalletState 
} from '../types/profile';
import { 
  RotateCw, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  ExternalLink, 
  Coins, 
  CheckCircle2, 
  TrendingUp, 
  Building2, 
  MapPin, 
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeMatchingPayment } from '../services/solanaService';

interface MatchingCarouselProps {
  userProfile: CollaborationProfile;
  matches: MatchedPartner[];
  onInvitePartner: (partner: MatchedPartner) => void;
  walletState: SolanaWalletState;
  setWalletState: React.Dispatch<React.SetStateAction<SolanaWalletState>>;
  onRefreshMatches: () => Promise<void>;
  isRefreshing: boolean;
}

export const MatchingCarousel: React.FC<MatchingCarouselProps> = ({
  userProfile,
  matches,
  onInvitePartner,
  walletState,
  setWalletState,
  onRefreshMatches,
  isRefreshing
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [txToast, setTxToast] = useState<{ sig: string; amount: number } | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const miniSelectorRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<number | null>(null);

  // Smoothly center a card by index
  const scrollToCard = (index: number, smooth = true) => {
    if (index < 0 || index >= matches.length) return;
    setCurrentIndex(index);
    isProgrammaticScroll.current = true;

    const targetCard = cardRefs.current[index];
    const container = scrollContainerRef.current;
    if (targetCard && container) {
      const cardCenterOffset = targetCard.offsetLeft + targetCard.offsetWidth / 2;
      const containerHalfWidth = container.clientWidth / 2;
      const targetScrollLeft = Math.max(0, cardCenterOffset - containerHalfWidth);

      container.scrollTo({
        left: targetScrollLeft,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }

    scrollMiniSelector(index);

    if (scrollTimeout.current) window.clearTimeout(scrollTimeout.current);
    scrollTimeout.current = window.setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 600);
  };

  const scrollMiniSelector = (index: number) => {
    if (!miniSelectorRef.current) return;
    const chips = miniSelectorRef.current.children;
    if (chips[index]) {
      const chipEl = chips[index] as HTMLElement;
      chipEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % matches.length;
    scrollToCard(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + matches.length) % matches.length;
    scrollToCard(prevIdx);
  };

  // High precision scroll listener to detect center card in real time
  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    if (closestIndex !== currentIndex) {
      setCurrentIndex(closestIndex);
      scrollMiniSelector(closestIndex);
    }
  };

  const toggleFlip = (partnerId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [partnerId]: !prev[partnerId]
    }));
  };

  // Trigger Solana Web3 fee deduction to refresh matches
  const handleSolanaReroll = async () => {
    setErrorToast(null);
    const result = executeMatchingPayment(walletState, 0.02, 'MATCH_UNLOCK');
    if (!result.success) {
      setErrorToast(result.error || 'Solana 交易失败');
      return;
    }

    setWalletState(result.newState);
    if (result.signature) {
      setTxToast({ sig: result.signature, amount: 0.02 });
      setTimeout(() => setTxToast(null), 5000);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }

    await onRefreshMatches();
    scrollToCard(0);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCard(0, false);
    }, 150);
    return () => clearTimeout(timer);
  }, [matches]);

  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        正在为您遴选本周候选合作者...
      </div>
    );
  }

  const currentPartner = matches[currentIndex] || matches[0];

  return (
    <div className="space-y-2.5 sm:space-y-4">
      {/* 1. Header with Weekly Algorithm Status & Solana Gas Token Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-md">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span>选择一个，预约交流</span>
          </h2>
        </div>

        {/* Refresh with SOL Fee button */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block leading-tight">撮合微支付</span>
            <span className="text-[11px] sm:text-xs font-semibold text-indigo-300">0.02 SOL</span>
          </div>

          <button
            onClick={handleSolanaReroll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="去中心化验证并消耗 0.02 SOL 重新遴选 5 位高契合商业伙伴"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRefreshing ? '验证中...' : '重新遴选 (0.02 SOL)'}</span>
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Transaction Success Toast */}
      {txToast && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              扣费成功！已消耗 {txToast.amount} SOL，算法已刷新匹配池。
            </span>
          </div>
          <a
            href={`https://explorer.solana.com/tx/${txToast.sig}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 underline hover:text-white shrink-0 ml-2"
          >
            <span>链上凭证</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
          {errorToast}
        </div>
      )}

      {/* 2. Top Mobile Scroll Selector Strip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-full text-indigo-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{currentIndex + 1} / 5</span>
            </div>
            <span className="text-xs text-slate-200 font-bold truncate max-w-[140px] sm:max-w-none">
              {currentPartner.name} · {currentPartner.title}
            </span>
            <span className="text-[11px] text-pink-400 font-black">
              {currentPartner.matchScore}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-all active:scale-95"
              title="上一位伙伴"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white text-xs transition-all active:scale-95"
              title="下一位伙伴"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 5-Avatar Quick Tap Bar */}
        <div
          ref={miniSelectorRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none snap-x px-0.5"
        >
          {matches.map((m, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={m.id}
                onClick={() => scrollToCard(idx)}
                className={`shrink-0 snap-center flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-200 text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-950 to-indigo-900/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500/40 text-white'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 opacity-75'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className={`w-6 h-6 rounded-lg object-cover border ${
                      isActive ? 'border-indigo-400' : 'border-slate-700'
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold truncate max-w-[60px]">
                      {m.name}
                    </span>
                    <span className="text-[10px] font-black text-pink-400">
                      {m.matchScore}%
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN SCROLLABLE CARDS VIEWPORT TRACK (items-start ensures natural, compact height without stretching voids) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth pt-1 pb-1.5 gap-3.5 sm:gap-5 scrollbar-none items-start px-[7vw] sm:px-2 -mx-3 sm:mx-0 overscroll-x-contain"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {matches.map((partner, idx) => {
          const isActive = idx === currentIndex;
          const isFlipped = !!flippedCards[partner.id];

          return (
            <div
              key={partner.id}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              onClick={() => {
                if (!isActive) scrollToCard(idx);
              }}
              className={`w-[85vw] sm:w-[560px] lg:w-[620px] shrink-0 snap-center transition-all duration-300 ${
                isActive
                  ? 'opacity-100 scale-100 cursor-default'
                  : 'opacity-65 scale-[0.97] hover:opacity-85 cursor-pointer'
              }`}
            >
              {/* 3D Perspective Card Wrapper */}
              <div className="perspective-1000 w-full">
                <div
                  className={`w-full bg-slate-900 border-2 rounded-2xl sm:rounded-3xl shadow-xl relative transition-all duration-300 flex flex-col ${
                    isActive
                      ? 'border-indigo-500/70 shadow-indigo-500/15 ring-1 ring-indigo-500/30'
                      : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Top Banner: Partner Avatar, Details, Match % & 3D Flip Action */}
                  <div className="p-3.5 sm:p-4 pb-2.5 sm:pb-3 border-b border-slate-800/80 relative z-10">
                    <div className="flex items-start justify-between gap-2.5">
                      {/* Avatar & Core Meta */}
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={partner.avatar}
                            alt={partner.name}
                            className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold border border-slate-950">
                            ✓
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-base sm:text-lg font-black text-white truncate">
                              {partner.name}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate max-w-[140px] sm:max-w-none">
                              {partner.title}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 truncate max-w-[150px] sm:max-w-none">
                              <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate">{partner.company}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                              {partner.city}
                            </span>
                            <span className="text-slate-500">·</span>
                            <span>{partner.yearsOfExperience}</span>
                          </div>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1">
                          <Flame className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                          <span className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300">
                            {partner.matchScore}%
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium block">双向契合</span>
                      </div>
                    </div>

                    {/* Sub-header row: Taboo badge & 3D Flip toggle button */}
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px] sm:text-[11px] font-medium truncate">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">排斥词 0 冲突 · 禁忌安全通过</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFlip(partner.id);
                        }}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 text-[10px] sm:text-[11px] font-semibold transition-all flex items-center gap-1 shrink-0 shadow-sm"
                        title="3D翻转卡片查看完整自述"
                      >
                        <Layers className="w-3 h-3 text-indigo-400" />
                        <span>{isFlipped ? '返回契合分析' : '3D翻面看自述'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Card Body - Front vs Back (Compact, adapted spacing for every card) */}
                  <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                    {!isFlipped ? (
                      /* FRONT: AI Analysis, Radar, Two-way synergy & Icebreakers */
                      <div className="space-y-2.5 sm:space-y-3 animate-in fade-in duration-200">
                        {/* AI Match Reason Highlight */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                          <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1 mb-0.5">
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            AI 分析师撮合理由：
                          </span>
                          <p className="text-xs text-slate-200 leading-snug font-medium">
                            {partner.matchReason}
                          </p>
                        </div>

                        {/* 5-Dimensional Complementary Radar Bars (Single compact row on all screens) */}
                        {(() => {
                          const radar = partner.complementaryRadar || {
                            resourceFit: 92,
                            capabilityFit: 94,
                            demandSupplyFit: 95,
                            credibility: 90,
                            tabooSafety: 100
                          };
                          const theyOffer = partner.whyMatch?.theyOfferWhatYouSeek || ['核心业务与产业链资源', '行业渠道落地支持'];
                          const youOffer = partner.whyMatch?.youOfferWhatTheySeek || ['商业渠道与数字化能力', '前沿架构赋能'];
                          const scenarios = partner.whyMatch?.suggestedScenarios || ['探讨双方核心业务协同', '落地合作方案细化'];

                          return (
                            <>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-[10px] sm:text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3 text-indigo-400" />
                                    五维商业契合度深度拆解
                                  </h4>
                                  <span className="text-[9px] text-slate-500 font-mono">
                                    加权综合: {partner.matchScore || 90}%
                                  </span>
                                </div>

                                <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-400 truncate">资源</div>
                                    <div className="text-[11px] font-black text-indigo-400">
                                      {radar.resourceFit}%
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-indigo-500 h-full rounded-full"
                                        style={{ width: `${radar.resourceFit}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-400 truncate">能力</div>
                                    <div className="text-[11px] font-black text-purple-400">
                                      {radar.capabilityFit}%
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-purple-500 h-full rounded-full"
                                        style={{ width: `${radar.capabilityFit}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-400 truncate">供需</div>
                                    <div className="text-[11px] font-black text-pink-400">
                                      {radar.demandSupplyFit}%
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-pink-500 h-full rounded-full"
                                        style={{ width: `${radar.demandSupplyFit}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-400 truncate">背书</div>
                                    <div className="text-[11px] font-black text-amber-400">
                                      {radar.credibility}%
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-amber-500 h-full rounded-full"
                                        style={{ width: `${radar.credibility}%` }}
                                      />
                                    </div>
                                  </div>

                                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-center">
                                    <div className="text-[10px] text-slate-400 truncate">安全</div>
                                    <div className="text-[11px] font-black text-emerald-400">
                                      {radar.tabooSafety}%
                                    </div>
                                    <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                      <div
                                        className="bg-emerald-500 h-full rounded-full"
                                        style={{ width: `${radar.tabooSafety}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Two-Way Synergy Points (供需对照 - 严谨适配2条核心成果，高度统一) */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mb-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>对方能为您提供：</span>
                                  </div>
                                  {theyOffer.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug">
                                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                                      <span className="line-clamp-2">{item}</span>
                                    </div>
                                  ))}
                                </div>

                                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 mb-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <span>您能为对方赋能：</span>
                                  </div>
                                  {youOffer.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-snug">
                                      <span className="text-indigo-400 font-bold shrink-0">★</span>
                                      <span className="line-clamp-2">{item}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Suggested Collaboration Scenarios */}
                              <div className="p-2 sm:p-2.5 rounded-xl bg-slate-950/50 border border-slate-800">
                                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block mb-1">
                                  建议切入落地合作场景（Phone Chat 破冰议题）：
                                </span>
                                <div className="space-y-1">
                                  {scenarios.slice(0, 2).map((sc, i) => (
                                    <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5 leading-snug">
                                      <span className="text-purple-400 font-mono shrink-0">0{i + 1}.</span>
                                      <span className="line-clamp-1 sm:line-clamp-none">{sc}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    ) : (
                      /* BACK: Full Collaboration Profile Details */
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                          <span className="font-bold text-indigo-300">权威信任背书：</span>
                          <p className="mt-0.5 text-slate-200 italic leading-snug">“{partner.profile.endorsement?.summary}”</p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-300">核心能力描述 (第一人称)：</span>
                          <p className="text-xs text-slate-300 leading-snug bg-slate-950/70 p-2 rounded-xl border border-slate-800 line-clamp-3">
                            {partner.profile.capability?.content}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-300">商业资源规模：</span>
                          <p className="text-xs text-slate-300 leading-snug bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                            {partner.profile.resources?.scale}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-300">第一人称供需意向：</span>
                          <p className="text-xs text-slate-300 leading-snug whitespace-pre-line bg-slate-950/70 p-2 rounded-xl border border-slate-800 max-h-24 overflow-y-auto">
                            {partner.profile.intent?.content}
                          </p>
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-rose-300">合作禁忌与排斥条件：</span>
                          <p className="text-xs text-rose-300/90 leading-snug bg-rose-950/20 p-2 rounded-xl border border-rose-500/20">
                            {partner.profile.taboo?.content}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-3 sm:p-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 bg-slate-950/40 rounded-b-2xl sm:rounded-b-3xl">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                      <div className="text-[11px] text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>通话预留: {partner.phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {partner.invitationStatus === 'scheduled' ? (
                          <div className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>已约定会谈并同步至日历</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onInvitePartner(partner);
                            }}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>一键发起 Phone Chat 邀约</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Bottom Pagination Indicator Dots (Tight, immediate spacing right under cards) */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5 pb-1">
        {matches.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollToCard(idx)}
            className={`transition-all rounded-full ${
              currentIndex === idx
                ? 'w-5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm'
                : 'w-1.5 h-1.5 bg-slate-700 hover:bg-slate-500'
            }`}
            title={`滑动至第 ${idx + 1} 位`}
          />
        ))}
      </div>
    </div>
  );
};
