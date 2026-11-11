import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Building,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  Search,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Send
} from 'lucide-react';
import { JobApplication, JobStatus } from '../types';
import { formatDaysAgo } from '../utils/date';

interface TranscribeAssistantProps {
  selectedJob: JobApplication | null;
  displayedJobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onToggleReported: (jobId: string) => void;
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
  selectedState: string;
  decryptedPassword?: string;
  onUnlockVaultRequest?: () => void;
}

export const TranscribeAssistant: React.FC<TranscribeAssistantProps> = ({
  selectedJob,
  displayedJobs,
  onSelectJob,
  onToggleReported,
  onStatusChange,
  selectedState,
  decryptedPassword,
  onUnlockVaultRequest,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!selectedJob) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-500 shadow-2xs">
        <ClipboardList className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800 mb-0.5">Active Job Selection</h3>
        <p className="text-xs max-w-md mx-auto text-slate-500">
          Click any row in the table below to pin and inspect all fields in state claim reporting sequence.
        </p>
      </div>
    );
  }

  const currentIndex = displayedJobs.findIndex(j => j.id === selectedJob.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < displayedJobs.length - 1;

  const handlePrev = () => {
    if (hasPrev) onSelectJob(displayedJobs[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onSelectJob(displayedJobs[currentIndex + 1]);
  };

  const handleCopy = (fieldName: string, text: string) => {
    if (!text || text === 'NA') return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const daysAgoText = formatDaysAgo(selectedJob.dateApplied);

  // EXACT CLAIMANT PORTAL QUESTION ORDER:
  // 1. Date Applied / Contact Date
  // 2. Method / Activity Type
  // 3. Name of Company / Employer
  // 4. Phone Number
  // 5. Address (Street, City, State, Zip)
  // 6. Website of Employer
  // 7. Where Found / Job Source
  // 8. Job Title
  const portalFields = [
    {
      id: 'date',
      number: '1',
      label: 'Date Applied',
      value: selectedJob.dateApplied,
      icon: Calendar,
      help: 'Exact date of application',
    },
    {
      id: 'method',
      number: '2',
      label: 'Method / Activity',
      value: selectedJob.applicationMethod || 'Online',
      icon: Send,
      help: 'Online, In-Person, Phone, Email',
    },
    {
      id: 'company',
      number: '3',
      label: 'Name of Company',
      value: selectedJob.employerName,
      icon: Building,
      help: 'Official company name',
    },
    {
      id: 'phone',
      number: '4',
      label: 'Phone Number',
      value: selectedJob.phoneNumber || 'NA',
      icon: Phone,
      help: 'Employer phone or HR number',
    },
    {
      id: 'address',
      number: '5',
      label: 'Address',
      value: selectedJob.address || selectedJob.location || `${selectedState} (Remote / Online)`,
      icon: MapPin,
      help: 'Street, City, State, Zip',
    },
    {
      id: 'website',
      number: '6',
      label: 'Website of Employer',
      value: selectedJob.employerWebsite || 'NA',
      icon: Globe,
      isUrl: true,
      help: 'Employer website or portal',
    },
    {
      id: 'whereFound',
      number: '7',
      label: 'Where Found',
      value: selectedJob.jobSource || 'Worksource GA',
      icon: Search,
      help: 'Job board, site, or referral',
    },
    {
      id: 'jobTitle',
      number: '8',
      label: 'Job Title',
      value: selectedJob.jobTitle,
      icon: Briefcase,
      help: 'Specific job position title',
    },
  ];

  const getStatusBadgeColor = (status: JobStatus) => {
    switch (status) {
      case 'Offer':
        return 'text-emerald-800 bg-emerald-50 border-emerald-300';
      case 'Interview':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'Viewed':
        return 'text-purple-800 bg-purple-50 border-purple-300';
      case 'Denied':
        return 'text-rose-800 bg-rose-50 border-rose-300';
      case 'Applied':
        return 'text-sky-800 bg-sky-50 border-sky-300';
      case 'Saved':
      default:
        return 'text-slate-700 bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-indigo-200 shadow-2xs p-4 mb-5 transition-all no-print">
      {/* Top Header of the Selection Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-indigo-700">
                Active Selection #{currentIndex !== -1 ? currentIndex + 1 : 1} of {displayedJobs.length}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-600">{daysAgoText}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>{selectedJob.jobTitle}</span>
              <span className="text-slate-400 font-normal">at</span>
              <span className="text-slate-800">{selectedJob.employerName}</span>
            </h2>
          </div>
        </div>

        {/* Quick Status Selector, Mark Reported & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Status Dropdown */}
          {onStatusChange && (
            <div className="flex items-center gap-1">
              <select
                value={selectedJob.status}
                onChange={e => onStatusChange(selectedJob.id, e.target.value as JobStatus)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-bold cursor-pointer focus:outline-none transition ${getStatusBadgeColor(
                  selectedJob.status
                )}`}
                title="Change status - saves immediately to local storage"
              >
                <option value="Applied">Applied (Blue)</option>
                <option value="Viewed">Viewed (Purple)</option>
                <option value="Interview">Interview (Yellow)</option>
                <option value="Offer">Offer (Green)</option>
                <option value="Denied">Denied (Red)</option>
                <option value="Saved">Saved</option>
              </select>
            </div>
          )}

          <button
            onClick={() => onToggleReported(selectedJob.id)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition flex items-center gap-1.5 ${
              selectedJob.reportedToClaimantPortal
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2
              className={`w-3.5 h-3.5 ${
                selectedJob.reportedToClaimantPortal ? 'text-emerald-600' : 'text-slate-400'
              }`}
            />
            <span>
              {selectedJob.reportedToClaimantPortal
                ? `Reported to ${selectedState} Portal ✓`
                : `Mark Reported (${selectedState})`}
            </span>
          </button>

          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-xs">
            <button
              onClick={handlePrev}
              disabled={!hasPrev}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous application (Up Arrow)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-medium text-slate-600 px-2 border-x border-slate-200 font-mono">
              {currentIndex !== -1 ? currentIndex + 1 : 1}/{displayedJobs.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next application (Down Arrow)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid of 8 fields in exact question sequence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
        {portalFields.map(field => {
          const Icon = field.icon;
          const isCopied = copiedField === field.id;

          return (
            <div
              key={field.id}
              className="bg-slate-50/70 hover:bg-slate-50 rounded-lg border border-slate-200 p-2.5 flex flex-col justify-between transition hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <span className="w-3.5 h-3.5 rounded bg-slate-200 text-slate-700 font-bold inline-flex items-center justify-center text-[9px]">
                      {field.number}
                    </span>
                    <Icon className="w-3 h-3 text-slate-500" />
                    <span className="truncate">{field.label}</span>
                  </div>
                  {field.isUrl && field.value && field.value !== 'NA' && (
                    <a
                      href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 p-0.5"
                      title="Open website"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-900 break-words my-1 font-mono select-all">
                  {field.value || <span className="text-slate-400 font-sans font-normal italic">None</span>}
                </div>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {field.help}
                </span>

                <button
                  onClick={() => handleCopy(field.id, field.value)}
                  disabled={!field.value || field.value === 'NA'}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded flex items-center gap-1 transition ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supplementary Row */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact Person</span>
            <span className="font-semibold text-slate-800">{selectedJob.contactPerson || 'NA'}</span>
          </div>
          {selectedJob.contactPerson && selectedJob.contactPerson !== 'NA' && (
            <button
              onClick={() => handleCopy('contact', selectedJob.contactPerson)}
              className="text-slate-400 hover:text-indigo-600 p-1"
            >
              {copiedField === 'contact' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Status & Result</span>
            <span className="font-semibold text-slate-800">{selectedJob.status} • {selectedJob.result || 'NA'}</span>
          </div>
          {selectedJob.result && selectedJob.result !== 'NA' && (
            <button
              onClick={() => handleCopy('result', selectedJob.result)}
              className="text-slate-400 hover:text-indigo-600 p-1"
            >
              {copiedField === 'result' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>

        <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center justify-between">
          <div className="truncate mr-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Notes</span>
            <span className="font-medium text-slate-700 truncate block">
              {selectedJob.notes || 'None'}
            </span>
          </div>
          {selectedJob.notes && (
            <button
              onClick={() => handleCopy('notes', selectedJob.notes)}
              className="text-slate-400 hover:text-indigo-600 p-1 flex-shrink-0"
            >
              {copiedField === 'notes' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Optional Portal Credentials */}
      {selectedJob.portalCredentials && (
        <div className="mt-2.5 p-2.5 bg-slate-900 text-slate-100 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold">Portal Login:</span>
            {selectedJob.portalCredentials.username && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 font-mono">
                {selectedJob.portalCredentials.username}
              </span>
            )}
            {selectedJob.portalCredentials.encryptedPassword && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 font-mono">
                {showPassword && decryptedPassword ? decryptedPassword : '••••••••••••'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedJob.portalCredentials.encryptedPassword && decryptedPassword && (
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded flex items-center gap-1"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassword ? 'Hide' : 'Reveal'}</span>
              </button>
            )}

            {selectedJob.portalCredentials.encryptedPassword && !decryptedPassword && onUnlockVaultRequest && (
              <button
                onClick={onUnlockVaultRequest}
                className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold text-[11px]"
              >
                Unlock Vault
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
