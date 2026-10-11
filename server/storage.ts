import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CollaborationProfile, MatchedPartner } from '../src/types/profile';
import { SEED_CANDIDATE_POOL, CandidateEntry } from './candidatePool';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

export interface StoredProfileRecord {
  id: string;
  uploadedAt: string;
  sourceType: 'upload_pdf' | 'upload_image' | 'paste_text' | 'sample';
  fileName?: string;
  fileSize?: string;
  rawSnippet?: string;
  profile: CollaborationProfile;
  matches: MatchedPartner[];
}

export interface ScheduledMeetingRecord {
  id: string; // usually partnerId
  partnerId: string;
  partner: MatchedPartner;
  scheduledTime: string;
  scheduledNote?: string;
  scheduledTimestamp: number;
  calendarSynced: boolean;
  createdAt: string;
}

export interface AppStoreData {
  version: number;
  activeProfileId: string;
  profiles: StoredProfileRecord[];
  candidatePool: CandidateEntry[];
  scheduledMeetings: ScheduledMeetingRecord[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initial default seed state if store.json doesn't exist yet
function getInitialStore(): AppStoreData {
  const defaultProfile = SEED_CANDIDATE_POOL.find(c => c.name === '沈逸飞')?.profile || SEED_CANDIDATE_POOL[0].profile;
  const initialId = 'prof_default_seed';

  return {
    version: 1,
    activeProfileId: initialId,
    profiles: [
      {
        id: initialId,
        uploadedAt: new Date().toISOString(),
        sourceType: 'sample',
        fileName: '沈逸飞_商业化合伙人_演示画像.pdf',
        fileSize: '420 KB',
        rawSnippet: '云策智能商业化副总裁，12年SaaS大客户与渠道经验...',
        profile: defaultProfile,
        matches: []
      }
    ],
    candidatePool: SEED_CANDIDATE_POOL,
    scheduledMeetings: []
  };
}

export function readStore(): AppStoreData {
  ensureDataDir();
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const data = JSON.parse(raw) as AppStoreData;
      if (data && Array.isArray(data.profiles) && data.profiles.length > 0) {
        // Ensure candidates exist
        if (!Array.isArray(data.candidatePool) || data.candidatePool.length === 0) {
          data.candidatePool = SEED_CANDIDATE_POOL;
        }
        // Ensure scheduledMeetings exists
        if (!Array.isArray(data.scheduledMeetings)) {
          data.scheduledMeetings = [];
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to parse store.json, falling back to initial data:', err);
  }

  const initial = getInitialStore();
  writeStore(initial);
  return initial;
}

export function writeStore(data: AppStoreData): void {
  ensureDataDir();
  try {
    const tempPath = `${STORE_PATH}.tmp_${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, STORE_PATH);
  } catch (err) {
    console.error('Failed to write store.json:', err);
  }
}

/**
 * Save or update a parsed profile in persistent storage
 */
export function saveParsedProfileToStore(
  profile: CollaborationProfile,
  sourceMeta: {
    sourceType: 'upload_pdf' | 'upload_image' | 'paste_text' | 'sample';
    fileName?: string;
    fileSize?: string;
    rawSnippet?: string;
  },
  matches: MatchedPartner[] = []
): StoredProfileRecord {
  const store = readStore();
  const id = `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newRecord: StoredProfileRecord = {
    id,
    uploadedAt: new Date().toISOString(),
    sourceType: sourceMeta.sourceType,
    fileName: sourceMeta.fileName || `${profile.name || '合作画像'}_档案.pdf`,
    fileSize: sourceMeta.fileSize || '180 KB',
    rawSnippet: sourceMeta.rawSnippet || `${profile.title || ''} · ${profile.industry || ''}`,
    profile,
    matches
  };

  // Add to profiles list (unshift so newest is first)
  store.profiles.unshift(newRecord);
  store.activeProfileId = id;

  // Also add this profile into the candidate pool so other candidates can match with them (if name and title are valid)
  if (profile.name && profile.name.trim() && profile.title) {
    const exists = store.candidatePool.some(c => c.name === profile.name && c.company === profile.company);
    if (!exists) {
      store.candidatePool.push({
        id: `cand_${id}`,
        name: profile.name,
        title: profile.title,
        company: profile.company || '创新合伙企业',
        industry: profile.industry || '商业服务',
        city: profile.city || '北京',
        yearsOfExperience: profile.yearsOfExperience || '10年',
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        phone: '+86 138-****-****',
        profile: profile
      });
    }
  }

  writeStore(store);
  return newRecord;
}

/**
 * Update matches for an existing profile record
 */
export function updateProfileMatches(profileId: string, matches: MatchedPartner[]): void {
  const store = readStore();
  const record = store.profiles.find(p => p.id === profileId);
  if (record) {
    record.matches = matches;
    writeStore(store);
  }
}

/**
 * Switch active profile in store
 */
export function switchActiveProfileInStore(profileId: string): StoredProfileRecord | null {
  const store = readStore();
  const record = store.profiles.find(p => p.id === profileId);
  if (record) {
    store.activeProfileId = profileId;
    writeStore(store);
    return record;
  }
  return null;
}

/**
 * Delete a profile record from store
 */
export function deleteProfileFromStore(profileId: string): boolean {
  const store = readStore();
  const initialLen = store.profiles.length;
  store.profiles = store.profiles.filter(p => p.id !== profileId);

  if (store.profiles.length === 0) {
    // Reset to seed if all deleted
    const initial = getInitialStore();
    writeStore(initial);
    return true;
  }

  if (store.activeProfileId === profileId) {
    store.activeProfileId = store.profiles[0].id;
  }

  writeStore(store);
  return store.profiles.length < initialLen;
}

/**
 * Get active profile record
 */
export function getActiveProfileRecord(): StoredProfileRecord {
  const store = readStore();
  const active = store.profiles.find(p => p.id === store.activeProfileId);
  if (active) return active;
  return store.profiles[0];
}

/**
 * Get profile history summary
 */
export function getProfileHistorySummary(): {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  uploadedAt: string;
  sourceType: string;
  fileName?: string;
  fileSize?: string;
  isActive: boolean;
  matchCount: number;
}[] {
  const store = readStore();
  return store.profiles.map(p => ({
    id: p.id,
    name: p.profile.name || '合作画像',
    title: p.profile.title || '商业合伙人',
    company: p.profile.company || '合伙企业',
    industry: p.profile.industry || '企业服务',
    uploadedAt: p.uploadedAt,
    sourceType: p.sourceType,
    fileName: p.fileName,
    fileSize: p.fileSize,
    isActive: p.id === store.activeProfileId,
    matchCount: p.matches ? p.matches.length : 0
  }));
}

/**
 * Save or update a scheduled meeting record in persistent store
 */
export function saveScheduledMeetingToStore(meeting: ScheduledMeetingRecord): ScheduledMeetingRecord[] {
  const store = readStore();
  if (!Array.isArray(store.scheduledMeetings)) {
    store.scheduledMeetings = [];
  }

  // Remove existing entry for same partner if present
  store.scheduledMeetings = store.scheduledMeetings.filter(m => m.partnerId !== meeting.partnerId);
  store.scheduledMeetings.unshift(meeting);

  // Sync scheduled status to all matches across profiles
  for (const profile of store.profiles) {
    if (Array.isArray(profile.matches)) {
      for (const m of profile.matches) {
        if (m.id === meeting.partnerId) {
          m.invitationStatus = 'scheduled';
          m.scheduledTime = meeting.scheduledTime;
          m.scheduledNote = meeting.scheduledNote || '';
          m.scheduledTimestamp = meeting.scheduledTimestamp;
          m.calendarSynced = true;
        }
      }
    }
  }

  writeStore(store);
  return store.scheduledMeetings;
}

/**
 * Remove a scheduled meeting from persistent store
 */
export function removeScheduledMeetingFromStore(partnerId: string): ScheduledMeetingRecord[] {
  const store = readStore();
  if (!Array.isArray(store.scheduledMeetings)) {
    store.scheduledMeetings = [];
    return [];
  }

  store.scheduledMeetings = store.scheduledMeetings.filter(m => m.partnerId !== partnerId);

  // Revert scheduled status in all matches across profiles
  for (const profile of store.profiles) {
    if (Array.isArray(profile.matches)) {
      for (const m of profile.matches) {
        if (m.id === partnerId) {
          m.invitationStatus = 'uninvited';
          m.scheduledTime = undefined;
          m.scheduledNote = undefined;
          m.scheduledTimestamp = undefined;
          m.calendarSynced = false;
        }
      }
    }
  }

  writeStore(store);
  return store.scheduledMeetings;
}

/**
 * Get all scheduled meetings from persistent store
 */
export function getScheduledMeetingsFromStore(): ScheduledMeetingRecord[] {
  const store = readStore();
  return Array.isArray(store.scheduledMeetings) ? store.scheduledMeetings : [];
}
