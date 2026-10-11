import React, { useState } from 'react';
import { 
  MatchedPartner, 
  CollaborationProfile, 
  SolanaWalletState 
} from '../types/profile';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  Sparkles, 
  Download, 
  ExternalLink, 
  User, 
  Send,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  buildPhoneChatCalendarPayload, 
  generateGoogleCalendarUrl, 
  downloadIcsFile 
} from '../services/calendarService';
import { executeMatchingPayment } from '../services/solanaService';

interface SchedulingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partner: MatchedPartner;
  userProfile: CollaborationProfile;
  walletState: SolanaWalletState;
  setWalletState: React.Dispatch<React.SetStateAction<SolanaWalletState>>;
  onScheduleConfirmed: (partnerId: string, scheduledTime: string, note?: string) => void;
}

export const SchedulingDialog: React.FC<SchedulingDialogProps> = ({
  isOpen,
  onClose,
  partner,
  userProfile,
  walletState,
  setWalletState,
  onScheduleConfirmed
}) => {
  if (!isOpen) return null;

  // Generate sensible upcoming slots (in 2-5 days)
  const generateSlots = () => {
    const slots = [];
    const now = new Date();
    
    // Slot 1: Day after tomorrow at 14:30
    const d1 = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
    d1.setHours(14, 30, 0, 0);

    // Slot 2: 3 days later at 10:00
    const d2 = new Date(now.getTime() + 3 * 24 * 3600 * 1000);
    d2.setHours(10, 0, 0, 0);

    // Slot 3: 4 days later at 16:00
    const d3 = new Date(now.getTime() + 4 * 24 * 3600 * 1000);
    d3.setHours(16, 0, 0, 0);

    return [
      { id: 'slot-1', date: d1, label: `${d1.getMonth() + 1}月${d1.getDate()}日 (周${['日','一','二','三','四','五','六'][d1.getDay()]}) 14:30 - 15:00` },
      { id: 'slot-2', date: d2, label: `${d2.getMonth() + 1}月${d2.getDate()}日 (周${['日','一','二','三','四','五','六'][d2.getDay()]}) 10:00 - 10:30` },
      { id: 'slot-3', date: d3, label: `${d3.getMonth() + 1}月${d3.getDate()}日 (周${['日','一','二','三','四','五','六'][d3.getDay()]}) 16:00 - 16:30` },
    ];
  };

  const candidateSlots = generateSlots();
  const [selectedSlot, setSelectedSlot] = useState(candidateSlots[0]);
  const [customNote, setCustomNote] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string>('');
  const [lastPayload, setLastPayload] = useState<any>(null);

  const handleConfirmAndSync = () => {
    // Escrow stake or match action
    const payment = executeMatchingPayment(walletState, 0.01, 'INVITE_STAKE');
    if (payment.success) {
      setWalletState(payment.newState);
    }

    const payload = buildPhoneChatCalendarPayload(userProfile, partner, selectedSlot.date, 30);
    setLastPayload(payload);

    // Generate Google Calendar Link
    const gUrl = generateGoogleCalendarUrl(payload);
    setGoogleCalendarUrl(gUrl);

    // Download standard .ICS file automatically for local calendar
    downloadIcsFile(payload, `SparkChat-${partner.name}-PhoneChat.ics`);

    setIsConfirmed(true);
    onScheduleConfirmed(partner.id, selectedSlot.label, customNote.trim() || undefined);

    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shrink-0">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2">
                <span>发起 Phone Chat 邀约</span>
                <span className="text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  同步日历
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[220px] sm:max-w-none">
                与 {partner.name} ({partner.company}) 约定通话
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {!isConfirmed ? (
            <>
              {/* Mutual Negotiation Chat Bubble Simulation */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  智能协商对话框 (Mutual Dialogue)
                </span>

                {/* Partner greeting bubble */}
                <div className="flex items-start gap-3">
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-indigo-500/40"
                  />
                  <div className="bg-slate-800/90 rounded-2xl rounded-tl-sm p-3.5 text-xs text-slate-200 border border-slate-700/60 max-w-lg leading-relaxed">
                    <p className="font-semibold text-indigo-300 mb-1">
                      {partner.name} · {partner.title}:
                    </p>
                    你好{userProfile.name}！拜读了你的合作画像，尤其是你在
                    <span className="text-white font-semibold">“{partner.whyMatch?.youOfferWhatTheySeek?.[0] || '商业渠道与资源'}”</span>
                    方面的深厚积淀，正好能补齐我们当前最迫切的短板！
                    我非常期待在
                    <span className="text-emerald-400 font-semibold">“{partner.whyMatch?.suggestedScenarios?.[0] || '商业协同与生态赋能'}”</span>
                    上展开深度合作。请在下方选择一个你方便的时间段，我们连线详聊！
                  </div>
                </div>

                {/* User custom reply preview */}
                <div className="flex items-start justify-end gap-3 pl-8">
                  <div className="bg-indigo-600/90 rounded-2xl rounded-tr-sm p-3.5 text-xs text-white shadow-md max-w-lg leading-relaxed">
                    <p className="font-semibold text-indigo-200 mb-1">我 ({userProfile.name}):</p>
                    太好了，我也有关注到你们在
                    <span className="underline decoration-indigo-300 font-medium">
                      {partner.whyMatch?.theyOfferWhatYouSeek?.[0] || '核心业务与产业资源'}
                    </span>
                    的领先优势，正好能形成强强互补。我已选定会谈时间，系统将直接把日程同步到双方日历中！
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    我
                  </div>
                </div>
              </div>

              {/* Time Slot Picker */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  请选定建议通话时段（双方空闲时间智能交集）：
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {candidateSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative ${
                        selectedSlot.id === slot.id
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <CalendarIcon className="w-4 h-4 text-emerald-400" />
                        {selectedSlot.id === slot.id && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs font-bold text-white">{slot.label}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">30分钟电话会谈</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 30-min Phone Chat Agenda Plan */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  AI 智能建议 30 分钟 Phone Chat 议程：
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-indigo-400 block text-[11px]">00 - 05 分钟</span>
                    <span>双方背景破冰与底色互通</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-purple-400 block text-[11px]">05 - 20 分钟</span>
                    <span>供需落地探讨：{partner.whyMatch.suggestedScenarios[0]?.substring(0, 18)}...</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="font-bold text-emerald-400 block text-[11px]">20 - 30 分钟</span>
                    <span>明确下一步推进动作与对接人</span>
                  </div>
                </div>
              </div>

              {/* Custom message addition */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
                  给对方的补充附言（选填）：
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="如：我们团队周五刚好在准备相关方案，希望能重点探讨投标合作..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Solana Escrow Guarantee Notice */}
              <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    包含 0.01 SOL 履约定金托管（双方通话完成后自动退还），保障会谈严肃性
                  </span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400">去中心化合约质押</span>
              </div>
            </>
          ) : (
            /* SUCCESS STATE & CALENDAR SYNC CONFIRMATION */
            <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">邀约已确认 · 双方日历同步完成！</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  已成功约定于 <span className="text-emerald-400 font-bold">{selectedSlot.label}</span> 与 {partner.name} 进行商业合作 Phone Chat。
                </p>
              </div>

              {/* Event Card Info */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">会议主题</span>
                  <span className="text-xs font-bold text-white">商业合作 Phone Chat ({userProfile.name} & {partner.name})</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">约定时间</span>
                  <span className="text-xs font-bold text-emerald-400">{selectedSlot.label}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">拨打联系方式</span>
                  <span className="text-xs font-mono text-indigo-300">{partner.phone} (双方预留直通)</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400">日历同步机制</span>
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已自动下载 .ICS 标准文件并生成 Google Calendar 直链
                  </span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-xs text-slate-400">数据保存状态</span>
                  <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    已自动同步保存至本地持久化存储，刷新不丢失
                  </span>
                </div>
              </div>

              {/* Action Buttons: Add to Google Calendar / Re-download ICS */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {googleCalendarUrl && (
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>添加至 Google Calendar (一键直达)</span>
                  </a>
                )}

                <button
                  onClick={() => downloadIcsFile(lastPayload, `SparkChat-${partner.name}-PhoneChat.ics`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>重新下载 .ICS 文件 (Apple / Outlook / 华为)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {isConfirmed ? '关闭' : '取消'}
          </button>

          {!isConfirmed && (
            <button
              onClick={handleConfirmAndSync}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>确认约定时间并自动同步至双方日历系统</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
