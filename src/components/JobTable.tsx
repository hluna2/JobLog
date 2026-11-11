import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Building,
  Phone,
  Globe,
  MapPin,
  Calendar,
  ArrowUpDown
} from 'lucide-react';
import { JobApplication, JobStatus } from '../types';
import { formatDaysAgo, calculateDaysAgoNumber } from '../utils/date';

interface JobTableProps {
  jobs: JobApplication[];
  selectedJobId: string | null;
  unemploymentClaimsMode: boolean;
  onSelectJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (jobId: string) => void;
  onToggleReported: (jobId: string) => void;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
}

export const JobTable: React.FC<JobTableProps> = ({
  jobs,
  selectedJobId,
  unemploymentClaimsMode,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onToggleReported,
  onStatusChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'employer' | 'status'>('date-desc');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, key: string, value: string) => {
    e.stopPropagation();
    if (!value || value === 'NA') return;
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const uniqueSources = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach(j => {
      if (j.jobSource) set.add(j.jobSource);
    });
    return Array.from(set).sort();
  }, [jobs]);

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
        const matchesSource = sourceFilter === 'all' || job.jobSource.toLowerCase() === sourceFilter.toLowerCase();

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
        if (sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [jobs, searchQuery, statusFilter, sourceFilter, sortBy]);

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold';
      case 'Interview':
        return 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold';
      case 'Denied':
        return 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold';
      case 'Applied':
        return 'bg-sky-50 text-sky-800 border border-sky-300 font-semibold';
      case 'Saved':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold';
    }
  };

  const getRowBackground = (job: JobApplication, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-indigo-50/90 ring-1 ring-indigo-500 border-l-4 border-l-indigo-600 relative';
    }
    switch (job.status) {
      case 'Offer':
        return 'hover:bg-slate-50 bg-white border-l-4 border-l-emerald-500';
      case 'Interview':
        return 'hover:bg-slate-50 bg-white border-l-4 border-l-amber-500';
      case 'Denied':
        return 'hover:bg-slate-50 bg-white border-l-4 border-l-rose-400';
      case 'Applied':
        return 'hover:bg-slate-50 bg-white border-l-4 border-l-sky-400';
      case 'Saved':
      default:
        return 'hover:bg-slate-50 bg-white border-l-4 border-l-slate-300';
    }
  };

  return (
    <div className="space-y-3">
      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 no-print">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by title, employer, location, notes..."
            className="w-full pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({jobs.length})</option>
              <option value="Offer">Offers</option>
              <option value="Interview">Interviews</option>
              <option value="Applied">Applied</option>
              <option value="Denied">Denied</option>
              <option value="Saved">Saved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-400 text-[11px]">Source:</span>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="employer">Company A-Z</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 select-none">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3">Date Applied</th>
                <th className="py-2.5 px-3">Employer / Company</th>
                <th className="py-2.5 px-3">Job Title & Location</th>
                <th className="py-2.5 px-3">Website & Phone</th>
                <th className="py-2.5 px-3">Source & Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Result / Notes</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No applications found matching your search.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job, idx) => {
                  const isSelected = selectedJobId === job.id;
                  const rowClass = getRowBackground(job, isSelected);
                  const dynamicDaysAgo = formatDaysAgo(job.dateApplied);

                  return (
                    <tr
                      key={job.id}
                      onClick={() => onSelectJob(job)}
                      className={`cursor-pointer transition-colors ${rowClass}`}
                    >
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Date Applied (Dynamically accurately computed!) */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                          <span>{job.dateApplied}</span>
                          <button
                            onClick={e => handleCopy(e, `date-${job.id}`, job.dateApplied)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                            title="Copy Date"
                          >
                            {copiedKey === `date-${job.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {dynamicDaysAgo}
                        </span>
                      </td>

                      {/* Employer */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-bold text-slate-900">
                          <span>{job.employerName}</span>
                          <button
                            onClick={e => handleCopy(e, `emp-${job.id}`, job.employerName)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                            title="Copy Employer Name"
                          >
                            {copiedKey === `emp-${job.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {job.address && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{job.address}</span>
                          </div>
                        )}
                      </td>

                      {/* Title & Location */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>{job.jobTitle}</span>
                          <button
                            onClick={e => handleCopy(e, `title-${job.id}`, job.jobTitle)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                            title="Copy Job Title"
                          >
                            {copiedKey === `title-${job.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {job.location || 'Remote'}
                        </div>
                      </td>

                      {/* Website & Phone */}
                      <td className="py-2.5 px-3">
                        {job.employerWebsite ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={
                                job.employerWebsite.startsWith('http')
                                  ? job.employerWebsite
                                  : `https://${job.employerWebsite}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-indigo-600 hover:underline truncate max-w-[120px] inline-block font-mono text-[11px]"
                              title={job.employerWebsite}
                            >
                              {job.employerWebsite.replace(/^https?:\/\//, '').split('/')[0]}
                            </a>
                            <button
                              onClick={e => handleCopy(e, `web-${job.id}`, job.employerWebsite)}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                              title="Copy Website"
                            >
                              {copiedKey === `web-${job.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">NA</span>
                        )}

                        {job.phoneNumber && job.phoneNumber !== 'NA' && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{job.phoneNumber}</span>
                            <button
                              onClick={e => handleCopy(e, `phone-${job.id}`, job.phoneNumber)}
                              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded"
                              title="Copy Phone"
                            >
                              {copiedKey === `phone-${job.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Source & Method */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-700">{job.jobSource}</div>
                        <div className="text-[10px] text-slate-400">
                          {job.applicationMethod || 'Online'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <select
                          value={job.status}
                          onChange={e => onStatusChange(job.id, e.target.value as JobStatus)}
                          className={`text-xs px-2 py-0.5 rounded border font-semibold cursor-pointer focus:outline-none ${getStatusBadge(
                            job.status
                          )}`}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Interview">Interview</option>
                          <option value="Offer">Offer</option>
                          <option value="Denied">Denied</option>
                          <option value="Saved">Saved</option>
                        </select>
                      </td>

                      {/* Notes / Result */}
                      <td className="py-2.5 px-3">
                        {job.result && job.result !== 'NA' && (
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {job.result}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 truncate max-w-xs" title={job.notes}>
                          {job.notes}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {unemploymentClaimsMode && (
                            <button
                              onClick={() => onToggleReported(job.id)}
                              className={`p-1 rounded border transition ${
                                job.reportedToClaimantPortal
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'text-slate-400 hover:text-slate-600 border-slate-200'
                              }`}
                              title={
                                job.reportedToClaimantPortal
                                  ? 'Marked Reported to Portal'
                                  : 'Mark Reported'
                              }
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onEditJob(job)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Delete application for ${job.employerName}?`)) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
