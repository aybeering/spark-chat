import React, { useState } from 'react';
import { MatchedPartner, CollaborationProfile, ChatHistoryBadge } from '../types/profile';
import { 
  Calendar, 
  PhoneCall, 
  Building2, 
  Clock, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  User, 
  Sparkles,
  ArrowRight,
  ShieldCheck, 
  Trash2, 
  RotateCcw,
  MessageSquareQuote,
  Award
} from 'lucide-react';
import { 
  buildPhoneChatCalendarPayload, 
  generateGoogleCalendarUrl, 
  downloadIcsFile 
} from '../services/calendarService';
import { ChatHistoryBadgesSection } from './ChatHistoryBadgesSection';
import { MintBadgeModal } from './MintBadgeModal';

interface ScheduledMeetingsListProps {
  scheduledPartners: MatchedPartner[];
  userProfile: CollaborationProfile;
  badges: ChatHistoryBadge[];
  onBadgeMinted?: (newBadge: ChatHistoryBadge) => void;
  onGoToMatches: () => void;
  onCancelScheduled?: (partnerId: string) => void;
  onResetDemoData?: () => void;
}

export const ScheduledMeetingsList: React.FC<ScheduledMeetingsListProps> = ({
  scheduledPartners,
  userProfile,
  badges,
  onBadgeMinted,
  onGoToMatches,
  onCancelScheduled,
  onResetDemoData
}) => {
  const [partnerToCancel, setPartnerToCancel] = useState<string | null>(null);
  const [partnerToMint, setPartnerToMint] = useState<MatchedPartner | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (scheduledPartners.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">暂未约定 Phone Chat 日程</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              前往【选择一个，预约交流】浏览为您匹配的高契合商业伙伴，一键发起邀约即可自动同步日历。
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              onClick={onGoToMatches}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>去浏览本周匹配伙伴</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onResetDemoData && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-300 text-xs transition-colors border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置演示数据</span>
              </button>
            )}
          </div>
        </div>

        {/* Reset modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-white">确认重置全部数据？</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                这将清除本地保存的预约日程、解析画像、链上勋章及钱包状态，并恢复为初始演示数据。
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    onResetDemoData?.();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
                >
                  确认重置
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display Past Chat History Badges & On-Chain Credit Data Below Scheduled Meetings */}
        <ChatHistoryBadgesSection
          badges={badges}
          userProfile={userProfile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            已确认的 Phone Chat 商业日程
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {scheduledPartners.length} 场会谈
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            所有会谈已完成双向日历同步，通话结束后可互评铸造链上信用 SBT 勋章
          </p>
        </div>
        {onResetDemoData && (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 shadow-sm"
            title="重置为初始演示状态"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">重置演示数据</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheduledPartners.map((partner) => {
          const now = new Date();
          const targetDate = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
          const payload = buildPhoneChatCalendarPayload(userProfile, partner, targetDate, 30);
          const gUrl = generateGoogleCalendarUrl(payload);

          return (
            <div
              key={partner.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3.5 hover:border-slate-700 transition-colors shadow-lg relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={partner.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                    alt={partner.name}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-indigo-500/30 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{partner.name}</h4>
                      <span className="text-xs text-indigo-300 font-medium">
                        {partner.title}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{partner.company}</p>
                  </div>
                </div>

                <span className="text-[11px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已同步双方日历
                </span>
              </div>

              {/* Time slot & phone details */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    通话时间：
                  </span>
                  <span className="font-bold text-emerald-300 text-right">
                    {partner.scheduledTime || '已约定时段'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                    联系电话：
                  </span>
                  <span className="font-mono text-indigo-300 font-semibold">{partner.phone || '加密直连通话'}</span>
                </div>

                {partner.scheduledNote && (
                  <div className="flex items-start justify-between text-slate-300 pt-1 border-t border-slate-900">
                    <span className="text-slate-500 flex items-center gap-1.5 shrink-0 mt-0.5">
                      <MessageSquareQuote className="w-3.5 h-3.5 text-amber-400" />
                      邀约留言：
                    </span>
                    <span className="text-slate-300 text-right italic font-normal line-clamp-2 max-w-[240px]">
                      “{partner.scheduledNote}”
                    </span>
                  </div>
                )}
              </div>

              {/* Agenda topic summary */}
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">建议议题：</span>
                <p className="mt-1 line-clamp-2 text-slate-400 text-[11px] sm:text-xs">
                  {partner.whyMatch?.suggestedScenarios?.[0] || partner.matchReason || '深入交流核心业务场景与资源互补落地'}
                </p>
              </div>

              {/* Completion & Minting Quick Bar */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPartnerToMint(partner)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm"
                  title="通话已完成？双方互评 Spark 闪光点并铸造链上信用 SBT 勋章"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>通话已完成？互评铸造闪光勋章</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </button>
              </div>

              {/* Calendar Action buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <a
                    href={gUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Google Calendar</span>
                  </a>

                  <button
                    onClick={() => downloadIcsFile(payload, `SparkChat-${partner.name}-PhoneChat.ics`)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                    title="下载 .ICS 日历文件"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">下载</span> .ICS
                  </button>
                </div>

                {onCancelScheduled && (
                  <button
                    onClick={() => setPartnerToCancel(partner.id)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 text-xs transition-colors"
                    title="取消此约会"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px]">取消约会</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel Confirmation Dialog */}
      {partnerToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">确认取消该 Phone Chat 预约？</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              取消后，该伙伴将恢复为未邀约状态，日历预约可重新发起。
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setPartnerToCancel(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                保留预约
              </button>
              <button
                onClick={() => {
                  if (partnerToCancel) {
                    onCancelScheduled?.(partnerToCancel);
                    setPartnerToCancel(null);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                确认取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">确认重置全部数据？</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              这将清除本地保存的预约日程、解析画像、链上勋章及钱包状态，并恢复为初始演示数据。
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetDemoData?.();
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mint Badge Modal */}
      {partnerToMint && (
        <MintBadgeModal
          isOpen={!!partnerToMint}
          onClose={() => setPartnerToMint(null)}
          partner={partnerToMint}
          userProfile={userProfile}
          onBadgeMinted={(newBadge) => {
            onBadgeMinted?.(newBadge);
          }}
        />
      )}

      {/* Past Chat History Badges & On-Chain Credit Data */}
      <ChatHistoryBadgesSection
        badges={badges}
        userProfile={userProfile}
      />
    </div>
  );
};

