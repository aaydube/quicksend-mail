'use client';

import React, { useRef, useEffect } from 'react';
import { UserProfile } from '../lib/types';
import { User, Mail, Phone, Globe, FileText, Check, X, Sparkles, Upload, Paperclip, Trash2, Key, HelpCircle, Lock, AlertTriangle, Eye } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  highlightSmtp?: boolean;
}

export default function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  highlightSmtp = false,
}: ProfileModalProps) {
  const [formData, setFormData] = React.useState<UserProfile>(profile);
  const [showSmtpHelp, setShowSmtpHelp] = React.useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const smtpInputRef = useRef<HTMLInputElement>(null);

  // Lock body & document scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      document.documentElement.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  React.useEffect(() => {
    setFormData(profile);
    if (!profile.smtpPass || highlightSmtp) {
      setShowSmtpHelp(true);
    }
  }, [profile, highlightSmtp, isOpen]);

  // Focus SMTP password field if highlighted
  React.useEffect(() => {
    if (isOpen && (highlightSmtp || !profile.smtpPass)) {
      setTimeout(() => {
        smtpInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, highlightSmtp, profile.smtpPass]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          resumeFileName: file.name,
          resumeFileDataUrl: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveResume = () => {
    setFormData({
      ...formData,
      resumeFileName: undefined,
      resumeFileDataUrl: undefined,
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleViewResume = () => {
    if (formData.resumeFileDataUrl) {
      const win = window.open();
      if (win) {
        win.document.title = formData.resumeFileName || 'Resume PDF';
        win.document.write(
          `<iframe src="${formData.resumeFileDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100vh;" allowfullscreen></iframe>`
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const isMissingAppPass = !formData.smtpPass?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Sender Profile & Credentials</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personalize your email signature and Gmail App Password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Missing App Password Banner */}
        {isMissingAppPass && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold">Gmail App Password Required for 1-Click Send</div>
              <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
                To send job applications directly via 1-Click Nodemailer, enter your 16-character Gmail App Password below.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Direct Email Sending SMTP / Gmail App Password Box */}
          <div className="space-y-2.5 p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80">
            <div className="flex items-center justify-between">
              <label className="block text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                Direct Send SMTP Setup (Gmail App Password)
              </label>
              <button
                type="button"
                onClick={() => setShowSmtpHelp(!showSmtpHelp)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <HelpCircle className="w-3 h-3" />
                <span>{showSmtpHelp ? 'Hide Guide' : 'Show 30-sec Guide'}</span>
              </button>
            </div>

            {showSmtpHelp && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-200 dark:border-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed shadow-xs">
                <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500" /> How to get your 16-character Gmail App Password:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-zinc-700 dark:text-zinc-300">
                  <li>Open Google Security: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">myaccount.google.com/apppasswords</a></li>
                  <li>Ensure 2-Step Verification is ON.</li>
                  <li>Create a new App Password named <code className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono-code font-bold">QuickSend</code>.</li>
                  <li>Copy the 16-letter code (e.g. <span className="font-mono-code font-bold text-zinc-900 dark:text-white">abcd efgh ijkl mnop</span>) and paste it below!</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                  Sender Email (Gmail)
                </label>
                <input
                  type="email"
                  value={formData.smtpUser || formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl font-mono-code focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-800 dark:text-zinc-300 font-semibold flex items-center justify-between">
                  <span>Gmail App Password</span>
                  <span className="text-rose-500 font-bold">* Required</span>
                </label>
                <input
                  ref={smtpInputRef}
                  type="password"
                  value={formData.smtpPass || ''}
                  onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="w-full bg-white dark:bg-zinc-900 border border-indigo-400 dark:border-indigo-500 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl font-mono-code focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Your Name"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl font-medium focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-500" /> Your Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl font-mono-code focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-500" /> Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 019-2831"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl font-mono-code focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Experience */}
            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Experience Level
              </label>
              <input
                type="text"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                placeholder="e.g. Software Engineer"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Resume PDF File Upload Box */}
          <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-zinc-800 dark:text-zinc-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-indigo-500" />
              Resume Attachment (PDF)
            </label>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2.5">
              {formData.resumeFileName ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">{formData.resumeFileName}</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready to attach
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {formData.resumeFileDataUrl && (
                      <button
                        type="button"
                        onClick={handleViewResume}
                        className="px-2 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center gap-1"
                        title="View Resume PDF"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      title="Remove resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 rounded-xl p-5 text-center cursor-pointer transition-colors space-y-1.5 bg-white dark:bg-zinc-950"
                >
                  <Upload className="w-5 h-5 text-indigo-500 mx-auto" />
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                    Click to upload your Resume PDF
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    Supports .pdf files (e.g. Resume.pdf)
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Save Credentials & Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
