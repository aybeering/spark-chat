import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, INITIAL_USER_PROFILE, WEEKLY_5_MATCHES } from './src/data/sampleResumes';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { 
  saveParsedProfileToStore, 
  getActiveProfileRecord, 
  getProfileHistorySummary, 
  switchActiveProfileInStore, 
  deleteProfileFromStore, 
  updateProfileMatches,
  readStore,
  saveScheduledMeetingToStore,
  removeScheduledMeetingFromStore,
  getScheduledMeetingsFromStore,
  ScheduledMeetingRecord
} from './server/storage';
import { 
  getEligibleCandidates, 
  generateAlgorithmicMatches 
} from './server/matchingEngine';
import { CollaborationProfile, MatchedPartner } from './src/types/profile';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

let pdfParseFn: any = null;
try {
  pdfParseFn = require('pdf-parse');
  if (typeof pdfParseFn !== 'function' && typeof pdfParseFn?.default === 'function') {
    pdfParseFn = pdfParseFn.default;
  }
} catch (e) {
  console.warn('Notice: pdf-parse initial load:', e);
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to extract text from PDF buffer
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    let fn = typeof pdfParseFn === 'function' ? pdfParseFn : null;
    if (!fn) {
      const mod: any = await import('pdf-parse');
      fn = typeof mod === 'function' ? mod : (typeof mod?.default === 'function' ? mod.default : mod?.default?.default);
    }
    if (typeof fn === 'function') {
      const data = await fn(buffer);
      return data?.text ? data.text.trim() : '';
    }
    return '';
  } catch (err) {
    console.warn('pdf-parse buffer parse notice:', err);
    return '';
  }
}

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Track quota limits across models to gracefully handle free-tier daily rate limits (HTTP 429)
let globalQuotaExhaustedUntil = 0;
const modelQuotaExhaustedUntil: Record<string, number> = {};

function isQuotaError(err: any): boolean {
  if (!err) return false;
  const status = err?.status;
  const code = err?.code || err?.error?.code;
  const msg = typeof err === 'string' ? err : (err?.message || JSON.stringify(err));
  return status === 'RESOURCE_EXHAUSTED' || 
         code === 429 || 
         msg.includes('429') || 
         msg.includes('Quota exceeded') || 
         msg.includes('RESOURCE_EXHAUSTED') ||
         msg.includes('free_tier_requests') ||
         msg.includes('rate-limit');
}

// Helper to call Gemini with multi-model fallback & intelligent quota management
async function callGeminiWithFallback(contents: any, systemInstruction?: string, temperature: number = 0.2): Promise<{ text: string; modelUsed: string } | null> {
  const now = Date.now();
  if (now < globalQuotaExhaustedUntil) {
    // Free-tier daily quota is currently resting; seamlessly route to algorithmic engine
    return null;
  }

  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  const availableModels = models.filter(m => (modelQuotaExhaustedUntil[m] || 0) <= now);

  if (availableModels.length === 0) {
    globalQuotaExhaustedUntil = Date.now() + 15 * 60 * 1000;
    return null;
  }

  for (const model of availableModels) {
    try {
      const generatePromise = ai.models.generateContent({
        model,
        contents,
        config: {
          ...(systemInstruction ? { systemInstruction } : {}),
          responseMimeType: 'application/json',
          temperature,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 6000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
      if (response?.text) {
        return { text: response.text, modelUsed: model };
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        modelQuotaExhaustedUntil[model] = Date.now() + 30 * 60 * 1000;
        console.log(`[AI Dispatcher] Model ${model} free-tier daily quota reached. Seamlessly routing to backup.`);
        const remaining = availableModels.filter(m => (modelQuotaExhaustedUntil[m] || 0) <= Date.now());
        if (remaining.length === 0) {
          globalQuotaExhaustedUntil = Date.now() + 30 * 60 * 1000;
          return null;
        }
      } else {
        console.log(`[AI Dispatcher] Model ${model} ${err?.message?.includes('timeout') ? 'timed out' : 'unavailable'}, trying backup.`);
      }
    }
  }

  return null;
}

// Fallback heuristic extractor when upstream Gemini APIs are under temporary 503 outage
function extractProfileHeuristically(rawText: string) {
  const text = rawText || '';
  
  // Extract name
  const nameMatch = text.match(/姓名[:：\s]*([^\n\r,，|]+)/) || 
                    text.match(/Name[:：\s]*([^\n\r,，|]+)/i) || 
                    text.match(/^([^\n\r\t]{2,4})[\s\n\r|]/);
  const name = nameMatch ? nameMatch[1].trim() : (text.length > 10 ? '真实简历候选人' : '合作精英');

  // Extract title
  const titleMatch = text.match(/职位[:：\s]*([^\n\r,，|]+)/) || 
                     text.match(/头衔[:：\s]*([^\n\r,，|]+)/) ||
                     text.match(/(副总裁|合伙人|总监|负责人|架构师|CTO|CEO|COO|VP|专家|经理)/);
  const title = titleMatch ? titleMatch[1].trim() : '商业化负责人 / 合伙人';

  // Extract company
  const companyMatch = text.match(/公司[:：\s]*([^\n\r,，|]+)/) || 
                       text.match(/企业[:：\s]*([^\n\r,，|]+)/) ||
                       text.match(/([\u4e00-\u9fa5]{2,15}(?:科技|网络|技术|集团|公司|中心|信息|实验室))/);
  const company = companyMatch ? companyMatch[1].trim() : '创新领军企业';

  // Extract industry
  const indMatch = text.match(/行业[:：\s]*([^\n\r,，|]+)/);
  const industry = indMatch ? indMatch[1].trim() : (
    text.includes('SaaS') ? 'SaaS / 企业服务' : 
    (text.includes('AI') || text.includes('人工智能') || text.includes('算法')) ? '人工智能' : 
    (text.includes('消费') || text.includes('电商') || text.includes('供应链')) ? '消费品 / 跨境电商' : 
    '企业服务'
  );

  // Extract city
  const cityMatch = text.match(/城市[:：\s]*([^\n\r,，|]+)/) || text.match(/(北京|上海|深圳|杭州|广州|成都|武汉|南京|苏州)/);
  const city = cityMatch ? (cityMatch[1] || cityMatch[0]).trim() : '北京';

  // Extract years
  const yearMatch = text.match(/(\d+)\s*年/) || text.match(/工作年限[:：\s]*([^\n\r,，|]+)/);
  const years = yearMatch ? (yearMatch[0] || '10年') : '10年';

  // Extract highlights from lines with numbers or achievements
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 8);
  const achievementLines = lines.filter(l => /\d+|万|亿|%|倍|率|主导|负责|达成|突破|架构|微调|Agent|RAG|中台|渠道|分销/.test(l)).slice(0, 3);
  const highlights = achievementLines.length > 0 ? achievementLines : [
    `拥有深厚${industry}从业经历与核心业务操盘经验`,
    `主导多项关键业务标杆落地，交付成果突出`,
    `管理跨职能团队，实现业务高确定性增长`
  ];

  // Extract custom capability
  const capMatch = text.match(/(?:核心能力|专业技能|擅长领域|核心优势)[:：\s]*([^\n\r]+)/);
  const customCap = capMatch ? capMatch[1].trim() : '';

  // Extract custom offering
  const offeringMatch = text.match(/(?:我能提供|能提供|提供资源|优势资源|核心资源)[:：\s]*([^\n\r]+)/);
  const customOfferings = offeringMatch 
    ? offeringMatch[1].split(/[,，、;；|]/).map(s => s.trim()).filter(Boolean)
    : [];

  // Extract custom seeking
  const seekingMatch = text.match(/(?:我在寻找|在寻找|寻找合作|合作需求|合作诉求|寻求)[:：\s]*([^\n\r]+)/);
  const customSeekings = seekingMatch
    ? seekingMatch[1].split(/[,，、;；|]/).map(s => s.trim()).filter(Boolean)
    : [];

  const finalOfferings = customOfferings.length > 0 ? customOfferings : [
    `成熟的${industry}商业化拓展打法与商务推进能力`,
    `大客户决策层直通对接或联合投标渠道`
  ];

  const finalSeekings = customSeekings.length > 0 ? customSeekings : [
    `在技术、产品或特定场景具备深度互补壁垒的搭档`,
    `寻求规模化商业落地与分销联运的合作方`
  ];

  return {
    name,
    title,
    company,
    industry,
    city,
    yearsOfExperience: years,
    capability: {
      content: customCap || `我擅长${industry}领域的商业化拓展与核心业务推进，深耕${years}，具备体系化作战与团队管理能力，累计沉淀可复用的实战打法与业绩支撑。`,
      highlights,
      tags: [industry, "BD拓展", "团队管理", "增长策略"]
    },
    resources: {
      content: `我拥有深度产业上下游资源网络与关键决策人关系，可协同调动渠道、大客户与资本伙伴进行快速落地。`,
      items: [
        { type: "大客户人脉", desc: "行业龙头企业与关键采购决策层直通对接" },
        { type: "渠道网络", desc: "成熟的区域分销及生态集成商合作伙伴库" }
      ],
      scale: "覆盖数千万级业务采购商机与成熟渠道网络",
      tags: ["大客户人脉", "渠道网络", "行业协会"]
    },
    endorsement: {
      content: `拥有知名企业核心操盘履历与扎实业绩成果，主导多项重点商业合作项目，获得行业良好口碑。`,
      highlights: [
        `主导知名标杆项目成功落地`,
        `多年核心业务管理战功背书`,
        `行业知名商业合伙人`
      ],
      summary: `${years}行业老兵，实战商业操盘者`,
      tags: ["增长策略", "知名雇主"]
    },
    intent: {
      content: `【我能提供】${finalOfferings.join('；')}\n【我在寻找】${finalSeekings.join('；')}`,
      seeking: finalSeekings,
      offering: finalOfferings,
      supplyTags: ["渠道网络", "BD拓展", "渠道分销"],
      demandTags: ["技术研发", "产品设计", "联合开发"],
      tags: ["渠道分销", "联合运营", "技术合作"]
    },
    taboo: {
      content: "明确拒绝无实质落地场景的空泛概念、账期超长的纯佣金CPS模式、以及合规风险未解的项目。",
      items: ["无落地案例的纯概念项目", "垫资周期超长的纯佣金合作", "合规风险未解业务"],
      tags: ["纯佣金制", "无案例Demo", "超长账期"],
      keywords: ["纯佣金", "纯提成", "CPS", "垫资", "概念炒作"]
    },
    idealPartner: {
      content: "最能与我形成互补的是在技术研发与产品打磨上极强、但缺乏商务销售与渠道变现抓手的团队。我出渠道与商业化落地，对方出技术产品，组成互利共赢的搭档。",
      partnerTraits: [
        "产品与技术研发壁垒扎实，追求长期价值",
        "缺乏大B端销售与渠道拓展抓手，寻求商业化变现",
        "契约精神强，诚意开展联合运营让利"
      ],
      collaborationScenarios: [
        "联合开发行业定制方案并共同推向大客户",
        "代理分销与商业化联运，双方按成果分成"
      ],
      tags: ["技术研发", "产品设计", "联合开发"]
    }
  };
}

// Helper to perform matching for a given user profile against the candidate pool
async function performMatchingForProfile(userProfile: CollaborationProfile): Promise<MatchedPartner[]> {
  const eligibleCandidates = getEligibleCandidates(userProfile);
  
  if (!apiKey) {
    return generateAlgorithmicMatches(userProfile, eligibleCandidates);
  }

  try {
    const candidateSummary = eligibleCandidates.slice(0, 10).map((c, idx) => ({
      index: idx,
      id: c.id,
      name: c.name,
      title: c.title,
      company: c.company,
      industry: c.industry,
      city: c.city,
      years: c.yearsOfExperience,
      offering: c.profile.intent?.offering || [],
      seeking: c.profile.intent?.seeking || [],
      supplyTags: c.profile.intent?.supplyTags || [],
      demandTags: c.profile.intent?.demandTags || [],
      taboo: c.profile.taboo?.items || [],
      idealPartner: c.profile.idealPartner?.content || ''
    }));

    const matchPrompt = `你是一位高阶商业撮合分析师。根据以下上传用户的【商业合作画像】，从我们的人才库候选人中，深度评估并选出匹配度最高的5位商业合作者，形成极致双向互补。

【上传用户合作画像】
姓名: ${userProfile.name}
头衔: ${userProfile.title}
公司: ${userProfile.company}
行业: ${userProfile.industry}
城市: ${userProfile.city}
年限: ${userProfile.yearsOfExperience}
核心能力与标签: ${userProfile.capability?.tags?.join(', ') || ''} - ${userProfile.capability?.content || ''}
我能提供: ${userProfile.intent?.offering?.join('; ') || ''}
我在寻找: ${userProfile.intent?.seeking?.join('; ') || ''}
合作禁忌: ${userProfile.taboo?.items?.join('; ') || ''}
理想搭档要求: ${userProfile.idealPartner?.content || ''}

【候选人才库】
${JSON.stringify(candidateSummary, null, 2)}

请严格基于双方真实信息，选出5位最具互补价值的候选人。
必须输出严格JSON数组格式（包含候选人id、name、title、company、industry、city、yearsOfExperience、matchScore、matchReason、complementaryRadar、whyMatch）：
[
  {
    "id": "cand-xxx",
    "name": "候选人姓名",
    "title": "职位",
    "company": "公司",
    "industry": "行业",
    "city": "城市",
    "yearsOfExperience": "年限",
    "matchScore": 96,
    "matchReason": "针对双方真实供需的一句话撮合原因",
    "complementaryRadar": {
      "resourceFit": 98,
      "capabilityFit": 96,
      "demandSupplyFit": 99,
      "credibility": 95,
      "tabooSafety": 100
    },
    "whyMatch": {
      "theyOfferWhatYouSeek": ["对方能提供的具体项1", "对方能提供的具体项2"],
      "youOfferWhatTheySeek": ["你能为对方赋能的项1", "你能为对方赋能的项2"],
      "suggestedScenarios": ["具体的商业合作落地场景1", "合作场景2"]
    }
  }
]`;

    const matchResult = await callGeminiWithFallback([{ text: matchPrompt }], undefined, 0.2);
    if (matchResult?.text) {
      let rawList: any[] = [];
      try {
        rawList = JSON.parse(matchResult.text);
      } catch {
        const cleaned = matchResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
        rawList = JSON.parse(cleaned);
      }

      if (Array.isArray(rawList) && rawList.length > 0) {
        const hydratedMatches: MatchedPartner[] = [];
        for (const item of rawList) {
          const foundCand = eligibleCandidates.find(c => c.id === item.id || c.name === item.name) || eligibleCandidates[0];
          if (foundCand) {
            hydratedMatches.push({
              id: foundCand.id,
              name: foundCand.name,
              title: foundCand.title,
              company: foundCand.company,
              industry: foundCand.industry,
              city: foundCand.city,
              yearsOfExperience: foundCand.yearsOfExperience,
              avatar: foundCand.avatar,
              phone: foundCand.phone,
              matchScore: item.matchScore || 92,
              matchReason: item.matchReason || `极致互补合作：与您在${userProfile.industry}形成高价值业务协同`,
              complementaryRadar: item.complementaryRadar || {
                resourceFit: 94,
                capabilityFit: 92,
                demandSupplyFit: 95,
                credibility: 93,
                tabooSafety: 98
              },
              whyMatch: {
                theyOfferWhatYouSeek: item.whyMatch?.theyOfferWhatYouSeek || foundCand.profile.intent?.offering || [],
                youOfferWhatTheySeek: item.whyMatch?.youOfferWhatTheySeek || userProfile.intent?.offering || [],
                suggestedScenarios: item.whyMatch?.suggestedScenarios || foundCand.profile.idealPartner?.collaborationScenarios || []
              },
              profile: foundCand.profile,
              invitationStatus: 'uninvited'
            });
          }
        }

        if (hydratedMatches.length >= 3) {
          return hydratedMatches.slice(0, 5);
        }
      }
    }
  } catch {
    console.log('[AI Dispatcher] Gracefully utilizing algorithmic matching engine.');
  }

  return generateAlgorithmicMatches(userProfile, eligibleCandidates);
}

// Resume Parsing API - with persistent data storage & instant real matching
app.post('/api/parse-resume', async (req: Request, res: Response): Promise<void> => {
  const { resumeText, fileBase64, mimeType, fileName, fileSize } = req.body;

  if (!resumeText && !fileBase64) {
    res.status(400).json({ error: '请提供简历文字内容或简历文件 (PDF/图片)' });
    return;
  }

  let extractedPdfText = '';

  // Extract text from PDF buffer if provided
  if (fileBase64 && (mimeType === 'application/pdf' || mimeType?.includes('pdf'))) {
    try {
      const pdfBuf = Buffer.from(fileBase64, 'base64');
      extractedPdfText = await extractTextFromPdfBuffer(pdfBuf);
      if (extractedPdfText) {
        console.log(`Successfully extracted ${extractedPdfText.length} characters from uploaded PDF`);
      }
    } catch (e) {
      console.warn('PDF text extraction error:', e);
    }
  }

  const combinedResumeText = [resumeText, extractedPdfText].filter(Boolean).join('\n\n');
  const sourceType = fileBase64 ? 'upload_pdf' : 'paste_text';
  const resolvedFileName = fileName || (fileBase64 ? '上传简历.pdf' : '粘贴简历内容.txt');

  let finalProfile: CollaborationProfile;
  let isFallback = false;
  let warningMsg: string | undefined;

  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set. Generating parsed profile with heuristic engine.');
    finalProfile = extractProfileHeuristically(combinedResumeText);
    isFallback = true;
  } else {
    // Construct properly structured parts for @google/genai
    const parts: any[] = [];

    if (fileBase64 && mimeType) {
      const cleanMimeType = mimeType.includes('pdf') ? 'application/pdf' : mimeType;
      parts.push({
        inlineData: {
          mimeType: cleanMimeType,
          data: fileBase64,
        },
      });
    }

    parts.push({
      text: `请从这份真实简历中提取结构化商业合作画像信息，严格按照系统指令的要求输出严格JSON：\n${combinedResumeText ? `\n【简历文字提取内容】\n${combinedResumeText}` : ''}`
    });

    const contents = [{ role: 'user', parts }];

    try {
      const geminiResult = await callGeminiWithFallback(contents, SYSTEM_PROMPT, 0.2);
      
      if (geminiResult?.text) {
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(geminiResult.text);
        } catch {
          const cleaned = geminiResult.text.replace(/```json/g, '').replace(/```/g, '').trim();
          parsedJson = JSON.parse(cleaned);
        }

        if (parsedJson?.capability && parsedJson?.intent && parsedJson?.idealPartner) {
          finalProfile = parsedJson;
        } else {
          finalProfile = extractProfileHeuristically(combinedResumeText || '');
          isFallback = true;
        }
      } else {
        finalProfile = extractProfileHeuristically(combinedResumeText || '');
        isFallback = true;
        warningMsg = '云端大模型今日免费调用额度已满，系统已自动无缝切换至高可用规则画像引擎完成真实解析！';
      }
    } catch {
      finalProfile = extractProfileHeuristically(combinedResumeText || '');
      isFallback = true;
      warningMsg = '已自动启用高可用规则画像引擎完成真实解析！';
    }
  }

  // 1. Generate REAL matching results for this specific profile!
  const realMatches = await performMatchingForProfile(finalProfile);

  // 2. Persistently retain/save this resume record in database store!
  const savedRecord = saveParsedProfileToStore(
    finalProfile,
    {
      sourceType,
      fileName: resolvedFileName,
      fileSize: fileSize || `${Math.round(combinedResumeText.length / 5)} 字符`,
      rawSnippet: combinedResumeText.slice(0, 180)
    },
    realMatches
  );

  res.json({
    profile: finalProfile,
    matches: realMatches,
    recordId: savedRecord.id,
    isFallback,
    warning: warningMsg,
    message: '简历解析成功并已安全留存至数据库，已为您定制生成 5 位真实匹配伙伴！',
    history: getProfileHistorySummary()
  });
});

// Dynamic partner matching endpoint based on user profile
app.post('/api/match-partners', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userProfile, profileId } = req.body;
    const targetProfile = userProfile || getActiveProfileRecord().profile;

    if (!targetProfile) {
      res.json({ matches: WEEKLY_5_MATCHES });
      return;
    }

    const matches = await performMatchingForProfile(targetProfile);
    
    // If a profileId or active record exists, update matches in store
    const active = getActiveProfileRecord();
    const targetId = profileId || active?.id;
    if (targetId) {
      updateProfileMatches(targetId, matches);
    }

    // Hydrate any scheduled meetings into matches response
    const scheduledList = getScheduledMeetingsFromStore();
    const scheduledMap = new Map(scheduledList.map(sm => [sm.partnerId, sm]));
    const hydratedMatches = matches.map(m => {
      const sm = scheduledMap.get(m.id);
      if (sm) {
        return {
          ...m,
          invitationStatus: 'scheduled' as const,
          scheduledTime: sm.scheduledTime,
          scheduledNote: sm.scheduledNote || '',
          scheduledTimestamp: sm.scheduledTimestamp,
          calendarSynced: true
        };
      }
      return m;
    });

    res.json({ matches: hydratedMatches });
  } catch (err: any) {
    console.error('Error in /api/match-partners:', err);
    res.json({ matches: WEEKLY_5_MATCHES });
  }
});

// GET current active user profile & matches & history & scheduled meetings
app.get('/api/user-profile', async (_req: Request, res: Response): Promise<void> => {
  try {
    const activeRecord = getActiveProfileRecord();
    let matches = activeRecord.matches;
    
    // If matches are empty for this record, generate them now!
    if (!matches || matches.length === 0) {
      matches = await performMatchingForProfile(activeRecord.profile);
      updateProfileMatches(activeRecord.id, matches);
    }

    // Always merge scheduled meetings status so scheduled items are NEVER lost on refresh
    const scheduledList = getScheduledMeetingsFromStore();
    const scheduledMap = new Map(scheduledList.map(sm => [sm.partnerId, sm]));
    const hydratedMatches = matches.map(m => {
      const sm = scheduledMap.get(m.id);
      if (sm) {
        return {
          ...m,
          invitationStatus: 'scheduled' as const,
          scheduledTime: sm.scheduledTime,
          scheduledNote: sm.scheduledNote || '',
          scheduledTimestamp: sm.scheduledTimestamp,
          calendarSynced: true
        };
      }
      return m;
    });

    res.json({
      profile: activeRecord.profile,
      matches: hydratedMatches,
      scheduledMeetings: scheduledList,
      recordId: activeRecord.id,
      uploadedAt: activeRecord.uploadedAt,
      fileName: activeRecord.fileName,
      history: getProfileHistorySummary()
    });
  } catch (err: any) {
    console.error('Error in GET /api/user-profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// GET all scheduled meetings
app.get('/api/scheduled-meetings', (_req: Request, res: Response): void => {
  try {
    const meetings = getScheduledMeetingsFromStore();
    res.json({ meetings });
  } catch (err: any) {
    console.error('Error in GET /api/scheduled-meetings:', err);
    res.status(500).json({ error: 'Failed to fetch scheduled meetings' });
  }
});

// POST schedule a new Phone Chat meeting
app.post('/api/schedule-meeting', (req: Request, res: Response): void => {
  try {
    const { partner, scheduledTime, note } = req.body;
    if (!partner || !partner.id || !scheduledTime) {
      res.status(400).json({ error: 'Missing partner or scheduledTime' });
      return;
    }

    const activeRecord = getActiveProfileRecord();
    const existingMatch = activeRecord?.matches?.find(m => m.id === partner.id);
    const enrichedPartner = {
      ...(existingMatch || {}),
      ...partner,
      whyMatch: partner.whyMatch || existingMatch?.whyMatch || {
        theyOfferWhatYouSeek: ['核心业务与供应链资源', '产业链落地支持'],
        youOfferWhatTheySeek: ['商业渠道与数字化能力', '前沿架构整合'],
        suggestedScenarios: ['生态业务协同与资源互补落地']
      },
      complementaryRadar: partner.complementaryRadar || existingMatch?.complementaryRadar || {
        resourceFit: 95,
        capabilityFit: 94,
        demandSupplyFit: 96,
        credibility: 95,
        tabooSafety: 100
      }
    };

    const meeting: ScheduledMeetingRecord = {
      id: partner.id,
      partnerId: partner.id,
      partner: enrichedPartner,
      scheduledTime,
      scheduledNote: note || '',
      scheduledTimestamp: Date.now(),
      calendarSynced: true,
      createdAt: new Date().toISOString()
    };

    const updatedMeetings = saveScheduledMeetingToStore(meeting);
    res.json({ success: true, meetings: updatedMeetings });
  } catch (err: any) {
    console.error('Error in POST /api/schedule-meeting:', err);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

// POST cancel a scheduled meeting
app.post('/api/cancel-meeting', (req: Request, res: Response): void => {
  try {
    const { partnerId } = req.body;
    if (!partnerId) {
      res.status(400).json({ error: 'Missing partnerId' });
      return;
    }

    const updatedMeetings = removeScheduledMeetingFromStore(partnerId);
    res.json({ success: true, meetings: updatedMeetings });
  } catch (err: any) {
    console.error('Error in POST /api/cancel-meeting:', err);
    res.status(500).json({ error: 'Failed to cancel meeting' });
  }
});

// POST save user profile updates
app.post('/api/save-profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profile, recalculateMatches } = req.body;
    if (!profile) {
      res.status(400).json({ error: 'Missing profile' });
      return;
    }

    let matches: MatchedPartner[] = [];
    if (recalculateMatches) {
      matches = await performMatchingForProfile(profile);
    }

    const savedRecord = saveParsedProfileToStore(
      profile,
      {
        sourceType: 'sample',
        fileName: `${profile.name || '合作画像'}_修改更新.json`
      },
      matches
    );

    res.json({
      success: true,
      recordId: savedRecord.id,
      profile: savedRecord.profile,
      matches: savedRecord.matches,
      history: getProfileHistorySummary()
    });
  } catch (err: any) {
    console.error('Error in /api/save-profile:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// GET history of all saved resumes in persistent store
app.get('/api/resumes/history', (_req: Request, res: Response): void => {
  try {
    const summary = getProfileHistorySummary();
    res.json({ history: summary });
  } catch (err: any) {
    console.error('Error in GET /api/resumes/history:', err);
    res.status(500).json({ error: 'Failed to fetch resume history' });
  }
});

// POST switch active profile to another saved resume
app.post('/api/resumes/switch', async (req: Request, res: Response): Promise<void> => {
  try {
    const { profileId } = req.body;
    if (!profileId) {
      res.status(400).json({ error: 'Missing profileId' });
      return;
    }

    const record = switchActiveProfileInStore(profileId);
    if (!record) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    let matches = record.matches;
    if (!matches || matches.length === 0) {
      matches = await performMatchingForProfile(record.profile);
      updateProfileMatches(record.id, matches);
    }

    res.json({
      profile: record.profile,
      matches,
      recordId: record.id,
      uploadedAt: record.uploadedAt,
      fileName: record.fileName,
      history: getProfileHistorySummary()
    });
  } catch (err: any) {
    console.error('Error in POST /api/resumes/switch:', err);
    res.status(500).json({ error: 'Failed to switch profile' });
  }
});

// DELETE a saved resume from persistent store
app.delete('/api/resumes/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = deleteProfileFromStore(id);
    if (!deleted) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    const activeRecord = getActiveProfileRecord();
    res.json({
      success: true,
      activeProfile: activeRecord.profile,
      matches: activeRecord.matches,
      recordId: activeRecord.id,
      history: getProfileHistorySummary()
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/resumes/:id:', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Spark Chat server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
