import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Briefcase, 
  Cpu, 
  ShoppingBag,
  Loader2,
  FileUp,
  RefreshCw
} from 'lucide-react';
import { SAMPLE_RAW_RESUMES } from '../data/sampleResumes';
import { CollaborationProfile, MatchedPartner } from '../types/profile';
import { extractTextFromPdfClient } from '../services/pdfHelper';
import { SavedResumeSummary } from '../services/storageService';

interface ResumeParserSectionProps {
  onProfileGenerated: (profile: CollaborationProfile, matches?: MatchedPartner[], history?: SavedResumeSummary[]) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const ResumeParserSection: React.FC<ResumeParserSectionProps> = ({
  onProfileGenerated,
  isLoading,
  setIsLoading
}) => {
  const [activeInputMode, setActiveInputMode] = useState<'sample' | 'text' | 'file'>('sample');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-1');
  const [customResumeText, setCustomResumeText] = useState<string>(SAMPLE_RAW_RESUMES[0].text);
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

  const sampleIcons: Record<string, React.ReactNode> = {
    'sample-1': <Briefcase className="w-4 h-4 text-indigo-400" />,
    'sample-2': <Cpu className="w-4 h-4 text-purple-400" />,
    'sample-3': <ShoppingBag className="w-4 h-4 text-emerald-400" />
  };

  const handleSelectSample = (sample: typeof SAMPLE_RAW_RESUMES[0]) => {
    setSelectedSampleId(sample.id);
    setCustomResumeText(sample.text);
    setErrorMsg(null);
  };

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
          setCustomResumeText(extractedText);
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

    try {
      let bodyData: any = {};
      if (activeInputMode === 'file' && uploadedFile) {
        bodyData = {
          fileBase64: uploadedFile.base64,
          mimeType: uploadedFile.mimeType,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          resumeText: customResumeText || ''
        };
      } else {
        bodyData = {
          resumeText: customResumeText,
          fileName: activeInputMode === 'sample' ? `${SAMPLE_RAW_RESUMES.find(s => s.id === selectedSampleId)?.name || '示例简历'}_画像.txt` : '粘贴简历内容.txt'
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
        }
      }, 500);
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsLoading(false);
      setErrorMsg(err.message || '大模型暂时处于高负载阶段，请重试');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-1/4 w-96 h-48 bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              第 1 步：解析简历生成高维商业合作画像
            </h2>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            遵循严格提取原则：第一人称量化陈述、权威背书、两段式供需意向、负向排斥禁忌、逆向推断理想互补伙伴
          </p>
        </div>

        {/* Input Mode Selector (Mobile friendly tabs) */}
        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveInputMode('sample')}
            className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeInputMode === 'sample'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">精选样本</span>
            <span className="hidden sm:inline">高价值实战样本</span>
          </button>
          <button
            onClick={() => setActiveInputMode('text')}
            className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeInputMode === 'text'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">粘贴文本</span>
            <span className="hidden sm:inline">输入简历文本</span>
          </button>
          <button
            onClick={() => setActiveInputMode('file')}
            className={`flex-1 sm:flex-initial text-center px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeInputMode === 'file'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="sm:hidden">上传文件</span>
            <span className="hidden sm:inline">上传 PDF / 图片</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Sample Resumes */}
      {activeInputMode === 'sample' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_RAW_RESUMES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  selectedSampleId === sample.id
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {sampleIcons[sample.id]}
                    <span className="font-semibold text-xs text-white">{sample.name}</span>
                  </div>
                  {selectedSampleId === sample.id && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {sample.label}
                </p>
              </button>
            ))}
          </div>

          <div className="relative">
            <label className="text-xs font-semibold text-slate-400 mb-1.5 block">
              已选简历文本内容预览（可直接编辑）：
            </label>
            <textarea
              value={customResumeText}
              onChange={(e) => setCustomResumeText(e.target.value)}
              rows={6}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-300 font-mono focus:border-indigo-500 focus:outline-none transition-colors"
              placeholder="在此预览或直接修改简历内容..."
            />
          </div>
        </div>
      )}

      {/* Mode 2: Custom Text */}
      {activeInputMode === 'text' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400">
              粘贴您的完整简历文本、脉脉或领英档案：
            </label>
            <span className="text-[11px] text-slate-500">
              已输入 {customResumeText.length} 字
            </span>
          </div>
          <textarea
            value={customResumeText}
            onChange={(e) => setCustomResumeText(e.target.value)}
            rows={8}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
            placeholder="请在此粘贴您的简历内容（包含过往履历、职位头衔、核心业绩数字、可调动资源、合作诉求与禁忌等）..."
          />
        </div>
      )}

      {/* Mode 3: File Upload */}
      {activeInputMode === 'file' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 rounded-xl p-8 text-center transition-colors bg-slate-950/40 relative">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <FileUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  点击上传或拖拽简历文件至此区域
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  支持 PDF、PNG、JPG、Word 格式（Gemini 3.8 原生多模态解析）
                </p>
              </div>
            </div>
          </div>

          {uploadedFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-xs">
                      {uploadedFile.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400">{uploadedFile.size}</span>
                      {uploadedFile.extractedChars && (
                        <span className="text-[10px] text-emerald-400 font-medium">
                          · 已提取 {uploadedFile.extractedChars} 字文本
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已准备就绪
                </span>
              </div>

              {customResumeText && customResumeText.length > 20 && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">
                      📄 PDF 识别到的文本内容预览（将用于画像深度推理）：
                    </span>
                    <span className="text-[10px] text-slate-500">{customResumeText.length} 字</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-3 font-mono leading-relaxed bg-slate-900/60 p-2 rounded-lg">
                    {customResumeText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Reassurance warning notice */}
      {warningMsg && (
        <div className="mt-4 p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2 text-xs text-amber-300">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* Parsing progress display */}
      {isLoading && (
        <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-xs font-semibold text-indigo-300">
                AI 正在遵循【商业合作匹配分析师】提取准则深度推理中...
              </span>
            </div>
            <span className="text-[11px] font-mono text-indigo-400">{parsingStep * 20}%</span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
              style={{ width: `${parsingStep * 20}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] text-slate-400 pt-1">
            <span className={parsingStep >= 1 ? 'text-indigo-400 font-semibold' : ''}>
              1. 核心稀缺能力量化
            </span>
            <span className={parsingStep >= 2 ? 'text-indigo-400 font-semibold' : ''}>
              2. 可调动商业资源分类
            </span>
            <span className={parsingStep >= 3 ? 'text-indigo-400 font-semibold' : ''}>
              3. 15字外部信任背书
            </span>
            <span className={parsingStep >= 4 ? 'text-indigo-400 font-semibold' : ''}>
              4. 第一人称供需意向
            </span>
            <span className={parsingStep >= 5 ? 'text-indigo-400 font-semibold' : ''}>
              5. 逆向推断理想伙伴
            </span>
          </div>
        </div>
      )}

      {/* Action CTA */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>结构化解析引擎基于 Google Gemini 3.8 Flash · 遵循严格标签词表</span>
        </div>

        <button
          onClick={handleStartParsing}
          disabled={isLoading || (!customResumeText && !uploadedFile)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>智能解析中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>开始AI深度解析 · 生成商业合作画像</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
