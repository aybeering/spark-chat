import React, { useState } from 'react';
import { ChatHistoryBadge, CollaborationProfile, MatchedPartner } from '../types/profile';
import { 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  Clock, 
  Calendar, 
  Flame, 
  Trophy, 
  Hash, 
  Building2, 
  User, 
  MessageSquareQuote, 
  ChevronRight,
  X,
  FileCheck2,
  Lock,
  Layers,
  Star
} from 'lucide-react';

interface ChatHistoryBadgesSectionProps {
  badges: ChatHistoryBadge[];
  userProfile?: CollaborationProfile;
  onOpenMintModal?: (partner?: MatchedPartner) => void;
}

export const ChatHistoryBadgesSection: React.FC<ChatHistoryBadgesSectionProps> = ({
  badges,
  userProfile
}) => {
  const [selectedBadge, setSelectedBadge] = useState<ChatHistoryBadge | null>(null);
  const [filterLevel, setFilterLevel] = useState<'all' | 'Diamond' | 'Platinum' | 'Gold'>('all');
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(id);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredBadges = filterLevel === 'all' 
    ? badges 
    : badges.filter(b => b.badgeLevel === filterLevel);

  // Compute aggregate on-chain reputation metrics
  const totalCreditScore = badges.reduce((acc, b) => acc + (b.onChainCredit.creditScoreGain || 0), 450);
  const totalSparkTagsCount = badges.reduce((acc, b) => {
    return acc + (b.partnerToUserSpark.sparkTags.length + b.userToPartnerSpark.sparkTags.length);
  }, 0);

  const getThemeStyles = (color: string) => {
    switch (color) {
      case 'indigo':
        return {
          border: 'border-indigo-500/40 hover:border-indigo-400',
          bg: 'bg-indigo-950/20 hover:bg-indigo-950/30',
          badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          glow: 'shadow-indigo-500/10 hover:shadow-indigo-500/20',
          accent: 'text-indigo-400',
          gradient: 'from-indigo-500/20 via-blue-500/10 to-transparent'
        };
      case 'amber':
        return {
          border: 'border-amber-500/40 hover:border-amber-400',
          bg: 'bg-amber-950/20 hover:bg-amber-950/30',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          glow: 'shadow-amber-500/10 hover:shadow-amber-500/20',
          accent: 'text-amber-400',
          gradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
        };
      case 'purple':
        return {
          border: 'border-purple-500/40 hover:border-purple-400',
          bg: 'bg-purple-950/20 hover:bg-purple-950/30',
          badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
          glow: 'shadow-purple-500/10 hover:shadow-purple-500/20',
          accent: 'text-purple-400',
          gradient: 'from-purple-500/20 via-pink-500/10 to-transparent'
        };
      case 'emerald':
      default:
        return {
          border: 'border-emerald-500/40 hover:border-emerald-400',
          bg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          glow: 'shadow-emerald-500/10 hover:shadow-emerald-500/20',
          accent: 'text-emerald-400',
          gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent'
        };
    }
  };

  const renderBadgeIcon = (iconType: string, themeColor: string) => {
    switch (iconType) {
      case 'trophy':
        return <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${themeColor === 'amber' ? 'text-amber-400' : 'text-indigo-400'}`} />;
      case 'shield':
        return <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />;
      case 'flame':
        return <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />;
      case 'spark':
      default:
        return <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />;
    }
  };

  return (
    <div className="pt-6 sm:pt-8 border-t border-slate-800/80 space-y-4 sm:space-y-6">
      {/* 1. Header Bar with On-Chain Credit Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              过往 Chat 历史勋章 · 链上信用存证
            </h3>
            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SBT Soulbound
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
            历次通话结束后，双方基于深度沟通给予的 <span className="text-amber-300 font-medium">Spark 闪光点互评</span>。评价通过双向多重签名铸造为不可篡改的 Solana Devnet 链上商业声誉资产。
          </p>
        </div>

        {/* 4 Summary Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">链上商誉总分</span>
            <span className="text-sm sm:text-base font-extrabold text-indigo-300 font-mono">
              {totalCreditScore}
              <span className="text-[10px] text-emerald-400 font-normal ml-0.5">AAA</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">已铸造 SBT 勋章</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-300 font-mono">
              {badges.length} <span className="text-[10px] text-slate-400 font-normal">枚</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">闪光点认证项</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-300 font-mono">
              {totalSparkTagsCount} <span className="text-[10px] text-slate-400 font-normal">项</span>
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">双向履约守信率</span>
            <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
              100%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap mr-1">勋章筛选：</span>
          <button
            onClick={() => setFilterLevel('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filterLevel === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            全部 ({badges.length})
          </button>
          <button
            onClick={() => setFilterLevel('Diamond')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterLevel === 'Diamond'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>💎 钻石级</span>
          </button>
          <button
            onClick={() => setFilterLevel('Platinum')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterLevel === 'Platinum'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🔥 白金级</span>
          </button>
          <button
            onClick={() => setFilterLevel('Gold')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              filterLevel === 'Gold'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>🏆 黄金级</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline whitespace-nowrap">
          点击卡片可查看链上多签证明与互评全文
        </span>
      </div>

      {/* 3. Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBadges.map((badge) => {
          const style = getThemeStyles(badge.themeColor);

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`group bg-slate-900/90 border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg relative overflow-hidden flex flex-col justify-between ${style.border} ${style.glow}`}
            >
              {/* Subtle top gradient accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient}`} />

              <div className="space-y-3.5">
                {/* Badge Header: Emblem + Badge Title + Tier */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center p-2.5 border bg-slate-950/80 shadow-md ${style.border}`}>
                      {renderBadgeIcon(badge.badgeIconType, badge.themeColor)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-indigo-300 transition-colors">
                          {badge.badgeName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                          {badge.tierLabel}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {badge.chatDate}
                        </span>
                        <span className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {badge.durationMinutes}分钟通话
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                    +{badge.onChainCredit.creditScoreGain} 信用分
                  </span>
                </div>

                {/* Partner Persona Mini Profile */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={badge.partner.avatar}
                      alt={badge.partner.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200">{badge.partner.name}</span>
                        <span className="text-[11px] text-slate-400">{badge.partner.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">{badge.partner.company}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">公钥联名签名</span>
                    <span className="text-[10px] font-mono text-indigo-300">{badge.partner.walletAddress}</span>
                  </div>
                </div>

                {/* Spark Point Mutual Reviews Showcase */}
                <div className="space-y-2">
                  {/* Partner's Spark Evaluation on User */}
                  <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1 font-semibold">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        对方认可您的 Spark 闪光点：
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {badge.partnerToUserSpark.sparkTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-300 italic line-clamp-2 mt-1">
                      “{badge.partnerToUserSpark.comment}”
                    </p>
                  </div>

                  {/* User's Review on Partner Tags */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
                    <span className="text-slate-500">我对该伙伴互评认证：</span>
                    <div className="flex flex-wrap gap-1">
                      {badge.userToPartnerSpark.sparkTags.slice(0, 2).map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                      {badge.userToPartnerSpark.sparkTags.length > 2 && (
                        <span className="text-[10px] text-slate-500">+{badge.userToPartnerSpark.sparkTags.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom On-Chain Verification Footprint */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono text-slate-400">
                    {badge.onChainCredit.mintAddress}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-indigo-400 group-hover:text-indigo-300 font-semibold text-[11px]">
                  <span>查看链上多签存证</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Detailed On-Chain Credential Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-slate-900 border border-indigo-500/30 flex items-center justify-center p-3 shadow-inner">
                {renderBadgeIcon(selectedBadge.badgeIconType, selectedBadge.themeColor)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {selectedBadge.badgeName}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    SBT 链上已终结
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  完成于 {selectedBadge.chatDate} · 通话时长 {selectedBadge.durationMinutes} 分钟 · 双向闪光点共鸣存证
                </p>
              </div>
            </div>

            {/* Partner Header */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedBadge.partner.avatar}
                  alt={selectedBadge.partner.name}
                  className="w-10 h-10 rounded-xl object-cover border border-indigo-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedBadge.partner.name}
                    <span className="text-xs font-normal text-indigo-300">{selectedBadge.partner.title}</span>
                  </h4>
                  <p className="text-xs text-slate-400">{selectedBadge.partner.company}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">合作行业</span>
                <span className="text-xs font-medium text-slate-300">{selectedBadge.partner.industry}</span>
              </div>
            </div>

            {/* Dual Spark Point Evaluation Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                双方 Spark 闪光点互评档案
              </h4>

              {/* Review 1: Partner to User */}
              <div className="p-3.5 rounded-2xl bg-amber-950/15 border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {selectedBadge.partner.name} 给予您的闪光点评价：
                  </span>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedBadge.partnerToUserSpark.sparkTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-200 border border-amber-500/30"
                    >
                      ✨ {tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  “{selectedBadge.partnerToUserSpark.comment}”
                </p>
              </div>

              {/* Review 2: User to Partner */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/15 border border-indigo-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    您给予 {selectedBadge.partner.name} 的闪光点认证：
                  </span>
                  <div className="flex items-center gap-1 text-indigo-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-indigo-400 text-indigo-400" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedBadge.userToPartnerSpark.sparkTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-200 border border-indigo-500/30"
                    >
                      ⚡ {tag}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                  “{selectedBadge.userToPartnerSpark.comment}”
                </p>
              </div>

              {selectedBadge.collabOutcome && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">商业落地进展备忘：</span>
                    <span className="text-slate-300 ml-1">{selectedBadge.collabOutcome}</span>
                  </div>
                </div>
              )}
            </div>

            {/* On-Chain Technical Credential Parameters */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Solana Devnet 链上不可篡改信用数据 (SBT)
              </h4>

              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">网络与代币标准：</span>
                  <span className="text-slate-300">{selectedBadge.onChainCredit.network} · {selectedBadge.onChainCredit.tokenStandard}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">区块高度 (Block Height)：</span>
                  <span className="text-emerald-400 font-bold">#{selectedBadge.onChainCredit.blockHeight.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">商誉增量贡献：</span>
                  <span className="text-emerald-300 font-bold">+{selectedBadge.onChainCredit.creditScoreGain} 链上信誉分</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">SBT 铸造地址：</span>
                  <span className="text-indigo-300">{selectedBadge.onChainCredit.mintAddress}</span>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                  <span className="text-slate-500 shrink-0">交易签名 (Tx Hash)：</span>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[11px] text-slate-400 truncate max-w-[220px]">
                      {selectedBadge.onChainCredit.transactionHash}
                    </span>
                    <button
                      onClick={() => handleCopy(selectedBadge.onChainCredit.transactionHash, 'tx-hash')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
                      title="复制完整哈希"
                    >
                      {copiedTx === 'tx-hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-500">双方联名多签状态：</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    双方钱包已共同联名签名，无法单方伪造或撤回
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                关闭凭证
              </button>
              <button
                onClick={() => handleCopy(`https://explorer.solana.com/tx/${selectedBadge.onChainCredit.transactionHash}?cluster=devnet`, 'explorer-link')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                {copiedTx === 'explorer-link' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已复制 Explorer 链接</span>
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>复制链上区块链浏览器直链</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
