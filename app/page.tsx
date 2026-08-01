'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import EmailComposer from '../components/EmailComposer';
import EmailPreview from '../components/EmailPreview';
import ProfileModal from '../components/ProfileModal';
import TemplateModal from '../components/TemplateModal';
import HistoryTracker from '../components/HistoryTracker';
import BatchQueueModal from '../components/BatchQueueModal';
import ToastContainer, { ToastMessage } from '../components/Toast';

import { RoleType, SalutationType, EmailTemplate, UserProfile, ApplicationLog } from '../lib/types';
import { DEFAULT_TEMPLATES, INITIAL_USER_PROFILE } from '../lib/defaultTemplates';
import { Zap, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Theme state (Default to Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Tab state
  const [activeTab, setActiveTab] = useState<'composer' | 'history'>('composer');

  // Input states
  const [role, setRole] = useState<RoleType>('Software Developer');
  const [customRole, setCustomRole] = useState<string>('');
  
  // Salutation / Greeting state
  const [salutation, setSalutation] = useState<SalutationType>("Dear Ma'am/Sir");
  const [customSalutation, setCustomSalutation] = useState<string>('');

  const [companyName, setCompanyName] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [managerName, setManagerName] = useState<string>('');

  // Modals state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  // Core persistent data
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [applicationLogs, setApplicationLogs] = useState<ApplicationLog[]>([]);

  // Edited preview overrides
  const [customSubject, setCustomSubject] = useState<string | null>(null);
  const [customBody, setCustomBody] = useState<string | null>(null);

  // Feedback Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLogSavedCurrent, setIsLogSavedCurrent] = useState(false);

  // Redirect unauthenticated users immediately to /auth
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
    }
  }, [status, router]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('quicksend_theme') as 'dark' | 'light' | null;
      const initialTheme = savedTheme || 'light';
      setTheme(initialTheme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(initialTheme);

      const savedTemplates = localStorage.getItem('quicksend_templates');
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));

      const savedProfile = localStorage.getItem('quicksend_profile');
      if (savedProfile) setProfile(JSON.parse(savedProfile));

      const savedLogs = localStorage.getItem('quicksend_logs');
      if (savedLogs) setApplicationLogs(JSON.parse(savedLogs));
    } catch (err) {
      console.error('Error reading localStorage:', err);
    }
  }, []);

  // Synchronize session user into profile
  useEffect(() => {
    if (session?.user) {
      setProfile((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
    }
  }, [session]);

  // Handle Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('quicksend_theme', nextTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);
    addToast({
      title: `${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode Enabled`,
      type: 'info',
    });
  };

  // Save changes to localStorage
  const saveTemplates = (newTemplates: EmailTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('quicksend_templates', JSON.stringify(newTemplates));
    addToast({ title: 'Templates Saved', description: 'Updated template definitions saved.', type: 'success' });
  };

  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('quicksend_profile', JSON.stringify(newProfile));
    addToast({ title: 'Profile Updated', description: 'Your signature profile & SMTP credentials saved.', type: 'success' });
  };

  const saveLogs = (newLogs: ApplicationLog[]) => {
    setApplicationLogs(newLogs);
    localStorage.setItem('quicksend_logs', JSON.stringify(newLogs));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset custom overrides whenever role or company or salutation changes
  useEffect(() => {
    setCustomSubject(null);
    setCustomBody(null);
    setIsLogSavedCurrent(false);
  }, [role, customRole, salutation, customSalutation, companyName, managerName]);

  // Block rendering until session is verified and user is authenticated
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-xs font-medium text-zinc-500 font-mono-code">
          {status === 'unauthenticated' ? 'Redirecting to Sign In...' : 'Verifying session...'}
        </span>
      </div>
    );
  }

  // Determine active template
  const activeRoleName = role === 'Custom' ? (customRole || 'Custom Role') : role;

  // Determine active greeting
  const activeGreeting = managerName.trim()
    ? `Dear ${managerName.trim()}`
    : salutation === 'Custom'
    ? (customSalutation || "Dear Ma'am/Sir")
    : salutation;

  const currentTemplate =
    templates.find((t) => t.role === (role === 'Custom' ? 'Software Developer' : role)) || templates[0];

  // Helper to compile placeholders into final text
  const compileTemplate = (rawText: string): string => {
    if (!rawText) return '';
    return rawText
      .replace(/{greeting}/g, activeGreeting)
      .replace(/{company}/g, companyName.trim() || '[Company Name]')
      .replace(/{role}/g, activeRoleName)
      .replace(/{manager}/g, managerName.trim() || 'Hiring Manager')
      .replace(/{my_name}/g, profile.fullName || 'Your Name')
      .replace(/{email}/g, profile.email || 'your.email@example.com')
      .replace(/{portfolio}/g, profile.portfolioUrl || '')
      .replace(/{github}/g, profile.githubUrl || '')
      .replace(/{linkedin}/g, profile.linkedinUrl || '')
      .replace(/{phone}/g, profile.phone || '')
      .replace(/{recipient_email}/g, recipientEmail || '');
  };

  const compiledSubject = customSubject !== null ? customSubject : compileTemplate(currentTemplate.subject);
  const compiledBody = customBody !== null ? customBody : compileTemplate(currentTemplate.body);

  // Clear inputs
  const handleClearInputs = () => {
    setCompanyName('');
    setRecipientEmail('');
    setManagerName('');
    setSalutation("Dear Ma'am/Sir");
    setCustomSalutation('');
    setCustomSubject(null);
    setCustomBody(null);
    setIsLogSavedCurrent(false);
    addToast({ title: 'Inputs Reset', type: 'info' });
  };

  // Insert variable into body
  const insertPlaceholderIntoComposer = (token: string) => {
    setCustomBody((prev) => {
      const current = prev !== null ? prev : compiledBody;
      return current + ` ${token}`;
    });
    addToast({ title: `Token ${token} added to body`, type: 'info' });
  };

  // Log Application Action
  const handleLogApplication = () => {
    if (!companyName.trim()) {
      addToast({ title: 'Company Name Required', description: 'Please enter a company name before logging.', type: 'warning' });
      return;
    }

    const newLog: ApplicationLog = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      companyName: companyName.trim(),
      recipientEmail: recipientEmail.trim() || 'Not specified',
      role: activeRoleName,
      managerName: managerName.trim(),
      subject: compiledSubject,
      body: compiledBody,
      status: 'Applied',
    };

    const updatedLogs = [newLog, ...applicationLogs];
    saveLogs(updatedLogs);
    setIsLogSavedCurrent(true);
    addToast({ title: 'Application Logged!', description: `Saved ${companyName.trim()} application to tracker.`, type: 'success' });
  };

  // Copy helpers
  const handleCopySubject = () => {
    navigator.clipboard.writeText(compiledSubject);
    addToast({ title: 'Subject Copied!', description: compiledSubject, type: 'success' });
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(compiledBody.replace(/\*\*(.*?)\*\*/g, '$1'));
    addToast({ title: 'Email Body Copied!', description: 'Ready to paste into your mail app.', type: 'success' });
  };

  const handleCopyRecipient = () => {
    if (recipientEmail) {
      navigator.clipboard.writeText(recipientEmail);
      addToast({ title: 'Recipient Email Copied!', description: recipientEmail, type: 'success' });
    }
  };

  const handleCopyAll = () => {
    const fullText = `To: ${recipientEmail || ''}\nSubject: ${compiledSubject}\n\n${compiledBody.replace(/\*\*(.*?)\*\*/g, '$1')}`;
    navigator.clipboard.writeText(fullText);
    addToast({ title: 'Entire Email Copied!', description: 'Copied To, Subject, and Body.', type: 'success' });
    if (companyName && !isLogSavedCurrent) {
      handleLogApplication();
    }
  };

  // Load past log item back into composer
  const handleLoadLogIntoComposer = (log: ApplicationLog) => {
    setCompanyName(log.companyName);
    setRecipientEmail(log.recipientEmail);
    if (log.role === 'AI Engineer' || log.role === 'Software Developer' || log.role === 'Full Stack Developer') {
      setRole(log.role);
    } else {
      setRole('Custom');
      setCustomRole(log.role);
    }
    setActiveTab('composer');
    addToast({ title: `Loaded ${log.companyName}`, description: 'Composer updated with past log.', type: 'info' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-500 selection:text-white pb-12 bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Navbar Header */}
      <Header
        totalSent={applicationLogs.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onOpenAuth={() => router.push('/auth')}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'composer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Input Form (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <EmailComposer
                role={role}
                setRole={setRole}
                customRole={customRole}
                setCustomRole={setCustomRole}
                salutation={salutation}
                setSalutation={setSalutation}
                customSalutation={customSalutation}
                setCustomSalutation={setCustomSalutation}
                companyName={companyName}
                setCompanyName={setCompanyName}
                recipientEmail={recipientEmail}
                setRecipientEmail={setRecipientEmail}
                managerName={managerName}
                setManagerName={setManagerName}
                onClear={handleClearInputs}
                insertPlaceholder={insertPlaceholderIntoComposer}
                activeRoleDisplayName={activeRoleName}
              />

              {/* Quick tip badge */}
              <div className="bg-white dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <div className="font-semibold text-zinc-900 dark:text-white">Direct Send Available</div>
                  <div className="text-zinc-500 dark:text-zinc-400">
                    Enter your Gmail App Password in <code className="text-indigo-600 dark:text-indigo-300 font-mono">Profile</code> to enable 1-click background email dispatch!
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Mail Preview & Quick Launchers (7 cols) */}
            <div className="lg:col-span-7">
              <EmailPreview
                recipientEmail={recipientEmail}
                subject={compiledSubject}
                body={compiledBody}
                companyName={companyName}
                roleDisplayName={activeRoleName}
                resumeFileName={profile.resumeFileName || 'Resume.pdf'}
                resumeFileDataUrl={profile.resumeFileDataUrl}
                smtpUser={profile.smtpUser || profile.email}
                smtpPass={profile.smtpPass}
                senderEmail={profile.email || 'your.email@example.com'}
                onCopySubject={handleCopySubject}
                onCopyBody={handleCopyBody}
                onCopyAll={handleCopyAll}
                onCopyRecipient={handleCopyRecipient}
                onLogApplication={handleLogApplication}
                onUpdateBody={(nb) => setCustomBody(nb)}
                onUpdateSubject={(ns) => setCustomSubject(ns)}
                isLogSaved={isLogSavedCurrent}
                onOpenProfile={() => setIsProfileOpen(true)}
                addToast={addToast}
              />
            </div>
          </div>
        ) : (
          /* Application History Tracker View */
          <HistoryTracker
            logs={applicationLogs}
            onUpdateLogStatus={(id, newStatus) => {
              const updated = applicationLogs.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
              saveLogs(updated);
              addToast({ title: 'Status Updated', type: 'info' });
            }}
            onDeleteLog={(id) => {
              const updated = applicationLogs.filter((l) => l.id !== id);
              saveLogs(updated);
              addToast({ title: 'Log Removed', type: 'warning' });
            }}
            onClearAllLogs={() => {
              saveLogs([]);
              addToast({ title: 'All History Cleared', type: 'warning' });
            }}
            onLoadLogIntoComposer={handleLoadLogIntoComposer}
          />
        )}
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={saveProfile}
      />

      {/* Template Modal */}
      <TemplateModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        templates={templates}
        onSaveTemplates={saveTemplates}
        onResetTemplates={() => {
          setTemplates(DEFAULT_TEMPLATES);
          localStorage.removeItem('quicksend_templates');
          addToast({ title: 'Templates Reset', description: 'Restored default role templates.', type: 'info' });
        }}
        selectedRole={role}
      />

      {/* Batch Queue Modal */}
      <BatchQueueModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onSelectBatchItem={(company, email) => {
          setCompanyName(company);
          setRecipientEmail(email);
          addToast({ title: `Loaded ${company}`, description: email, type: 'success' });
        }}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
