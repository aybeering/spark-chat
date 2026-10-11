import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ResumeParserModal } from './components/ResumeParserModal';
import { ProfileViewer } from './components/ProfileViewer';
import { MatchingCarousel } from './components/MatchingCarousel';
import { SchedulingDialog } from './components/SchedulingDialog';
import { ScheduledMeetingsList } from './components/ScheduledMeetingsList';
import { WalletModal } from './components/WalletModal';
import { SavedProfilesModal } from './components/SavedProfilesModal';
import { 
  CollaborationProfile, 
  MatchedPartner, 
  SolanaWalletState,
  ChatHistoryBadge
} from './types/profile';
import { 
  INITIAL_USER_PROFILE, 
  WEEKLY_5_MATCHES 
} from './data/sampleResumes';
import { getInitialWalletState, saveWalletState } from './services/solanaService';
import { 
  loadSavedUserProfile, 
  saveUserProfile, 
  loadSavedMatches, 
  saveMatches, 
  resetAllDataToDefault,
  loadSavedResumeHistory,
  saveResumeHistory,
  fetchProfileFromServer,
  switchProfileOnServer,
  deleteProfileOnServer,
  SavedResumeSummary,
  loadSavedScheduledMeetings,
  saveScheduledMeetings,
  apiScheduleMeeting,
  apiCancelMeeting,
  loadChatHistoryBadges,
  saveChatHistoryBadges
} from './services/storageService';
import { 
  Sparkles, 
  RotateCw, 
  ShieldCheck, 
  Coins, 
  FileText, 
  Calendar 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'matches' | 'scheduled'>('profile');
  const [userProfile, setUserProfile] = useState<CollaborationProfile>(() => loadSavedUserProfile());
  const [matches, setMatches] = useState<MatchedPartner[]>(() => loadSavedMatches());
  const [scheduledMeetings, setScheduledMeetings] = useState<MatchedPartner[]>(() => loadSavedScheduledMeetings());
  const [resumeHistory, setResumeHistory] = useState<SavedResumeSummary[]>(() => loadSavedResumeHistory());
  const [chatBadges, setChatBadges] = useState<ChatHistoryBadge[]>(() => loadChatHistoryBadges());
  const [walletState, setWalletState] = useState<SolanaWalletState>(() => getInitialWalletState());
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isRefreshingMatches, setIsRefreshingMatches] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isSavedProfilesModalOpen, setIsSavedProfilesModalOpen] = useState(false);
  const [activeInvitePartner, setActiveInvitePartner] = useState<MatchedPartner | null>(null);
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [parserModalMode, setParserModalMode] = useState<'text' | 'file'>('text');

  // Fetch persisted data and real matches and scheduled meetings from server on initial load
  useEffect(() => {
    fetchProfileFromServer().then((data) => {
      if (data) {
        if (data.profile) setUserProfile(data.profile);
        if (data.matches && data.matches.length > 0) setMatches(data.matches);
        if (data.history) setResumeHistory(data.history);
        if (data.scheduledMeetings && data.scheduledMeetings.length > 0) {
          setScheduledMeetings(data.scheduledMeetings);
        }
      }
    });
  }, []);

  // Wrap setWalletState to automatically persist to storage
  const handleUpdateWalletState: React.Dispatch<React.SetStateAction<SolanaWalletState>> = (action) => {
    setWalletState((prev) => {
      const next = typeof action === 'function' ? (action as any)(prev) : action;
      saveWalletState(next);
      return next;
    });
  };

  const handleOpenParser = (mode: 'text' | 'file') => {
    setParserModalMode(mode);
    setIsParserModalOpen(true);
  };

  // When a fresh profile is generated via resume parser - with REAL matches & history retention
  const handleProfileGenerated = (
    newProfile: CollaborationProfile,
    newMatches?: MatchedPartner[],
    newHistory?: SavedResumeSummary[]
  ) => {
    setUserProfile(newProfile);
    saveUserProfile(newProfile);

    if (newMatches && newMatches.length > 0) {
      // Re-hydrate any existing scheduled meetings into the new matches
      const scheduledMap = new Map(scheduledMeetings.map(m => [m.id, m]));
      const hydrated = newMatches.map(m => {
        const s = scheduledMap.get(m.id);
        return s ? { ...m, ...s } : m;
      });
      setMatches(hydrated);
      saveMatches(hydrated);
    }

    if (newHistory && newHistory.length > 0) {
      setResumeHistory(newHistory);
      saveResumeHistory(newHistory);
    }

    // Automatically navigate to 'matches' tab so user instantly views the genuine matches!
    setActiveTab('matches');
  };

  // Switch to another saved profile in history
  const handleSwitchProfile = async (profileId: string) => {
    const res = await switchProfileOnServer(profileId);
    if (res) {
      setUserProfile(res.profile);
      // Re-hydrate any existing scheduled meetings into the switched matches
      const scheduledMap = new Map(scheduledMeetings.map(m => [m.id, m]));
      const hydrated = (res.matches || []).map(m => {
        const s = scheduledMap.get(m.id);
        return s ? { ...m, ...s } : m;
      });
      setMatches(hydrated);
      saveMatches(hydrated);
      setResumeHistory(res.history);
    }
  };

  // Delete a saved profile in history
  const handleDeleteProfile = async (profileId: string) => {
    const res = await deleteProfileOnServer(profileId);
    if (res) {
      setUserProfile(res.activeProfile);
      const scheduledMap = new Map(scheduledMeetings.map(m => [m.id, m]));
      const hydrated = (res.matches || []).map(m => {
        const s = scheduledMap.get(m.id);
        return s ? { ...m, ...s } : m;
      });
      setMatches(hydrated);
      saveMatches(hydrated);
      setResumeHistory(res.history);
    }
  };

  // Trigger partner matching refresh (via Gemini API + Solana fee)
  const handleRefreshMatches = async () => {
    setIsRefreshingMatches(true);
    try {
      const res = await fetch('/api/match-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile })
      });
      const data = await res.json();
      if (data.matches && data.matches.length > 0) {
        // Re-hydrate any existing scheduled meetings into the refreshed matches
        const scheduledMap = new Map(scheduledMeetings.map(m => [m.id, m]));
        const hydrated = data.matches.map((m: MatchedPartner) => {
          const s = scheduledMap.get(m.id);
          return s ? { ...m, ...s } : m;
        });
        setMatches(hydrated);
        saveMatches(hydrated);
      }
    } catch (err) {
      console.error('Failed to refresh matches:', err);
    } finally {
      setIsRefreshingMatches(false);
    }
  };

  // When user schedules a Phone Chat - persistently save to BOTH localStorage and Server Database!
  const handleScheduleConfirmed = (partnerId: string, scheduledTime: string, note?: string) => {
    const target = matches.find((m) => m.id === partnerId) || activeInvitePartner;
    if (!target) return;

    const scheduledItem: MatchedPartner = {
      ...target,
      invitationStatus: 'scheduled' as const,
      scheduledTime,
      scheduledNote: note || '',
      scheduledTimestamp: Date.now(),
      calendarSynced: true,
    };

    // 1. Update scheduledMeetings state & localStorage
    setScheduledMeetings((prev) => {
      const next = [...prev.filter((m) => m.id !== partnerId), scheduledItem];
      saveScheduledMeetings(next);
      return next;
    });

    // 2. Update matches carousel state & localStorage
    setMatches((prev) => {
      const next = prev.map((m) => (m.id === partnerId ? scheduledItem : m));
      saveMatches(next);
      return next;
    });

    // 3. Persist to server database endpoint
    apiScheduleMeeting(scheduledItem, scheduledTime, note);
  };

  // When user cancels a scheduled Phone Chat - update BOTH localStorage and Server Database!
  const handleCancelScheduled = (partnerId: string) => {
    // 1. Remove from scheduledMeetings state & localStorage
    setScheduledMeetings((prev) => {
      const next = prev.filter((m) => m.id !== partnerId);
      saveScheduledMeetings(next);
      return next;
    });

    // 2. Revert invitation status in matches carousel
    setMatches((prev) => {
      const next = prev.map((m) =>
        m.id === partnerId
          ? {
              ...m,
              invitationStatus: 'uninvited' as const,
              scheduledTime: undefined,
              scheduledNote: undefined,
              scheduledTimestamp: undefined,
              calendarSynced: false,
            }
          : m
      );
      saveMatches(next);
      return next;
    });

    // 3. Persist cancellation to server database
    apiCancelMeeting(partnerId);
  };

  // When a new badge is minted after a completed Phone Chat
  const handleBadgeMinted = (newBadge: ChatHistoryBadge) => {
    setChatBadges((prev) => {
      const updated = [newBadge, ...prev];
      saveChatHistoryBadges(updated);
      return updated;
    });
  };

  // Reset to initial demo state
  const handleResetDemoData = () => {
    resetAllDataToDefault();
    setUserProfile(INITIAL_USER_PROFILE);
    setMatches(WEEKLY_5_MATCHES);
    setScheduledMeetings([]);
    setWalletState(getInitialWalletState());
    setChatBadges(loadChatHistoryBadges());
  };

  const scheduledPartners = scheduledMeetings;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletState={walletState}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        matchCount={matches.length}
        scheduledCount={scheduledMeetings.length}
        onOpenSavedProfiles={() => setIsSavedProfilesModalOpen(true)}
        savedProfilesCount={resumeHistory.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-5 pb-1 sm:pb-3 space-y-2.5 sm:space-y-5">
        
        {/* TAB 1: Profile Archive - Only shows person's name, cooperation profile and clean parse entry */}
        {activeTab === 'profile' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
            {/* Profile Viewer */}
            <ProfileViewer
              profile={userProfile}
              onGoToMatches={() => setActiveTab('matches')}
              onOpenParser={handleOpenParser}
              onOpenHistory={() => setIsSavedProfilesModalOpen(true)}
              historyCount={resumeHistory.length}
            />

            {/* Clean Parser Modal */}
            <ResumeParserModal
              isOpen={isParserModalOpen}
              onClose={() => setIsParserModalOpen(false)}
              initialMode={parserModalMode}
              onProfileGenerated={handleProfileGenerated}
              isLoading={isLoadingProfile}
              setIsLoading={setIsLoadingProfile}
            />
          </div>
        )}

        {/* TAB 2: Weekly 5-Partner Rotatable Carousel */}
        {activeTab === 'matches' && (
          <div className="animate-in fade-in duration-300">
            <MatchingCarousel
              userProfile={userProfile}
              matches={matches}
              onInvitePartner={(partner) => setActiveInvitePartner(partner)}
              walletState={walletState}
              setWalletState={handleUpdateWalletState}
              onRefreshMatches={handleRefreshMatches}
              isRefreshing={isRefreshingMatches}
            />
          </div>
        )}

        {/* TAB 3: Confirmed Scheduled Phone Chats */}
        {activeTab === 'scheduled' && (
          <div className="animate-in fade-in duration-300">
            <ScheduledMeetingsList
              scheduledPartners={scheduledPartners}
              userProfile={userProfile}
              badges={chatBadges}
              onBadgeMinted={handleBadgeMinted}
              onGoToMatches={() => setActiveTab('matches')}
              onCancelScheduled={handleCancelScheduled}
              onResetDemoData={handleResetDemoData}
            />
          </div>
        )}
      </main>

      {/* Redesigned Tech Architecture & Trust Mechanism Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 pt-3 pb-20 md:pb-5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Platform Copyright & Architecture Signature */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-[10px] sm:text-[11px] text-slate-500 text-center">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-400">Spark Chat</span>
              <span>·</span>
              <span>灵感通话一周一次</span>
              <span className="hidden sm:inline">· 商业合作画像与去中心化撮合</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Solana Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletState={walletState}
        setWalletState={handleUpdateWalletState}
      />

      {/* Retained Resumes & Profiles Modal */}
      <SavedProfilesModal
        isOpen={isSavedProfilesModalOpen}
        onClose={() => setIsSavedProfilesModalOpen(false)}
        history={resumeHistory}
        currentProfile={userProfile}
        onSwitchProfile={handleSwitchProfile}
        onDeleteProfile={handleDeleteProfile}
        onOpenUpload={handleOpenParser}
      />

      {/* Phone Chat Scheduling Dialogue Modal */}
      {activeInvitePartner && (
        <SchedulingDialog
          isOpen={!!activeInvitePartner}
          onClose={() => setActiveInvitePartner(null)}
          partner={activeInvitePartner}
          userProfile={userProfile}
          walletState={walletState}
          setWalletState={handleUpdateWalletState}
          onScheduleConfirmed={handleScheduleConfirmed}
        />
      )}
    </div>
  );
}
