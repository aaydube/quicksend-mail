'use client';

import React, { useState, useEffect } from 'react';
import { EmailTemplate, RoleType } from '../lib/types';
import { FileCode2, RotateCcw, Save, X, Check, HelpCircle } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: EmailTemplate[];
  onSaveTemplates: (templates: EmailTemplate[]) => void;
  onResetTemplates: () => void;
  selectedRole: RoleType;
}

export default function TemplateModal({
  isOpen,
  onClose,
  templates,
  onSaveTemplates,
  onResetTemplates,
  selectedRole,
}: TemplateModalProps) {
  const [activeTab, setActiveTab] = useState<RoleType>(selectedRole === 'Custom' ? 'Software Developer' : selectedRole);
  const [editingTemplates, setEditingTemplates] = useState<EmailTemplate[]>(templates);
  const [isSaved, setIsSaved] = useState(false);

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
    setEditingTemplates(templates);
  }, [templates]);

  if (!isOpen) return null;

  const currentTemplate = editingTemplates.find((t) => t.role === activeTab) || editingTemplates[0];

  const handleSubjectChange = (val: string) => {
    setEditingTemplates((prev) =>
      prev.map((t) => (t.role === activeTab ? { ...t, subject: val } : t))
    );
  };

  const handleBodyChange = (val: string) => {
    setEditingTemplates((prev) =>
      prev.map((t) => (t.role === activeTab ? { ...t, body: val } : t))
    );
  };

  const handleSave = () => {
    onSaveTemplates(editingTemplates);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Template Customizer</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Customize content & subject lines for each role
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

        {/* Role tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {(['Software Developer', 'AI Engineer', 'Full Stack Developer'] as RoleType[]).map((r) => (
              <button
                key={r}
                onClick={() => setActiveTab(r)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === r
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={onResetTemplates}
            className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 font-medium"
            title="Reset to default templates"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>

        {/* Dynamic Tokens Legend */}
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-300 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Available Placeholders:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] font-mono-code text-zinc-700 dark:text-zinc-300 pt-1">
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{greeting}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{company}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{role}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{my_name}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{email}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{phone}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{github}`}</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">{`{linkedin}`}</span>
          </div>
        </div>

        {/* Template Editor */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Subject Line Template:
            </label>
            <input
              type="text"
              value={currentTemplate?.subject || ''}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl text-xs font-mono-code focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Body Template:
            </label>
            <textarea
              value={currentTemplate?.body || ''}
              onChange={(e) => handleBodyChange(e.target.value)}
              rows={12}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-xs font-mono-code leading-relaxed resize-none focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <p className="text-[11px] text-zinc-500">
            Changes auto-save in local storage.
          </p>

          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs"
            >
              {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Saved!' : 'Save Template'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
