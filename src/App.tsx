import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  JobApplication,
  JobStatus,
  WeeklySummaryLog,
  WeeklyConfirmationRecord,
  AppealRecord,
  PartTimeEarningsRecord,
  PrivacySettings,
  ClaimantProfile,
  ConfiguredJob,
  AppPreferences
} from './types';
import {
  getAppPreferences,
  saveAppPreferences,
  getPrivacySettings,
  savePrivacySettings,
  getJobApplications,
  saveJobApplications,
  getWeeklySummaries,
  saveWeeklySummaries,
  getWeeklyConfirmations,
  saveWeeklyConfirmations,
  getAppeals,
  saveAppeals,
  getPartTimeEarnings,
  savePartTimeEarnings,
  getConfiguredJobs,
  saveConfiguredJobs,
  getClaimantProfile,
  saveClaimantProfile,
  authorizeDevice,
  revokeAllOtherDevices,
  exportFullBackup,
  importFullBackup,
  clearAllLocalData
} from './services/storage';
import { exportJobsToCSV, downloadFile } from './utils/csv';
import { decryptSecret } from './utils/crypto';
import { normalizeJobSource } from './utils/source';

// Components
import { Header } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { GeneralSummary } from './components/GeneralSummary';
import { JobTable } from './components/JobTable';
import { TranscribeAssistant } from './components/TranscribeAssistant';
import { JobModal } from './components/JobModal';
import { WeeklyComplianceView } from './components/WeeklyComplianceView';
import { EarningsCalculatorView } from './components/EarningsCalculatorView';
import { PrintableLogModal } from './components/PrintableLogModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { VaultModal } from './components/VaultModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';

export const App: React.FC = () => {
  // Preferences: Claims Mode & State
  const [preferences, setPreferences] = useState<AppPreferences>(() => getAppPreferences());
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => getPrivacySettings());
  const [jobs, setJobs] = useState<JobApplication[]>(() => getJobApplications());
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummaryLog[]>(() => getWeeklySummaries());
  const [confirmations, setConfirmations] = useState<WeeklyConfirmationRecord[]>(() => getWeeklyConfirmations());
  const [appeals, setAppeals] = useState<AppealRecord[]>(() => getAppeals());
  const [earnings, setEarnings] = useState<PartTimeEarningsRecord[]>(() => getPartTimeEarnings());
  const [configuredJobs, setConfiguredJobs] = useState<ConfiguredJob[]>(() => getConfiguredJobs());
  const [profile, setProfile] = useState<ClaimantProfile>(() => getClaimantProfile());

  // Active view tab: 'jobs' | 'weekly' | 'earnings'
  const [activeTab, setActiveTab] = useState<'jobs' | 'weekly' | 'earnings'>('jobs');

  // Search, Filter, and Sort State (Shared between JobTable, TranscribeAssistant, and Keyboard Navigation)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'employer' | 'source' | 'status'>('date-desc');

  // Filtered and Sorted Jobs (Newest applications at the top by default)
  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch =
          !searchQuery ||
          job.employerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.result.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSource =
          sourceFilter === 'all' ||
          normalizeJobSource(job.jobSource).toLowerCase() === sourceFilter.toLowerCase() ||
          job.jobSource.toLowerCase() === sourceFilter.toLowerCase();

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(a.dateApplied).getTime() - new Date(b.dateApplied).getTime();
        }
        if (sortBy === 'employer') {
          return a.employerName.localeCompare(b.employerName);
        }
        if (sortBy === 'source') {
          return normalizeJobSource(a.jobSource).localeCompare(normalizeJobSource(b.jobSource));
        }
        if (sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [jobs, searchQuery, statusFilter, sourceFilter, sortBy]);

  // Currently selected job (defaults to #1 entry in the sorted list, e.g. Techquidation)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => {
    const initial = getJobApplications();
    const sorted = [...initial].sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime());
    return sorted.length > 0 ? sorted[0].id : null;
  });

  // Vault / Security state
  const [masterPasscode, setMasterPasscode] = useState<string | null>(null);
  const [hasMasterPasscode, setHasMasterPasscode] = useState<boolean>(() => {
    return !!localStorage.getItem('joblog_vault_check_v1');
  });
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | undefined>(undefined);

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDeviceSyncModalOpen, setIsDeviceSyncModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  // File input ref for backup import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state changes to localStorage
  useEffect(() => {
    saveAppPreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    savePrivacySettings(privacySettings);
  }, [privacySettings]);

  useEffect(() => {
    saveJobApplications(jobs);
  }, [jobs]);

  useEffect(() => {
    saveWeeklySummaries(weeklySummaries);
  }, [weeklySummaries]);

  useEffect(() => {
    saveWeeklyConfirmations(confirmations);
  }, [confirmations]);

  useEffect(() => {
    saveAppeals(appeals);
  }, [appeals]);

  useEffect(() => {
    savePartTimeEarnings(earnings);
  }, [earnings]);

  useEffect(() => {
    saveConfiguredJobs(configuredJobs);
  }, [configuredJobs]);

  useEffect(() => {
    saveClaimantProfile(profile);
  }, [profile]);

  // Selected Job Object from displayed list (falls back to filteredJobs[0])
  const selectedJob = filteredJobs.find(j => j.id === selectedJobId) || filteredJobs[0] || null;

  // Auto-decrypt password for selected job if vault is unlocked
  useEffect(() => {
    if (selectedJob?.portalCredentials?.encryptedPassword && masterPasscode) {
      decryptSecret(selectedJob.portalCredentials.encryptedPassword, masterPasscode)
        .then(pwd => setDecryptedPassword(pwd))
        .catch(() => setDecryptedPassword(undefined));
    } else {
      setDecryptedPassword(undefined);
    }
  }, [selectedJob, masterPasscode]);

  // Keyboard navigation for highlighted rows (Up / Down arrows traverse the displayed list logically)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const currentIndex = filteredJobs.findIndex(j => j.id === selectedJobId);
        if (currentIndex === -1) {
          if (filteredJobs.length > 0) setSelectedJobId(filteredJobs[0].id);
          return;
        }

        if (e.key === 'ArrowDown' && currentIndex < filteredJobs.length - 1) {
          e.preventDefault();
          const targetJob = filteredJobs[currentIndex + 1];
          setSelectedJobId(targetJob.id);
          const elem = document.getElementById(`job-row-${targetJob.id}`);
          if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (e.key === 'ArrowUp' && currentIndex > 0) {
          e.preventDefault();
          const targetJob = filteredJobs[currentIndex - 1];
          setSelectedJobId(targetJob.id);
          const elem = document.getElementById(`job-row-${targetJob.id}`);
          if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredJobs, selectedJobId]);

  // Handlers for Jobs with immediate persistent saving
  const handleSelectJob = (job: JobApplication) => {
    setSelectedJobId(job.id);
  };

  const handleOpenNewJob = () => {
    setEditingJob(null);
    setIsJobModalOpen(true);
  };

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setIsJobModalOpen(true);
  };

  const handleSaveJob = (savedJob: JobApplication) => {
    setJobs(prev => {
      let updated: JobApplication[];
      if (editingJob) {
        updated = prev.map(j => (j.id === savedJob.id ? savedJob : j));
      } else {
        updated = [savedJob, ...prev];
      }
      saveJobApplications(updated);
      return updated;
    });
    setSelectedJobId(savedJob.id);
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => {
      const updated = prev.filter(j => j.id !== jobId);
      saveJobApplications(updated);
      return updated;
    });
    if (selectedJobId === jobId) {
      setSelectedJobId(null);
    }
  };

  const handleToggleReported = (jobId: string) => {
    setJobs(prev => {
      const updated = prev.map(j =>
        j.id === jobId ? { ...j, reportedToClaimantPortal: !j.reportedToClaimantPortal, updatedAt: Date.now() } : j
      );
      saveJobApplications(updated);
      return updated;
    });
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    setJobs(prev => {
      const updated = prev.map(j => (j.id === jobId ? { ...j, status: newStatus, updatedAt: Date.now() } : j));
      saveJobApplications(updated);
      return updated;
    });
  };

  // Handlers for Confirmations & Weekly Summaries
  const handleAddConfirmation = (record: WeeklyConfirmationRecord) => {
    setConfirmations(prev => [...prev, record]);
  };

  const handleUpdateConfirmation = (record: WeeklyConfirmationRecord) => {
    setConfirmations(prev => prev.map(c => (c.id === record.id ? record : c)));
  };

  const handleDeleteConfirmation = (id: string) => {
    setConfirmations(prev => prev.filter(c => c.id !== id));
  };

  const handleAddAppeal = (record: AppealRecord) => {
    setAppeals(prev => {
      const updated = [...prev, record];
      saveAppeals(updated);
      return updated;
    });
  };

  const handleUpdateAppeal = (record: AppealRecord) => {
    setAppeals(prev => {
      const updated = prev.map(a => (a.id === record.id ? record : a));
      saveAppeals(updated);
      return updated;
    });
  };

  const handleDeleteAppeal = (id: string) => {
    setAppeals(prev => {
      const updated = prev.filter(a => a.id !== id);
      saveAppeals(updated);
      return updated;
    });
  };

  const handleAddWeeklySummary = (summary: WeeklySummaryLog) => {
    setWeeklySummaries(prev => [...prev, summary]);
  };

  const handleUpdateWeeklySummary = (summary: WeeklySummaryLog) => {
    setWeeklySummaries(prev => prev.map(w => (w.id === summary.id ? summary : w)));
  };

  const handleDeleteWeeklySummary = (id: string) => {
    setWeeklySummaries(prev => prev.filter(w => w.id !== id));
  };

  // Handlers for Earnings
  const handleAddEarnings = (record: PartTimeEarningsRecord) => {
    setEarnings(prev => [...prev, record]);
  };

  const handleUpdateEarnings = (record: PartTimeEarningsRecord) => {
    setEarnings(prev => prev.map(e => (e.id === record.id ? record : e)));
  };

  const handleDeleteEarnings = (id: string) => {
    setEarnings(prev => prev.filter(e => e.id !== id));
  };

  const handleSaveConfiguredJobs = (newJobs: ConfiguredJob[]) => {
    setConfiguredJobs(newJobs);
  };

  // Export / Import
  const handleExportCsv = () => {
    const csvContent = exportJobsToCSV(jobs);
    downloadFile(csvContent, `JobLog_${preferences.selectedState}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const handleExportJson = () => {
    const jsonBackup = exportFullBackup();
    downloadFile(jsonBackup, `JobLog_Backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const handleImportFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        const result = importFullBackup(content);
        if (result.success) {
          alert(result.message);
          window.location.reload();
        } else {
          alert('Import failed: ' + result.message);
        }
      }
    };
    reader.readAsText(file);
  };

  // Vault Master Passcode
  const handleSetPasscode = (passcode: string) => {
    setMasterPasscode(passcode);
    setIsVaultUnlocked(true);
    setHasMasterPasscode(true);
    localStorage.setItem('joblog_vault_check_v1', 'enabled');
  };

  const handleUnlockVault = (passcode: string): boolean => {
    setMasterPasscode(passcode);
    setIsVaultUnlocked(true);
    return true;
  };

  const handleLockVault = () => {
    setMasterPasscode(null);
    setIsVaultUnlocked(false);
    setDecryptedPassword(undefined);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hidden File Input for Backup Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFileSelected}
        accept=".json,.csv"
        className="hidden"
      />

      {/* Top Application Header */}
      <Header
        preferences={preferences}
        onUpdatePreferences={setPreferences}
        privacySettings={privacySettings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewJob={handleOpenNewJob}
        onOpenPrint={() => setIsPrintModalOpen(true)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        onOpenDeviceSync={() => setIsDeviceSyncModalOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        isVaultUnlocked={isVaultUnlocked}
        hasMasterPasscode={hasMasterPasscode}
        totalJobs={jobs.length}
        totalInterviews={jobs.filter(j => j.status === 'Interview').length}
        totalOffers={jobs.filter(j => j.status === 'Offer').length}
        totalDenied={jobs.filter(j => j.status === 'Denied').length}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportClick={() => fileInputRef.current?.click()}
      />

      {/* Privacy Consent Banner */}
      {!privacySettings.hasConsented && (
        <PrivacyBanner
          onAccept={() => {
            const updated = { ...privacySettings, hasConsented: true, consentTimestamp: Date.now() };
            setPrivacySettings(updated);
          }}
          onOpenSettings={() => setIsPrivacyModalOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
        {/* Job Applications View */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {/* General Search Summary Dashboard */}
            <GeneralSummary jobs={jobs} />

            {/* Active Selection Box: ONLY shown if Unemployment Claims Mode is ON! */}
            {preferences.unemploymentClaimsMode && selectedJob && (
              <TranscribeAssistant
                selectedJob={selectedJob}
                displayedJobs={filteredJobs}
                onSelectJob={handleSelectJob}
                onToggleReported={handleToggleReported}
                onStatusChange={handleStatusChange}
                selectedState={preferences.selectedState}
                decryptedPassword={decryptedPassword}
                onUnlockVaultRequest={() => setIsVaultModalOpen(true)}
              />
            )}

            <JobTable
              jobs={jobs}
              filteredJobs={filteredJobs}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sourceFilter={sourceFilter}
              setSourceFilter={setSourceFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              selectedJobId={selectedJobId}
              unemploymentClaimsMode={preferences.unemploymentClaimsMode}
              onSelectJob={handleSelectJob}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
              onToggleReported={handleToggleReported}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}

        {/* Weekly Certifications & Confirmations View (Only available in Claims mode) */}
        {activeTab === 'weekly' && preferences.unemploymentClaimsMode && (
          <WeeklyComplianceView
            jobs={jobs}
            weeklySummaries={weeklySummaries}
            confirmations={confirmations}
            appeals={appeals}
            selectedState={preferences.selectedState}
            onAddConfirmation={handleAddConfirmation}
            onUpdateConfirmation={handleUpdateConfirmation}
            onDeleteConfirmation={handleDeleteConfirmation}
            onAddAppeal={handleAddAppeal}
            onUpdateAppeal={handleUpdateAppeal}
            onDeleteAppeal={handleDeleteAppeal}
            onAddWeeklySummary={handleAddWeeklySummary}
            onUpdateWeeklySummary={handleUpdateWeeklySummary}
            onDeleteWeeklySummary={handleDeleteWeeklySummary}
          />
        )}

        {/* Earnings View */}
        {activeTab === 'earnings' && (
          <EarningsCalculatorView
            earnings={earnings}
            configuredJobs={configuredJobs}
            onSaveConfiguredJobs={handleSaveConfiguredJobs}
            onAddEarnings={handleAddEarnings}
            onUpdateEarnings={handleUpdateEarnings}
            onDeleteEarnings={handleDeleteEarnings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-700">JobLog • Job Application Tracker</span>
          <span className="text-[11px] text-slate-400">
            Local device storage • 100% private to this device
          </span>
        </div>
      </footer>

      {/* Modals */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
        initialJob={editingJob}
        masterPasscode={masterPasscode}
      />

      <PrintableLogModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        jobs={jobs}
        selectedState={preferences.selectedState}
      />

      <DeviceSyncModal
        isOpen={isDeviceSyncModalOpen}
        onClose={() => setIsDeviceSyncModalOpen(false)}
        privacySettings={privacySettings}
        onAuthorizeDevice={name => {
          authorizeDevice(name);
          setPrivacySettings(getPrivacySettings());
        }}
        onRevokeAllOtherDevices={() => {
          revokeAllOtherDevices();
          setPrivacySettings(getPrivacySettings());
        }}
        onToggleSync={enabled => {
          const updated = { ...privacySettings, allowCrossDeviceSync: enabled };
          setPrivacySettings(updated);
        }}
      />

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        hasMasterPasscode={hasMasterPasscode}
        isUnlocked={isVaultUnlocked}
        onSetPasscode={handleSetPasscode}
        onUnlockVault={handleUnlockVault}
        onLockVault={handleLockVault}
      />

      <PrivacySettingsModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        settings={privacySettings}
        onUpdateSettings={setPrivacySettings}
        totalJobs={jobs.length}
        onClearAllData={() => {
          clearAllLocalData();
          window.location.reload();
        }}
        onExportBackup={handleExportJson}
      />
    </div>
  );
};

export default App;
