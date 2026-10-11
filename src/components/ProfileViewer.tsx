import React, { useState } from 'react';
import { 
  CollaborationProfile 
} from '../types/profile';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Tag, 
  Briefcase, 
  Award, 
  Compass, 
  ShieldAlert, 
  UserCheck, 
  Layers, 
  Code2, 
  Copy, 
  Check, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Cpu,
  Database
} from 'lucide-react';

interface ProfileViewerProps {
  profile: CollaborationProfile;
  onGoToMatches: () => void;
  onOpenParser?: (mode: 'text' | 'file') => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const ProfileViewer: React.FC<ProfileViewerProps> = ({
  profile,
  onGoToMatches,
  onOpenParser,
  onOpenHistory,
  historyCount = 0
}) => {
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6 relative z-10">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 p-[2px] shadow-xl shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black text-white">
                {profile.name ? profile.name.substring(0, 1) : '商'}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {profile.name || '匿名精英'} 的商业合作画像
                </h1>
                <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {profile.title || '商业合伙人'}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  已认证
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {profile.company || '知名企业'}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                  {profile.industry || '企业服务'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.city || '北京'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {profile.yearsOfExperience || '10年'}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Parser Entrance & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {onOpenParser && (
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  onClick={() => onOpenParser('text')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
                  title="粘贴简历文本解析生成合作画像"
                >
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>粘贴文本</span>
                </button>

                <button
                  onClick={() => onOpenParser('file')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
                  title="上传简历文件 (PDF/图片) 解析生成合作画像"
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>上传文件</span>
                </button>
              </div>
            )}

            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 shadow-sm transition-colors"
                title="查看与管理云端留存的历史简历档案"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>留存档案库{historyCount > 0 ? ` (${historyCount})` : ''}</span>
              </button>
            )}

            <button
              onClick={() => setShowJsonRaw(!showJsonRaw)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
            >
              <span>{showJsonRaw ? '隐藏 JSON' : '查看标准 JSON'}</span>
            </button>

            <button
              onClick={onGoToMatches}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>5 人转动卡片</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* JSON Schema Drawer */}
        {showJsonRaw && (
          <div className="mt-6 pt-6 border-t border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">
                标准 JSON 契约数据（严格符合 Prompt 指定输出 Schema）：
              </span>
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制 JSON'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-72">
              {JSON.stringify(profile, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Grid of the 6 Core Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Capability (核心专业能力) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">核心专业能力 (Capability)</h3>
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">第一人称·量化成果</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
              {profile.capability?.content}
            </p>

            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-semibold text-slate-400 block">业绩与成果亮点：</span>
              {profile.capability?.highlights?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
            {profile.capability?.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Module 2: Resources (可调动商业资源) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">可调动商业资源 (Resources)</h3>
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">分类列举·规模概括</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 mb-3 text-xs text-emerald-300 font-medium">
              ⚡ 核心资源规模：{profile.resources?.scale}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {profile.resources?.content}
            </p>

            <div className="space-y-2 mb-4">
              {profile.resources?.items?.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="font-semibold text-slate-300 shrink-0 w-24">
                    {item.type}:
                  </span>
                  <span className="text-slate-400 text-right flex-1">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
            {profile.resources?.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Module 3: Endorsement (外部信任背书) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">外部信任背书 (Endorsement)</h3>
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-500">外部验证·标杆经历</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 font-bold text-xs mb-3 text-center">
              “{profile.endorsement?.summary}”
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {profile.endorsement?.content}
            </p>

            <div className="space-y-2 mb-4">
              {profile.endorsement?.highlights?.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="text-amber-400 font-bold">✓</span>
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
            {profile.endorsement?.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Module 4: Intent (供需意向两段式) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">供需意向矩阵 (Intent)</h3>
              </div>
              <span className="text-[10px] uppercase font-semibold text-purple-400">两段式严格定义</span>
            </div>

            {/* Offering vs Seeking Split Box */}
            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
                <span className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  【我能提供】核心输出价值
                </span>
                <div className="space-y-1">
                  {profile.intent?.offering?.map((off, idx) => (
                    <div key={idx} className="text-xs text-slate-200 flex items-start gap-1.5">
                      <span className="text-purple-400 text-xs">▸</span>
                      <span>{off}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <span className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  【我在寻找】迫切合作伙伴与资源
                </span>
                <div className="space-y-1">
                  {profile.intent?.seeking?.map((seek, idx) => (
                    <div key={idx} className="text-xs text-slate-200 flex items-start gap-1.5">
                      <span className="text-indigo-400 text-xs">▸</span>
                      <span>{seek}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
            {profile.intent?.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Module 5: Taboo (合作禁忌与模糊排斥词) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">合作禁忌雷区 (Taboo)</h3>
              </div>
              <span className="text-[10px] uppercase font-semibold text-rose-400">负向模糊排斥</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {profile.taboo?.content}
            </p>

            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-semibold text-rose-300 block">排斥条件清单：</span>
              {profile.taboo?.items?.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-rose-200 bg-rose-950/20 p-2 rounded-lg border border-rose-500/20">
                  <span className="font-bold text-rose-400">✕</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mb-2">
              <span className="text-[10px] text-slate-400 block mb-1">
                模糊排斥关键词组（用于智能匹配语义过滤）：
              </span>
              <div className="flex flex-wrap gap-1">
                {profile.taboo?.keywords?.map((kw, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
            {profile.taboo?.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Module 6: Ideal Partner (逆向推断理想互补伙伴) */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border border-indigo-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">逆向推断：理想互补伙伴 (Ideal Partner)</h3>
              </div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/20">
                AI 价值边界推断
              </span>
            </div>

            <p className="text-xs text-indigo-200/90 leading-relaxed mb-4 bg-indigo-950/40 p-3.5 rounded-xl border border-indigo-500/30">
              💡 {profile.idealPartner?.content}
            </p>

            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-semibold text-slate-300 block">理想伙伴关键特质：</span>
              {profile.idealPartner?.partnerTraits?.map((trait, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                  <span className="text-indigo-400 font-bold">★</span>
                  <span>{trait}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 mb-4">
              <span className="text-[11px] font-semibold text-slate-300 block">高契合商业合作场景：</span>
              {profile.idealPartner?.collaborationScenarios?.map((scene, idx) => (
                <div key={idx} className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                  {scene}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
            {profile.idealPartner?.tags?.map((tag, idx) => (
              <span key={idx} className="text-[11px] px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
