import { CollaborationProfile, MatchedPartner, ChatHistoryBadge } from '../types/profile';
import { INITIAL_USER_PROFILE, WEEKLY_5_MATCHES } from '../data/sampleResumes';
import { INITIAL_CHAT_HISTORY_BADGES } from '../data/mockBadges';

export const STORAGE_KEYS = {
  USER_PROFILE: 'sparkchat_user_profile_v2',
  MATCHES_DATA: 'sparkchat_matches_v2',
  LAST_SAVED: 'sparkchat_last_saved_time',
  RESUME_HISTORY: 'sparkchat_resume_history_v2',
  SCHEDULED_MEETINGS: 'sparkchat_scheduled_meetings_v3',
  CHAT_HISTORY_BADGES: 'sparkchat_history_badges_v2',
};

export interface SavedResumeSummary {
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
}

/**
 * Safely load user profile from localStorage with fallback to default demo profile
 */
export function loadSavedUserProfile(): CollaborationProfile {
  if (typeof window === 'undefined') return INITIAL_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name && parsed.capability) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to read user profile from localStorage:', err);
  }
  return INITIAL_USER_PROFILE;
}

/**
 * Save user profile to localStorage
 */
export function saveUserProfile(profile: CollaborationProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (err) {
    console.error('[Storage] Failed to save user profile:', err);
  }
}

/**
 * Safely load matches from localStorage with fallback to weekly 5 matches
 */
export function loadSavedMatches(): MatchedPartner[] {
  if (typeof window === 'undefined') return WEEKLY_5_MATCHES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MATCHES_DATA);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: any, idx: number) => {
          const fallback = WEEKLY_5_MATCHES[idx] || WEEKLY_5_MATCHES[0];
          return {
            ...fallback,
            ...m,
            invitationStatus: m.invitationStatus || 'uninvited',
            scheduledTime: m.scheduledTime,
            scheduledNote: m.scheduledNote,
            scheduledTimestamp: m.scheduledTimestamp,
            calendarSynced: !!m.calendarSynced,
          };
        });
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to load matches from localStorage:', err);
  }
  return WEEKLY_5_MATCHES;
}

/**
 * Save matches list to localStorage
 */
export function saveMatches(matches: MatchedPartner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.MATCHES_DATA, JSON.stringify(matches));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (err) {
    console.error('[Storage] Failed to save matches:', err);
  }
}

/**
 * Load resume history from localStorage
 */
export function loadSavedResumeHistory(): SavedResumeSummary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RESUME_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('[Storage] Failed to load resume history from localStorage:', err);
  }
  return [];
}

/**
 * Save resume history to localStorage
 */
export function saveResumeHistory(history: SavedResumeSummary[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.RESUME_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('[Storage] Failed to save resume history:', err);
  }
}

/**
 * Load scheduled meetings from localStorage
 */
export function loadSavedScheduledMeetings(): MatchedPartner[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULED_MEETINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((m: any) => ({
          ...m,
          whyMatch: m.whyMatch || {
            theyOfferWhatYouSeek: ['核心业务与供应链资源', '产业链落地支持'],
            youOfferWhatTheySeek: ['商业渠道与数字化能力', '前沿架构整合'],
            suggestedScenarios: ['生态业务协同与资源互补落地']
          },
          complementaryRadar: m.complementaryRadar || {
            resourceFit: 95,
            capabilityFit: 94,
            demandSupplyFit: 96,
            credibility: 95,
            tabooSafety: 100
          },
          invitationStatus: 'scheduled' as const,
          calendarSynced: !!m.calendarSynced,
        }));
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to load scheduled meetings from localStorage:', err);
  }
  return [];
}

/**
 * Save scheduled meetings list to localStorage
 */
export function saveScheduledMeetings(meetings: MatchedPartner[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_MEETINGS, JSON.stringify(meetings));
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
  } catch (err) {
    console.error('[Storage] Failed to save scheduled meetings:', err);
  }
}

/**
 * Call server API to persist scheduled meeting
 */
export async function apiScheduleMeeting(partner: MatchedPartner, scheduledTime: string, note?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/schedule-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner, scheduledTime, note })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Failed to sync scheduled meeting to server:', err);
    return false;
  }
}

/**
 * Call server API to cancel scheduled meeting
 */
export async function apiCancelMeeting(partnerId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/cancel-meeting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId })
    });
    return res.ok;
  } catch (err) {
    console.warn('[Storage] Failed to sync cancel meeting to server:', err);
    return false;
  }
}

/**
 * Fetch active profile, matches, history, and scheduled meetings from server database
 */
export async function fetchProfileFromServer(): Promise<{
  profile: CollaborationProfile;
  matches: MatchedPartner[];
  recordId: string;
  history: SavedResumeSummary[];
  scheduledMeetings?: MatchedPartner[];
} | null> {
  try {
    const res = await fetch('/api/user-profile');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.profile) {
      saveUserProfile(data.profile);

      // Hydrate & merge scheduled meetings
      const localScheduled = loadSavedScheduledMeetings();
      const serverScheduledList: MatchedPartner[] = Array.isArray(data.scheduledMeetings)
        ? data.scheduledMeetings.map((sm: any) => {
            const partnerData = sm.partner || {};
            const pId = sm.partnerId || partnerData.id;
            const matchInList = (data.matches || []).find((m: any) => m.id === pId);
            return {
              ...(matchInList || {}),
              ...partnerData,
              whyMatch: partnerData.whyMatch || matchInList?.whyMatch || {
                theyOfferWhatYouSeek: ['核心业务与供应链资源', '产业链落地支持'],
                youOfferWhatTheySeek: ['商业渠道与数字化能力', '前沿架构整合'],
                suggestedScenarios: ['生态业务协同与资源互补落地']
              },
              complementaryRadar: partnerData.complementaryRadar || matchInList?.complementaryRadar || {
                resourceFit: 95,
                capabilityFit: 94,
                demandSupplyFit: 96,
                credibility: 95,
                tabooSafety: 100
              },
              invitationStatus: 'scheduled' as const,
              scheduledTime: sm.scheduledTime,
              scheduledNote: sm.scheduledNote || '',
              scheduledTimestamp: sm.scheduledTimestamp,
              calendarSynced: true,
            };
          })
        : [];

      // Combine local + server scheduled meetings without duplicates
      const scheduledMap = new Map<string, MatchedPartner>();
      for (const m of localScheduled) scheduledMap.set(m.id, m);
      for (const m of serverScheduledList) scheduledMap.set(m.id, m);
      const combinedScheduled = Array.from(scheduledMap.values());
      saveScheduledMeetings(combinedScheduled);

      // Ensure any returned match that is scheduled retains scheduled info
      if (data.matches && data.matches.length > 0) {
        const hydratedMatches = data.matches.map((m: MatchedPartner) => {
          const s = scheduledMap.get(m.id);
          if (s) {
            return {
              ...m,
              invitationStatus: 'scheduled' as const,
              scheduledTime: s.scheduledTime,
              scheduledNote: s.scheduledNote,
              scheduledTimestamp: s.scheduledTimestamp,
              calendarSynced: true,
            };
          }
          return m;
        });
        saveMatches(hydratedMatches);
        data.matches = hydratedMatches;
      }

      if (data.history) {
        saveResumeHistory(data.history);
      }

      data.scheduledMeetings = combinedScheduled;
      return data;
    }
  } catch (err) {
    console.warn('[Storage] Server sync unavailable, using local cache:', err);
  }
  return null;
}

/**
 * Switch to a specific saved resume record on server
 */
export async function switchProfileOnServer(profileId: string): Promise<{
  profile: CollaborationProfile;
  matches: MatchedPartner[];
  history: SavedResumeSummary[];
} | null> {
  try {
    const res = await fetch('/api/resumes/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId })
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.profile) {
      saveUserProfile(data.profile);
      if (data.matches) saveMatches(data.matches);
      if (data.history) saveResumeHistory(data.history);
      return data;
    }
  } catch (err) {
    console.error('[Storage] Failed to switch profile on server:', err);
  }
  return null;
}

/**
 * Delete a saved resume record on server
 */
export async function deleteProfileOnServer(profileId: string): Promise<{
  activeProfile: CollaborationProfile;
  matches: MatchedPartner[];
  history: SavedResumeSummary[];
} | null> {
  try {
    const res = await fetch(`/api/resumes/${profileId}`, {
      method: 'DELETE'
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.activeProfile) {
      saveUserProfile(data.activeProfile);
      if (data.matches) saveMatches(data.matches);
      if (data.history) saveResumeHistory(data.history);
      return data;
    }
  } catch (err) {
    console.error('[Storage] Failed to delete profile on server:', err);
  }
  return null;
}

/**
 * Safely load chat history badges from localStorage with fallback to initial badges
 */
export function loadChatHistoryBadges(): ChatHistoryBadge[] {
  if (typeof window === 'undefined') return INITIAL_CHAT_HISTORY_BADGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY_BADGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Storage] Failed to load chat history badges:', err);
  }
  return INITIAL_CHAT_HISTORY_BADGES;
}

/**
 * Save chat history badges list to localStorage
 */
export function saveChatHistoryBadges(badges: ChatHistoryBadge[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY_BADGES, JSON.stringify(badges));
  } catch (err) {
    console.error('[Storage] Failed to save chat history badges:', err);
  }
}

/**
 * Add a new chat history badge to the list
 */
export function addChatHistoryBadge(newBadge: ChatHistoryBadge): ChatHistoryBadge[] {
  const current = loadChatHistoryBadges();
  const updated = [newBadge, ...current];
  saveChatHistoryBadges(updated);
  return updated;
}

/**
 * Reset all user data back to initial demo state
 */
export function resetAllDataToDefault(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MATCHES_DATA);
    localStorage.removeItem(STORAGE_KEYS.RESUME_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULED_MEETINGS);
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY_BADGES);
    localStorage.removeItem('synapsematch_solana_state');
    localStorage.removeItem('synapsematch_user_profile_v1');
    localStorage.removeItem('synapsematch_matches_v1');
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
  } catch (err) {
    console.error('[Storage] Failed to reset data:', err);
  }
}
