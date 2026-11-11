export type JobStatus = 'Applied' | 'Interview' | 'Offer' | 'Denied' | 'Saved';

export type ContactType = 'New' | 'Follow-up' | 'Networking' | 'Inquiry';

export type ApplicationMethod = 'Online' | 'Email' | 'In-Person' | 'Phone' | 'Career Fair' | 'Recruiter' | 'Other';

export interface EncryptedPayload {
  cipherText: string;
  iv: string;
  salt: string;
}

export interface PortalCredentials {
  portalUrl?: string;
  username?: string;
  encryptedPassword?: EncryptedPayload;
  notes?: string;
}

export interface JobApplication {
  id: string;
  dateApplied: string;        // YYYY-MM-DD
  employerName: string;
  employerWebsite: string;
  address: string;
  jobTitle: string;
  location: string;
  jobSource: string;
  applicationMethod: string;
  contactPerson: string;
  phoneNumber: string;
  status: JobStatus;
  typeOfContact: ContactType;
  followUpDate: string;
  daysSinceApplied?: number;
  result: string;
  notes: string;
  benefitWeekEnding?: string;
  portalCredentials?: PortalCredentials;
  reportedToClaimantPortal?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WeeklySummaryLog {
  id: string;
  weekStart: string;
  weekEnd: string;
  applicationsSent: number;
  interviews: number;
  networkingContacts: number;
  followupsDone: number;
  notes: string;
  confirmationNumber?: string;
  appealStatus?: string;
  appealDate?: string;
  appealConfirmation?: string;
  court?: string;
}

export interface WeeklyConfirmationRecord {
  id: string;
  weekEnding: string;
  confirmationNumber: string;
  appealDate?: string;
  appealConfirmation?: string;
  court?: string;
  notes?: string;
}

export interface AppealRecord {
  id: string;
  appealDate: string;
  appealConfirmation: string;
  court: string;
  relatedWeekEnding?: string;
  notes?: string;
}

export interface ConfiguredJob {
  id: string;
  name: string;
  hourlyRate: number;
  isActive?: boolean;
}

export interface EarningsJobEntry {
  jobId: string;
  jobName: string;
  hours: number;
  rate: number;
  total: number;
}

export interface PartTimeEarningsRecord {
  id: string;
  weekStart: string;
  weekEnd: string;
  job1Hours: number;
  job2Hours: number;
  job1Rate: number;
  job2Rate: number;
  job1Total: number;
  job2Total: number;
  totalAmount: number;
  notes: string;
  customEntries?: EarningsJobEntry[];
}

export interface PrivacySettings {
  hasConsented: boolean;
  consentTimestamp?: number;
  allowLocalStorage: boolean;
  allowCrossDeviceSync: boolean;
  allowAnonymousMetrics: boolean;
  deviceId: string;
  deviceName: string;
  authorizedDevices: AuthorizedDevice[];
}

export interface AuthorizedDevice {
  deviceId: string;
  deviceName: string;
  firstAuthorizedAt: number;
  lastActiveAt: number;
  isCurrent: boolean;
  ipHint?: string;
}

export interface ClaimantProfile {
  claimantName: string;
  claimantPhone: string;
  claimantEmail: string;
  claimantZip: string;
  last4SSN?: string;
}

export interface AppPreferences {
  unemploymentClaimsMode: boolean; // Toggle for unemployment claims reporting mode
  selectedState: string;          // Default 'GA'
}
