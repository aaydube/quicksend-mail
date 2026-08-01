'use client';

import React from 'react';
import { RoleType, SalutationType } from '../lib/types';
import { Briefcase, Building2, Mail, UserCheck, RefreshCw, Hash, MessageSquareQuote } from 'lucide-react';

interface EmailComposerProps {
  role: RoleType;
  setRole: (role: RoleType) => void;
  customRole: string;
  setCustomRole: (custom: string) => void;
  salutation: SalutationType;
  setSalutation: (salutation: SalutationType) => void;
  customSalutation: string;
  setCustomSalutation: (custom: string) => void;
  companyName: string;
  setCompanyName: (company: string) => void;
  recipientEmail: string;
  setRecipientEmail: (email: string) => void;
  managerName: string;
  setManagerName: (name: string) => void;
  onClear: () => void;
  insertPlaceholder: (token: string) => void;
  activeRoleDisplayName: string;
}

export default function EmailComposer({
  role,
  setRole,
  customRole,
  setCustomRole,
  salutation,
  setSalutation,
  customSalutation,
  setCustomSalutation,
  companyName,
  setCompanyName,
  recipientEmail,
  setRecipientEmail,
  managerName,
  setManagerName,
  onClear,
  insertPlaceholder,
  activeRoleDisplayName,
}: EmailComposerProps) {
  const handleCompanyChange = (val: string) => {
    setCompanyName(val);
  };

  const salutationOptions: SalutationType[] = [
    "Hi Ma'am/Sir",
    "Dear Ma'am/Sir",
    "Dear Hiring Manager",
    "Hi Hiring Manager",
    "Dear Hiring Team",
    "Hi Hiring Team",
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl p-5 space-y-5 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3.5">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Application Setup</h2>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Target role, greeting, and recipient email</p>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium"
          title="Reset composer inputs"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 flex items-center justify-between">
          <span>Target Role</span>
          <span className="text-[10px] text-zinc-500 font-normal">Select position</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(['Software Developer', 'AI Engineer', 'Full Stack Developer', 'Custom'] as RoleType[]).map((r) => {
            const isSelected = role === r;
            const label = r === 'Custom' ? (customRole.trim() ? `Custom (${customRole.trim()})` : 'Custom Role') : r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`p-2.5 rounded-xl text-xs font-medium border transition-all text-center truncate ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white'
                }`}
                title={r === 'Custom' && customRole.trim() ? customRole : r}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Custom Role Input */}
        {role === 'Custom' && (
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="Enter custom role title (e.g. DevOps Engineer)..."
              className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Salutation / Greeting Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 block">
          Salutation / Greeting
        </label>

        <div className="flex flex-wrap gap-1.5">
          {salutationOptions.map((opt) => {
            const isSelected = salutation === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSalutation(opt)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 dark:bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {opt}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setSalutation('Custom')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              salutation === 'Custom'
                ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            + Custom
          </button>
        </div>

        {salutation === 'Custom' && (
          <input
            type="text"
            value={customSalutation}
            onChange={(e) => setCustomSalutation(e.target.value)}
            placeholder="e.g. Dear Manav, Dear Sarah, Hi Alex..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            autoFocus
          />
        )}
      </div>

      {/* Inputs: Company & Recipient Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Company Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Company Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={companyName}
              onChange={(e) => handleCompanyChange(e.target.value)}
              placeholder="e.g. Circleback, Google, OpenAI..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3 py-2.5 rounded-xl text-xs font-medium pr-8 focus:outline-none focus:border-indigo-500"
            />
            {companyName && (
              <button
                onClick={() => setCompanyName('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Recipient Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Recipient Email (To) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. hr@company.com"
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3 py-2.5 rounded-xl text-xs font-mono-code pr-8 focus:outline-none focus:border-indigo-500"
            />
            {recipientEmail && (
              <button
                onClick={() => setRecipientEmail('')}
                className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Domain Helper Badges */}
          {companyName.trim() && !recipientEmail.includes('@') && (
            <div className="flex flex-wrap gap-1 pt-0.5">
              {['careers@', 'hr@', 'recruiting@'].map((prefix) => {
                const domain = companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
                const suggested = `${prefix}${domain}`;
                return (
                  <button
                    key={prefix}
                    type="button"
                    onClick={() => setRecipientEmail(suggested)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono-code"
                  >
                    {suggested}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recruiter / Hiring Manager Optional Field */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300 flex items-center justify-between">
          <span>Recruiter / Contact Name</span>
          <span className="text-[10px] text-zinc-500 font-normal">Optional</span>
        </label>
        <input
          type="text"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
          placeholder="e.g. Manav, Sarah (Overrides greeting)"
          className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Quick Insert Variables Toolbar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-semibold text-zinc-800 dark:text-zinc-300">Quick Tokens</span>
          <span className="text-[10px]">Click token to insert into body</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { token: '{company}', label: 'Company' },
            { token: '{role}', label: 'Role' },
            { token: '{my_name}', label: 'Your Name' },
            { token: '{phone}', label: 'Phone' },
            { token: '{email}', label: 'Your Email' },
            { token: '{github}', label: 'GitHub' },
            { token: '{linkedin}', label: 'LinkedIn' },
          ].map((chip) => (
            <button
              key={chip.token}
              type="button"
              onClick={() => insertPlaceholder(chip.token)}
              className="px-2 py-0.5 rounded-lg text-[11px] font-mono-code bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all"
            >
              + {chip.token}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
