import {
  JobApplication,
  WeeklySummaryLog,
  WeeklyConfirmationRecord,
  PartTimeEarningsRecord,
  ClaimantProfile
} from '../types';

export const INITIAL_CLAIMANT_PROFILE: ClaimantProfile = {
  claimantName: '',
  claimantPhone: '',
  claimantEmail: '',
  claimantZip: '',
  last4SSN: '',
};

// Default empty for other users and clean installs (Zero data leakage to other users)
export const INITIAL_JOB_APPLICATIONS: JobApplication[] = [];
export const INITIAL_WEEKLY_SUMMARIES: WeeklySummaryLog[] = [];
export const INITIAL_CONFIRMATIONS: WeeklyConfirmationRecord[] = [];
export const INITIAL_EARNINGS: PartTimeEarningsRecord[] = [];
