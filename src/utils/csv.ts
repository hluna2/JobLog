import { JobApplication } from '../types';

function escapeCsvField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportJobsToCSV(jobs: JobApplication[]): string {
  const headers = [
    'Date Applied/Contacted',
    'Employer Name',
    'Employer Address/Website',
    'Address',
    'Job Title',
    'Location',
    'Job Source',
    'Application Method',
    'Contact Person',
    'Phone Number',
    'Status',
    'Type of Contact',
    'Follow-Up Date',
    'Days Since Applied',
    'Result',
    'Notes',
  ];

  const rows = jobs.map(job => [
    escapeCsvField(job.dateApplied),
    escapeCsvField(job.employerName),
    escapeCsvField(job.employerWebsite),
    escapeCsvField(job.address),
    escapeCsvField(job.jobTitle),
    escapeCsvField(job.location),
    escapeCsvField(job.jobSource),
    escapeCsvField(job.applicationMethod),
    escapeCsvField(job.contactPerson),
    escapeCsvField(job.phoneNumber),
    escapeCsvField(job.status),
    escapeCsvField(job.typeOfContact),
    escapeCsvField(job.followUpDate),
    escapeCsvField(calculateDaysSince(job.dateApplied)),
    escapeCsvField(job.result),
    escapeCsvField(job.notes),
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

export function calculateDaysSince(dateString: string): number {
  if (!dateString) return 0;
  const applied = new Date(dateString);
  if (isNaN(applied.getTime())) return 0;
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - applied.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Triggers browser download of a file
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
