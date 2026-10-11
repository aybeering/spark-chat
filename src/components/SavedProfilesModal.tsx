import React, { useState } from 'react';
import { 
  Database, 
  X, 
  CheckCircle2, 
  FileText, 
  Clock, 
  Trash2, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  Building2, 
  Briefcase, 
  MapPin, 
  ShieldCheck, 
  Loader2,
  Layers
} from 'lucide-react';
import { SavedResumeSummary } from '../services/storageService';
import { CollaborationProfile } from '../types/profile';

interface SavedProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: SavedResumeSummary[];
  currentProfile: CollaborationProfile;
  onSwitchProfile: (profileId: string) => Promise<void>;
  onDeleteProfile: (profileId: string) => Promise<void>;
  onOpenUpload: (mode: 'file' | 'text') => void;
}

export const SavedProfilesModal: React.FC<SavedProfilesModalProps> = ({
  isOpen,
  onClose,
  history,
  currentProfile,
  onSwitchProfile,
  onDeleteProfile,
  onOpenUpload,
}) => {
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!isOpen) return null;

  const handleSwitch = async (id: string) => {
    setSwitchingId(id);
    try {
      await onSwitchProfile(id);
    } finally {
      setSwitchingId(null);
    }
  };

  const handleInitiateDelete = (id: string, name: string) => {
    setProfileToDelete({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    const { id } = profileToDelete;
    setDeletingId(id);
    try {
      await onDeleteProfile(id);
    } catch (err) {
      console.error('Failed to delete profile:', err);
    } finally {
      setDeletingId(null);
      setProfileToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-indigo-950/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  简历档案留存库
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  数据已持久化
                </span>
              </div>
              <p className="text-xs text-slate-400">
                已留存 {history.length} 份解析档案 · 随时切换并实时加载专属撮合结果
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control & Stats */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>当前档案：<strong className="text-indigo-300 font-semibold">{currentProfile.name}</strong> ({currentProfile.title})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenUpload('file');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>上传新简历留存</span>
            </button>
          </div>
        </div>

        {/* Scrollable Profiles List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">暂无留存档案</p>
              <p className="text-xs text-slate-500 mt-1">上传或解析简历后将自动持久化保留在此处</p>
            </div>
          ) : (
            history.map((item) => {
              const isActive = item.isActive;
              const isSwitching = switchingId === item.id;
              const isDeleting = deletingId === item.id;
              const dateStr = item.uploadedAt 
                ? new Date(item.uploadedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                : '历史保存';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-950/30 ring-1 ring-indigo-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {item.name ? item.name.substring(0, 1) : '商'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-white">
                            {item.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium">
                            {item.title}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              当前生效
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            {item.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                            {item.industry}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isActive ? (
                        <button
                          onClick={() => handleSwitch(item.id)}
                          disabled={isSwitching}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isSwitching ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                          )}
                          <span>切换为此档案</span>
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                          使用中
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInitiateDelete(item.id, item.name);
                        }}
                        disabled={isDeleting}
                        title={history.length === 1 ? `删除「${item.name}」档案并重置为初始演示数据` : `删除「${item.name}」档案`}
                        aria-label={`删除「${item.name}」档案`}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 active:bg-rose-500/20 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        ) : (
                          <Trash2 className="w-4 h-4 transition-transform hover:scale-110 active:scale-95" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>每次切换档案，系统都会立即调取专属的真实撮合搭档</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            完成
          </button>
        </div>
      </div>

      {/* In-App Delete Confirmation Dialog (Iframe & Mobile Compatible) */}
      {profileToDelete && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !deletingId && setProfileToDelete(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 max-w-sm w-full space-y-4 shadow-2xl shadow-rose-950/40 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">确认删除该简历档案？</h3>
                <p className="text-xs text-slate-400 mt-0.5">此操作将从留存库中永久移除</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
              <span className="text-slate-500">删除档案：</span>
              <strong className="text-white font-medium truncate">「{profileToDelete.name}」</strong>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {history.length === 1 
                ? '留存库中仅剩此份档案，删除后将自动重置为初始演示合作画像。' 
                : '删除后，该档案及对应匹配记录将被移除；若当前正在使用，将自动切换至留存库中的其他档案。'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                disabled={!!deletingId}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={!!deletingId}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>正在删除...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>确认删除</span>
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
