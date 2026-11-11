import {
  JobApplication,
  WeeklySummaryLog,
  WeeklyConfirmationRecord,
  PartTimeEarningsRecord,
  PrivacySettings,
  ClaimantProfile,
  AuthorizedDevice,
  ConfiguredJob,
  AppPreferences
} from '../types';
import {
  INITIAL_JOB_APPLICATIONS,
  INITIAL_WEEKLY_SUMMARIES,
  INITIAL_CONFIRMATIONS,
  INITIAL_EARNINGS,
  INITIAL_CLAIMANT_PROFILE
} from '../data/initialData';
import { generateDeviceId, getDeviceDescription } from '../utils/crypto';

const STORAGE_KEYS = {
  PREFERENCES: 'joblog_preferences_v1',
  PRIVACY: 'joblog_privacy_v1',
  JOBS: 'joblog_jobs_v1',
  WEEKLY: 'joblog_weekly_v1',
  CONFIRMATIONS: 'joblog_confirmations_v1',
  EARNINGS: 'joblog_earnings_v1',
  EARNINGS_JOBS: 'joblog_user_jobs_v1',
  PROFILE: 'joblog_profile_v1',
  VAULT_CHECK: 'joblog_vault_check_v1',
};

// Preferences: Unemployment Claims Mode & State
export const DEFAULT_PREFERENCES: AppPreferences = {
  unemploymentClaimsMode: true, // Enabled for claimant reporting, easily toggled off for general job tracking
  selectedState: 'GA',
};

export function getAppPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) {
      saveAppPreferences(DEFAULT_PREFERENCES);
      return DEFAULT_PREFERENCES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PREFERENCES;
  }
}

export function saveAppPreferences(prefs: AppPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save preferences', e);
  }
}

// Default Configured Jobs (Private to this device)
export const DEFAULT_CONFIGURED_JOBS: ConfiguredJob[] = [
  { id: 'job-1', name: 'Publix', hourlyRate: 17.00 },
  { id: 'job-2', name: 'Chick-Fil-A', hourlyRate: 16.00 },
];

export function getConfiguredJobs(): ConfiguredJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EARNINGS_JOBS);
    if (!raw) {
      saveConfiguredJobs(DEFAULT_CONFIGURED_JOBS);
      return DEFAULT_CONFIGURED_JOBS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONFIGURED_JOBS;
  } catch (e) {
    return DEFAULT_CONFIGURED_JOBS;
  }
}

export function saveConfiguredJobs(jobs: ConfiguredJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EARNINGS_JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save configured jobs', e);
  }
}

// Default Privacy Settings
export function getDefaultPrivacySettings(): PrivacySettings {
  const deviceId = generateDeviceId();
  const deviceName = getDeviceDescription();
  const currentDevice: AuthorizedDevice = {
    deviceId,
    deviceName,
    firstAuthorizedAt: Date.now(),
    lastActiveAt: Date.now(),
    isCurrent: true,
  };

  return {
    hasConsented: false,
    allowLocalStorage: true,
    allowCrossDeviceSync: false,
    allowAnonymousMetrics: false,
    deviceId,
    deviceName,
    authorizedDevices: [currentDevice],
  };
}

export function getPrivacySettings(): PrivacySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRIVACY);
    if (!raw) return getDefaultPrivacySettings();
    return JSON.parse(raw);
  } catch (e) {
    return getDefaultPrivacySettings();
  }
}

export function savePrivacySettings(settings: PrivacySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRIVACY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save privacy settings', e);
  }
}

export function getClaimantProfile(): ClaimantProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return INITIAL_CLAIMANT_PROFILE;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CLAIMANT_PROFILE;
  }
}

export function saveClaimantProfile(profile: ClaimantProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save claimant profile', e);
  }
}

export function getJobApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
    if (!raw) {
      saveJobApplications(INITIAL_JOB_APPLICATIONS);
      return INITIAL_JOB_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_JOB_APPLICATIONS;
  } catch (e) {
    return INITIAL_JOB_APPLICATIONS;
  }
}

export function saveJobApplications(jobs: JobApplication[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  } catch (e) {
    console.error('Failed to save jobs', e);
  }
}

export function getWeeklySummaries(): WeeklySummaryLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY);
    if (!raw) {
      saveWeeklySummaries(INITIAL_WEEKLY_SUMMARIES);
      return INITIAL_WEEKLY_SUMMARIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_WEEKLY_SUMMARIES;
  }
}

export function saveWeeklySummaries(summaries: WeeklySummaryLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY, JSON.stringify(summaries));
  } catch (e) {
    console.error('Failed to save weekly summaries', e);
  }
}

export function getWeeklyConfirmations(): WeeklyConfirmationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFIRMATIONS);
    if (!raw) {
      saveWeeklyConfirmations(INITIAL_CONFIRMATIONS);
      return INITIAL_CONFIRMATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CONFIRMATIONS;
  }
}

export function saveWeeklyConfirmations(records: WeeklyConfirmationRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIRMATIONS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save confirmations', e);
  }
}

export function getPartTimeEarnings(): PartTimeEarningsRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EARNINGS);
    if (!raw) {
      savePartTimeEarnings(INITIAL_EARNINGS);
      return INITIAL_EARNINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_EARNINGS;
  }
}

export function savePartTimeEarnings(records: PartTimeEarningsRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save earnings', e);
  }
}

export function authorizeDevice(newDeviceName: string, ipHint?: string): AuthorizedDevice {
  const settings = getPrivacySettings();
  const newDevice: AuthorizedDevice = {
    deviceId: generateDeviceId(),
    deviceName: newDeviceName,
    firstAuthorizedAt: Date.now(),
    lastActiveAt: Date.now(),
    isCurrent: false,
    ipHint,
  };
  settings.authorizedDevices.push(newDevice);
  settings.allowCrossDeviceSync = true;
  savePrivacySettings(settings);
  return newDevice;
}

export function revokeAllOtherDevices(): void {
  const settings = getPrivacySettings();
  settings.authorizedDevices = settings.authorizedDevices.filter(d => d.isCurrent);
  settings.allowCrossDeviceSync = false;
  savePrivacySettings(settings);
}

export function exportFullBackup(): string {
  const exportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    preferences: getAppPreferences(),
    profile: getClaimantProfile(),
    jobs: getJobApplications(),
    weekly: getWeeklySummaries(),
    confirmations: getWeeklyConfirmations(),
    earnings: getPartTimeEarnings(),
    configuredJobs: getConfiguredJobs(),
    privacy: getPrivacySettings(),
  };
  return JSON.stringify(exportData, null, 2);
}

export function importFullBackup(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString);
    if (!data.jobs || !Array.isArray(data.jobs)) {
      return { success: false, message: 'Invalid backup format: missing job applications array' };
    }
    if (data.preferences) saveAppPreferences(data.preferences);
    if (data.profile) saveClaimantProfile(data.profile);
    if (data.jobs) saveJobApplications(data.jobs);
    if (data.weekly) saveWeeklySummaries(data.weekly);
    if (data.confirmations) saveWeeklyConfirmations(data.confirmations);
    if (data.earnings) savePartTimeEarnings(data.earnings);
    if (data.configuredJobs) saveConfiguredJobs(data.configuredJobs);
    return { success: true, message: `Successfully restored ${data.jobs.length} jobs and records!` };
  } catch (err: any) {
    return { success: false, message: 'JSON Parse Error: ' + err.message };
  }
}

export function clearAllLocalData(): void {
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  localStorage.removeItem(STORAGE_KEYS.JOBS);
  localStorage.removeItem(STORAGE_KEYS.WEEKLY);
  localStorage.removeItem(STORAGE_KEYS.CONFIRMATIONS);
  localStorage.removeItem(STORAGE_KEYS.EARNINGS);
  localStorage.removeItem(STORAGE_KEYS.EARNINGS_JOBS);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.PRIVACY);
  localStorage.removeItem(STORAGE_KEYS.VAULT_CHECK);
}
