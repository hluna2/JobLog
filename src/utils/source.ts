export const GENERAL_SOURCES = [
  'Indeed',
  'LinkedIn',
  'WorkSource GA',
  'Company Website',
  'Recruiter Contact',
  'ZipRecruiter',
  'Handshake / College',
  'Other / Networking'
] as const;

export type GeneralSource = typeof GENERAL_SOURCES[number];

/**
 * Normalizes any specific employer website or raw source string
 * (e.g. "Publix Website", "Chick-fil-a careers", "GDOL", "TEKsystems", "WorkSource Georgia")
 * into standardized general sources.
 */
export function normalizeJobSource(source: string | undefined | null): GeneralSource {
  if (!source) return 'Other / Networking';
  const s = source.toLowerCase().trim();

  if (s.includes('indeed')) return 'Indeed';
  if (s.includes('linkedin')) return 'LinkedIn';
  if (
    s.includes('worksource') ||
    s.includes('work source') ||
    s.includes('employ georgia') ||
    s.includes('gdol') ||
    s.includes('georgia dept of labor') ||
    s.includes('state job board')
  ) {
    return 'WorkSource GA';
  }
  if (
    s.includes('recruiter') ||
    s.includes('headhunter') ||
    s.includes('staffing') ||
    s.includes('teksystems') ||
    s.includes('apex systems') ||
    s.includes('robert half') ||
    s.includes('insight global')
  ) {
    return 'Recruiter Contact';
  }
  if (s.includes('ziprecruiter') || s.includes('zip recruiter')) {
    return 'ZipRecruiter';
  }
  if (
    s.includes('handshake') ||
    s.includes('college') ||
    s.includes('university') ||
    s.includes('professor') ||
    s.includes('ggc') ||
    s.includes('career fair')
  ) {
    return 'Handshake / College';
  }
  if (
    s.includes('website') ||
    s.includes('site') ||
    s.includes('career') ||
    s.includes('portal') ||
    s.includes('publix') ||
    s.includes('chick-fil-a') ||
    s.includes('cfa') ||
    s.includes('kroger') ||
    s.includes('home depot') ||
    s.includes('company') ||
    s.includes('employer') ||
    s.includes('direct')
  ) {
    return 'Company Website';
  }

  return 'Other / Networking';
}
