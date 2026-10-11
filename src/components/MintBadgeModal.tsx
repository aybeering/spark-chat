import React, { useState } from 'react';
import { MatchedPartner, CollaborationProfile, ChatHistoryBadge } from '../types/profile';
import { 
  Sparkles, 
  X, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Star, 
  Coins, 
  RotateCw,
  Building2,
  Clock
} from 'lucide-react';

interface MintBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: MatchedPartner;
  userProfile: CollaborationProfile;
  onBadgeMinted: (newBadge: ChatHistoryBadge) => void;
}

const AVAILABLE_SPARK_TAGS = [
  '高维商业推演',
  '极度守时守信',
  '资源互补落地',
  '直切战略核心',
  '跨界认知启发',
  '大客户KA赋能',
  '诚意务实不画大饼',
  '技术架构前瞻',
  '出海渠道敏锐'
];

export const MintBadgeModal: React.FC<MintBadgeModalProps> = ({
  isOpen,
  onClose,
  partner,
  userProfile,
  onBadgeMinted
}) => {
  const [selectedUserTags, setSelectedUserTags] = useState<string[]>([
    '直切战略核心',
    '资源互补落地'
  ]);
  const [userComment, setUserComment] = useState(
    `与${partner.name}的30分钟通话直奔业务核心，针对双方商业协同与落地细节展开了高效推演，已明确后续推进步骤！`
  );
  const [partnerTags] = useState<string[]>([
    '高维商业推演',
    '极度守时守信',
    '诚意务实不画大饼'
  ]);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedUserTags.includes(tag)) {
      if (selectedUserTags.length > 1) {
        setSelectedUserTags(selectedUserTags.filter(t => t !== tag));
      }
    } else {
      if (selectedUserTags.length < 4) {
        setSelectedUserTags([...selectedUserTags, tag]);
      }
    }
  };

  const handleMint = () => {
    setIsMinting(true);

    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const randomBlock = Math.floor(285000000 + Math.random() * 1000000);
      const randomHex = Array.from({ length: 44 }, () => 
        '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
      ).join('');

      const newBadge: ChatHistoryBadge = {
        id: `badge-minted-${Date.now()}`,
        badgeName: `${partner.name} · 闪光共鸣勋章`,
        badgeLevel: 'Diamond',
        tierLabel: 'S-Tier 钻石级',
        badgeIconType: 'spark',
        themeColor: 'indigo',
        chatDate: dateStr,
        durationMinutes: 30,
        partner: {
          id: partner.id,
          name: partner.name,
          title: partner.title,
          company: partner.company,
          avatar: partner.avatar,
          industry: partner.industry,
          walletAddress: `${partner.id.slice(0, 4)}...${partner.id.slice(-4)}`
        },
        userWalletAddress: 'Spk9w...7BmQ',
        partnerToUserSpark: {
          rating: 5,
          sparkTags: partnerTags,
          comment: `非常惊喜的一次商业通话！${userProfile.name}针对行业痛点给出了清晰的解法，沟通准时高效，双方供需契合度极高。`,
          reviewerRole: 'partner',
          reviewerName: partner.name
        },
        userToPartnerSpark: {
          rating: 5,
          sparkTags: selectedUserTags,
          comment: userComment,
          reviewerRole: 'user',
          reviewerName: '您 (当前画像)'
        },
        onChainCredit: {
          creditScoreGain: 96,
          blockHeight: randomBlock,
          transactionHash: randomHex,
          tokenStandard: 'Solana SBT (Soulbound Token)',
          mintAddress: `SPARK-SBT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          verificationStatus: 'finalized',
          dualSigned: true,
          network: 'Solana Devnet',
          timestamp: Date.now()
        },
        collabOutcome: '双方已完成首轮通话深度共鸣，已达成后续实质性合作意向沟通。'
      };

      setIsMinting(false);
      setMintSuccess(true);

      setTimeout(() => {
        onBadgeMinted(newBadge);
        onClose();
      }, 1200);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              通话完成 · 双方 Spark 闪光点互评
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              评价将生成不可篡改的 Solana Devnet 链上商业信誉勋章 (SBT)
            </p>
          </div>
        </div>

        {/* Partner Info */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
          <img
            src={partner.avatar}
            alt={partner.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{partner.name}</span>
              <span className="text-xs text-indigo-300">{partner.title}</span>
            </div>
            <p className="text-xs text-slate-400">{partner.company}</p>
          </div>
        </div>

        {/* User Giving Spark Evaluation */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 block">
            1. 选择您认可 {partner.name} 的 Spark 闪光点标签 (1-4项)：
          </label>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_SPARK_TAGS.map((tag) => {
              const isSelected = selectedUserTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {isSelected ? '✨ ' : ''}{tag}
                </button>
              );
            })}
          </div>

          <label className="text-xs font-bold text-slate-300 block pt-1">
            2. 您的通话启发与互评简述：
          </label>
          <textarea
            value={userComment}
            onChange={(e) => setUserComment(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Simulated Partner Mutual Spark Evaluation */}
        <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-indigo-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              对方 ({partner.name}) 拟同步授予您的闪光点：
            </span>
            <span className="text-[10px] text-emerald-400">双方已签署</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {partnerTags.map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 text-[11px] border border-indigo-500/30">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* On-Chain Minting Notice */}
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            链上信誉权重增益：
          </span>
          <span className="font-bold text-emerald-400 font-mono">+96 链上商誉分 (AAA)</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            disabled={isMinting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            取消
          </button>

          <button
            onClick={handleMint}
            disabled={isMinting || mintSuccess}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            {isMinting ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>双方多签铸造中...</span>
              </>
            ) : mintSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SBT 勋章铸造成功！</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>双向确认并铸造链上勋章</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
