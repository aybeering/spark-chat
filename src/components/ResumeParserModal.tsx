import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Loader2, 
  FileUp, 
  X,
  Briefcase
} from 'lucide-react';
import { SAMPLE_RAW_RESUMES } from '../data/sampleResumes';
import { CollaborationProfile, MatchedPartner } from '../types/profile';
import { extractTextFromPdfClient } from '../services/pdfHelper';
import { SavedResumeSummary } from '../services/storageService';

interface ResumeParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'text' | 'file';
  onProfileGenerated: (profile: CollaborationProfile, matches?: MatchedPartner[], history?: SavedResumeSummary[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const ResumeParserModal: React.FC<ResumeParserModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  onProfileGenerated,
  isLoading,
  setIsLoading
}) => {
  const [mode, setMode] = useState<'text' | 'file'>(initialMode);
  const [resumeText, setResumeText] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    base64: string;
    mimeType: string;
    extractedChars?: number;
  } | null>(null);
  const [parsingStep, setParsingStep] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Sync mode when initialMode prop changes
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setWarningMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('文件不能超过 25MB');
      return;
    }

    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const mimeType = isPdf ? 'application/pdf' : (file.type || 'application/pdf');

    // Attempt client-side PDF text extraction
    let extractedText = '';
    if (isPdf) {
      try {
        extractedText = await extractTextFromPdfClient(file);
        if (extractedText) {
          setResumeText(extractedText);
        }
      } catch (err) {
        console.warn('Client PDF extract error:', err);
      }
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setUploadedFile({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        base64: base64Data,
        mimeType: mimeType,
        extractedChars: extractedText ? extractedText.length : undefined
      });
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('文件读取失败，请重试');
    };
    reader.readAsDataURL(file);
  };

  const handleStartParsing = async () => {
    setErrorMsg(null);
    setWarningMsg(null);
    setIsLoading(true);
    setParsingStep(1);

    const stepInterval = setInterval(() => {
      setParsingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1000);

    const stepDescriptions = [
      '准备解析...',
      '1/5 正在提取简历履历与核心业务成就...',
      '2/5 深度拆解商业能力、稀缺资源与供需意向...',
      '3/5 逆向推演理想搭档画像与合作禁忌规则...',
      '4/5 正在将解析档案安全留存至云端持久化存储...',
      '5/5 正在与全网商业人才库进行真实双向撮合匹配...'
    ];

    try {
      let bodyData: any = {};
      if (mode === 'file' && uploadedFile) {
        bodyData = {
          fileBase64: uploadedFile.base64,
          mimeType: uploadedFile.mimeType,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          resumeText: resumeText || ''
        };
      } else {
        bodyData = {
          resumeText: resumeText,
          fileName: '手动录入简历文本.txt'
        };
      }

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();
      clearInterval(stepInterval);
      setParsingStep(5);

      if (!res.ok && !data.fallbackProfile && !data.profile) {
        throw new Error(data.error || '解析简历失败，请稍后重试');
      }

      const finalProfile = data.profile || data.fallbackProfile;
      if (data.warning) {
        setWarningMsg(data.warning);
      }

      setTimeout(() => {
        setIsLoading(false);
        if (finalProfile) {
          onProfileGenerated(finalProfile, data.matches, data.history);
          onClose();
        }
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsLoading(false);
      setErrorMsg(err.message || '大模型暂时处于高负载阶段，请重试');
    }
  };

  const handleQuickLoadSample = (sampleText: string) => {
    setResumeText(sampleText);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with pure tabs & close button */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMode('text')}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'text'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>粘贴文本</span>
            </button>

            <button
              onClick={() => setMode('file')}
              disabled={isLoading}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                mode === 'file'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>上传文件</span>
            </button>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {mode === 'text' ? (
            /* Mode 1: Paste Text */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  粘贴简历文本：
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">
                    快速填入示例：
                  </span>
                  <button
                    type="button"
                    onClick={() => handleQuickLoadSample(SAMPLE_RAW_RESUMES[0].text)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    示例1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLoadSample(SAMPLE_RAW_RESUMES[1].text)}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    示例2
                  </button>
                </div>
              </div>

              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                disabled={isLoading}
                rows={9}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="请在此粘贴您的简历内容、脉脉或领英档案（包含履历、职位、核心业绩数字、可调动资源、合作诉求等）..."
              />
              <div className="text-right text-[11px] text-slate-500">
                已输入 {resumeText.length} 字
              </div>
            </div>
          ) : (
            /* Mode 2: File Upload */
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-8 text-center transition-colors bg-slate-950/40 relative">
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2.5 pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      点击上传或拖拽简历文件至此
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      支持 PDF、PNG、JPG、Word 格式
                    </p>
                  </div>
                </div>
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {uploadedFile.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                        <span>{uploadedFile.size}</span>
                        {uploadedFile.extractedChars && (
                          <span className="text-emerald-400 font-medium">
                            · 已提取 {uploadedFile.extractedChars} 字
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    已就绪
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Warning Message */}
          {warningMsg && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{warningMsg}</span>
            </div>
          )}

          {/* Progress bar when loading */}
          {isLoading && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span>
                    {parsingStep === 1 && '1/5 正在提取简历履历与核心业务成就...'}
                    {parsingStep === 2 && '2/5 深度拆解商业能力、稀缺资源与供需意向...'}
                    {parsingStep === 3 && '3/5 逆向推演理想搭档画像与合作禁忌规则...'}
                    {parsingStep === 4 && '4/5 正在将解析档案安全留存至云端持久化存储...'}
                    {parsingStep >= 5 && '5/5 正在与商业人才库进行真实双向撮合匹配...'}
                    {parsingStep === 0 && '正在准备解析...'}
                  </span>
                </div>
                <span className="font-mono text-indigo-400">{parsingStep * 20}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, parsingStep * 20))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            取消
          </button>

          <button
            onClick={handleStartParsing}
            disabled={isLoading || (mode === 'text' ? !resumeText.trim() : !uploadedFile)}
            className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>解析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>立即解析画像</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
