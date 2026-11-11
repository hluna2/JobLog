import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  Briefcase,
  Globe,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { JobApplication, JobStatus, ContactType } from '../types';
import { encryptSecret, decryptSecret } from '../utils/crypto';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  initialJob: JobApplication | null;
  masterPasscode: string | null;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob,
  masterPasscode,
}) => {
  const [dateApplied, setDateApplied] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [employerWebsite, setEmployerWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [jobSource, setJobSource] = useState('Worksource GA');
  const [applicationMethod, setApplicationMethod] = useState('Online');
  const [contactPerson, setContactPerson] = useState('NA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<JobStatus>('Applied');
  const [typeOfContact, setTypeOfContact] = useState<ContactType>('New');
  const [followUpDate, setFollowUpDate] = useState('NA');
  const [result, setResult] = useState('NA');
  const [notes, setNotes] = useState('Initial application submitted');

  // Vault credentials fields
  const [portalUsername, setPortalUsername] = useState('');
  const [portalPassword, setPortalPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);

  useEffect(() => {
    if (initialJob) {
      setDateApplied(initialJob.dateApplied);
      setEmployerName(initialJob.employerName);
      setEmployerWebsite(initialJob.employerWebsite);
      setAddress(initialJob.address);
      setJobTitle(initialJob.jobTitle);
      setLocation(initialJob.location);
      setJobSource(initialJob.jobSource || 'Worksource GA');
      setApplicationMethod(initialJob.applicationMethod || 'Online');
      setContactPerson(initialJob.contactPerson || 'NA');
      setPhoneNumber(initialJob.phoneNumber || '');
      setStatus(initialJob.status || 'Applied');
      setTypeOfContact(initialJob.typeOfContact || 'New');
      setFollowUpDate(initialJob.followUpDate || 'NA');
      setResult(initialJob.result || 'NA');
      setNotes(initialJob.notes || '');

      if (initialJob.portalCredentials) {
        setPortalUsername(initialJob.portalCredentials.username || '');
        if (initialJob.portalCredentials.encryptedPassword && masterPasscode) {
          decryptSecret(initialJob.portalCredentials.encryptedPassword, masterPasscode)
            .then(plain => setPortalPassword(plain))
            .catch(() => setPortalPassword(''));
        }
      }
    } else {
      // Default to today's date
      const today = new Date().toISOString().split('T')[0];
      setDateApplied(today);
      setEmployerName('');
      setEmployerWebsite('');
      setAddress('');
      setJobTitle('');
      setLocation('Georgia');
      setJobSource('Worksource GA');
      setApplicationMethod('Online');
      setContactPerson('NA');
      setPhoneNumber('');
      setStatus('Applied');
      setTypeOfContact('New');
      setFollowUpDate('NA');
      setResult('NA');
      setNotes('Initial application submitted');
      setPortalUsername('');
      setPortalPassword('');
    }
  }, [initialJob, isOpen, masterPasscode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEncrypting(true);

    try {
      let credentials = undefined;

      if (portalUsername || portalPassword) {
        credentials = {
          username: portalUsername,
          portalUrl: employerWebsite,
        } as any;

        if (portalPassword) {
          if (masterPasscode) {
            const encrypted = await encryptSecret(portalPassword, masterPasscode);
            credentials.encryptedPassword = encrypted;
          } else {
            // No master passcode set; store alert or keep unencrypted in local device
            alert(
              'Notice: You entered a portal password without setting a Master Passcode. To encrypt your credentials with AES-256, please set a Master Passcode in the top bar.'
            );
          }
        }
      }

      const job: JobApplication = {
        id: initialJob ? initialJob.id : 'job-' + Math.random().toString(36).substring(2, 9),
        dateApplied,
        employerName,
        employerWebsite,
        address,
        jobTitle,
        location,
        jobSource,
        applicationMethod,
        contactPerson,
        phoneNumber,
        status,
        typeOfContact,
        followUpDate,
        result,
        notes,
        portalCredentials: credentials,
        reportedToClaimantPortal: initialJob ? initialJob.reportedToClaimantPortal : false,
        createdAt: initialJob ? initialJob.createdAt : Date.now(),
        updatedAt: Date.now(),
      };

      onSave(job);
      onClose();
    } catch (err: any) {
      alert('Error saving application: ' + err.message);
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">
              {initialJob ? 'Edit Job Application' : 'New Job Application'}
            </h3>
            <p className="text-xs text-slate-400">
              Form optimized for Georgia MyUI Claimant Portal weekly reporting
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          {/* Row 1: Date & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Date Applied / Contacted *
              </label>
              <input
                type="date"
                required
                value={dateApplied}
                onChange={e => setDateApplied(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Status *</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
              >
                <option value="Applied">Applied / Pending (Blue)</option>
                <option value="Viewed">Application Viewed by Employer (Purple)</option>
                <option value="Interview">Interview Requested / Scheduled (Yellow)</option>
                <option value="Offer">Got an Offer (Green)</option>
                <option value="Denied">Denied / Rejected (Red)</option>
                <option value="Saved">Saved / Follow-up</option>
              </select>
            </div>
          </div>

          {/* Row 2: Employer Name & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Employer / Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. City of Sandy Springs, TEK Systems"
                value={employerName}
                onChange={e => setEmployerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Job Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. IT Support Specialist, Data Analyst"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Row 3: Employer Website & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Website of Employer</label>
              <input
                type="text"
                placeholder="e.g. https://company.com/careers"
                value={employerWebsite}
                onChange={e => setEmployerWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Employer Phone Number</label>
              <input
                type="text"
                placeholder="e.g. (770) 730-5600"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Row 4: Address & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Employer Physical Address
              </label>
              <input
                type="text"
                placeholder="e.g. 1 Galambos Way, Sandy Springs, GA 30328"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Location / Work Mode</label>
              <input
                type="text"
                placeholder="e.g. Atlanta, GA / Remote / Hybrid"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Row 5: Job Source & Application Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Where Found / Job Source
              </label>
              <input
                type="text"
                list="source-suggestions"
                value={jobSource}
                onChange={e => setJobSource(e.target.value)}
                placeholder="e.g. Worksource GA, Indeed, LinkedIn"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
              <datalist id="source-suggestions">
                <option value="Indeed" />
                <option value="LinkedIn" />
                <option value="WorkSource GA" />
                <option value="Company Website" />
                <option value="Recruiter Contact" />
                <option value="ZipRecruiter" />
                <option value="Handshake / College" />
                <option value="Other / Networking" />
              </datalist>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Application Method</label>
              <select
                value={applicationMethod}
                onChange={e => setApplicationMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none cursor-pointer"
              >
                <option value="Online">Online Form / Portal</option>
                <option value="Email">Email Resume</option>
                <option value="In-Person">In-Person</option>
                <option value="Phone">Phone</option>
                <option value="Mail">Mail</option>
              </select>
            </div>
          </div>

          {/* Row 6: Contact Person & Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Contact Person / Recruiter (if known)
              </label>
              <input
                type="text"
                placeholder="e.g. Reshma Waman, or NA"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Result of Contact</label>
              <input
                type="text"
                placeholder="e.g. Job offer, Scheduled 2nd round, NA"
                value={result}
                onChange={e => setResult(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Weekly Notes / Details</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Initial application submitted via WorkSource GA portal"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none"
            />
          </div>

          {/* Optional Secure Vault Section */}
          <div className="border border-slate-200 bg-slate-50/70 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800">
                  Secure Portal Credentials (Optional)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Client-Side Encrypted
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Save your employer job portal username & password so you don't lose login access. If a Master Passcode is set, it will be encrypted with AES-256 before saving to local storage.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Portal Username / Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. username@example.com"
                  value={portalUsername}
                  onChange={e => setPortalUsername(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Portal Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={portalPassword}
                    onChange={e => setPortalPassword(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEncrypting}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {isEncrypting ? 'Encrypting & Saving...' : initialJob ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
