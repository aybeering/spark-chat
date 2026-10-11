export interface CapabilitySection {
  content: string;
  highlights: string[];
  tags: string[];
}

export interface ResourceItem {
  type: string;
  desc: string;
}

export interface ResourcesSection {
  content: string;
  items: ResourceItem[];
  scale: string;
  tags: string[];
}

export interface EndorsementSection {
  content: string;
  highlights: string[];
  summary: string;
  tags: string[];
}

export interface IntentSection {
  content: string;
  seeking: string[];
  offering: string[];
  supplyTags: string[];
  demandTags: string[];
  tags: string[];
}

export interface TabooSection {
  content: string;
  items: string[];
  tags: string[];
  keywords: string[];
}

export interface IdealPartnerSection {
  content: string;
  partnerTraits: string[];
  collaborationScenarios: string[];
  tags: string[];
}

export interface CollaborationProfile {
  name: string;
  title: string;
  company: string;
  industry: string;
  city: string;
  yearsOfExperience: string;
  avatar?: string;
  capability: CapabilitySection;
  resources: ResourcesSection;
  endorsement: EndorsementSection;
  intent: IntentSection;
  taboo: TabooSection;
  idealPartner: IdealPartnerSection;
}

export interface MatchedPartner {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  city: string;
  yearsOfExperience: string;
  avatar: string;
  phone: string;
  matchScore: number; // 0 - 100
  matchReason: string;
  complementaryRadar: {
    resourceFit: number;    // 资源互补
    capabilityFit: number;  // 能力协同
    demandSupplyFit: number;// 供需契合
    credibility: number;    // 商业背书
    tabooSafety: number;    // 禁忌安全
  };
  whyMatch: {
    theyOfferWhatYouSeek: string[];
    youOfferWhatTheySeek: string[];
    suggestedScenarios: string[];
  };
  profile: CollaborationProfile;
  invitationStatus: 'uninvited' | 'pending' | 'accepted' | 'scheduled';
  scheduledTime?: string;
  scheduledNote?: string;
  scheduledTimestamp?: number;
  calendarSynced?: boolean;
}

export interface SolanaWalletState {
  connected: boolean;
  publicKey: string | null;
  balance: number; // in SOL
  isSimulated: boolean;
  network: 'devnet' | 'mainnet-beta';
  txHistory: {
    signature: string;
    type: 'MATCH_UNLOCK' | 'INVITE_STAKE' | 'AIRDROP';
    amount: number;
    timestamp: number;
    status: 'confirmed' | 'pending';
  }[];
}

export interface SparkEvaluation {
  rating: number; // 1-5
  sparkTags: string[]; // e.g. ['商业战略共鸣', '履约守时', '资源落地性强']
  comment: string;
  reviewerRole: 'partner' | 'user';
  reviewerName: string;
}

export interface ChatHistoryBadge {
  id: string;
  badgeName: string;
  badgeLevel: 'Diamond' | 'Gold' | 'Platinum' | 'Silver';
  tierLabel: string;
  badgeIconType: 'spark' | 'flame' | 'shield' | 'trophy' | 'award';
  themeColor: 'indigo' | 'amber' | 'emerald' | 'purple' | 'cyan';
  chatDate: string;
  durationMinutes: number;
  partner: {
    id: string;
    name: string;
    title: string;
    company: string;
    avatar: string;
    industry: string;
    walletAddress: string;
  };
  userWalletAddress: string;
  // 双方评价数据
  partnerToUserSpark: SparkEvaluation; // 对方给我的评价
  userToPartnerSpark: SparkEvaluation; // 我给对方的评价
  // 链上信用凭证
  onChainCredit: {
    creditScoreGain: number; // e.g. +85
    blockHeight: number;
    transactionHash: string;
    tokenStandard: string;
    mintAddress: string;
    verificationStatus: 'verified' | 'finalized';
    dualSigned: boolean;
    network: string;
    timestamp: number;
  };
  collabOutcome?: string; // 双方商业合作落地推进
}

