import React from 'react';
import { ShieldCheck, Lock, ExternalLink, Settings } from 'lucide-react';

interface PrivacyBannerProps {
  onAccept: () => void;
  onOpenSettings: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onAccept, onOpenSettings }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 border-b border-indigo-900 shadow-md no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/30 text-indigo-300 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Privacy & Security Guarantee</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.2 rounded-full font-mono">
                ZERO CLOUD TRACKING
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed max-w-3xl">
              Your job search records and portal credentials are saved <strong className="text-white">strictly on this device</strong>.
              No information is shared with third parties, employers, or cloud databases unless you explicitly consent to enable cross-device sync.
              Optional portal passwords can be secured with local <strong className="text-white">AES-256 client-side encryption</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
          <button
            onClick={onOpenSettings}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Customize</span>
          </button>
          <button
            onClick={onAccept}
            className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition shadow-sm"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
