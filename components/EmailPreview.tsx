'use client';

import React, { useState } from 'react';
import { 
  Send, 
  Copy, 
  ExternalLink, 
  Check, 
  Edit3, 
  Eye, 
  Globe, 
  BookmarkPlus,
  Paperclip,
  FileText,
  Download,
  Zap,
  Loader2
} from 'lucide-react';

interface EmailPreviewProps {
  recipientEmail: string;
  subject: string;
  body: string;
  companyName: string;
  roleDisplayName: string;
  resumeFileName?: string;
  resumeFileDataUrl?: string;
  smtpUser?: string;
  smtpPass?: string;
  senderEmail?: string;
  onCopySubject: () => void;
  onCopyBody: () => void;
  onCopyAll: () => void;
  onCopyRecipient: () => void;
  onLogApplication: () => void;
  onUpdateBody: (newBody: string) => void;
  onUpdateSubject: (newSubject: string) => void;
  isLogSaved: boolean;
  onOpenProfile: () => void;
  addToast: (toast: { title: string; description?: string; type?: 'success' | 'info' | 'warning' }) => void;
}

export default function EmailPreview({
  recipientEmail,
  subject,
  body,
  companyName,
  roleDisplayName,
  resumeFileName = 'Resume.pdf',
  resumeFileDataUrl,
  smtpUser,
  smtpPass,
  senderEmail = 'your.email@example.com',
  onCopySubject,
  onCopyBody,
  onCopyAll,
  onCopyRecipient,
  onLogApplication,
  onUpdateBody,
  onUpdateSubject,
  isLogSaved,
  onOpenProfile,
  addToast,
}: EmailPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // View Resume PDF in new tab
  const handleViewResume = () => {
    if (resumeFileDataUrl) {
      const win = window.open();
      if (win) {
        win.document.title = resumeFileName || 'Resume PDF';
        win.document.write(
          `<iframe src="${resumeFileDataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100vh;" allowfullscreen></iframe>`
        );
      }
    } else {
      addToast({
        title: 'No Resume Uploaded',
        description: 'Please click "Change" to upload your PDF resume in Profile settings.',
        type: 'info',
      });
      onOpenProfile();
    }
  };

  // Strip markdown formatting for email clients (mailto / clipboard)
  const getPlainBody = (rawBody: string) => {
    return rawBody.replace(/\*\*(.*?)\*\*/g, '$1');
  };

  const plainBody = getPlainBody(body || '');

  // Generate mailto link
  const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail || '')}?subject=${encodeURIComponent(
    subject || ''
  )}&body=${encodeURIComponent(plainBody || '')}`;

  // Generate Gmail Web Compose URL
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    recipientEmail || ''
  )}&su=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(plainBody || '')}`;

  // Generate Outlook Web Compose URL
  const outlookUrl = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(
    recipientEmail || ''
  )}&subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(plainBody || '')}`;

  const handleCopySubject = () => {
    onCopySubject();
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(plainBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  const handleCopyAll = () => {
    const fullText = `To: ${recipientEmail || ''}\nSubject: ${subject}\n\n${plainBody}`;
    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    if (companyName && !isLogSaved) {
      onLogApplication();
    }
  };

  // Nodemailer Direct Send via API Route
  const handleDirectSend = async () => {
    if (!recipientEmail.trim()) {
      addToast({ title: 'Recipient Email Required', description: 'Please enter a recipient email first.', type: 'warning' });
      return;
    }

    // Check if App Password is missing
    if (!smtpPass?.trim()) {
      addToast({ 
        title: 'Gmail App Password Missing!', 
        description: 'Opening Profile Settings... Please enter your 16-character Gmail App Password.', 
        type: 'warning' 
      });
      onOpenProfile();
      return;
    }

    setIsSendingDirect(true);

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          subject: subject,
          body: plainBody,
          senderEmail: senderEmail,
          smtpUser: smtpUser || senderEmail,
          smtpPass: smtpPass,
          resumeFileName: resumeFileName,
          resumeFileDataUrl: resumeFileDataUrl,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        addToast({ 
          title: '⚡ Email Sent Successfully!', 
          description: `Directly dispatched to ${recipientEmail.trim()}`, 
          type: 'success' 
        });
        if (!isLogSaved && companyName) {
          onLogApplication();
        }
      } else {
        addToast({ 
          title: 'Email Dispatch Error', 
          description: data.error || 'Failed to send via Nodemailer SMTP. Check your App Password.', 
          type: 'warning' 
        });
        onOpenProfile();
      }
    } catch (err: any) {
      addToast({ 
        title: 'Network Error', 
        description: err.message || 'Could not connect to send API.', 
        type: 'warning' 
      });
    } finally {
      setIsSendingDirect(false);
    }
  };

  // Render markdown bold syntax (**text**) as formatted strong HTML elements
  const renderFormattedBody = () => {
    if (!body) return <p className="text-zinc-400 italic">Body preview will appear here...</p>;

    const lines = body.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <React.Fragment key={idx}>
          <span>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-zinc-900 dark:text-zinc-100">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </span>
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl p-5 space-y-4 flex flex-col h-full border border-zinc-200 dark:border-zinc-800/80 shadow-xs relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Live Preview
            {companyName && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 font-mono-code font-bold border border-zinc-200 dark:border-zinc-700">
                {companyName}
              </span>
            )}
          </h2>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
            isEditing
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30'
              : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
          }`}
        >
          <Edit3 className="w-3 h-3" />
          <span>{isEditing ? 'Done' : 'Edit'}</span>
        </button>
      </div>

      {/* Recipient Bar */}
      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-zinc-500 dark:text-zinc-400 font-mono-code text-[11px] uppercase font-bold">To:</span>
          <span className={`font-mono-code truncate ${recipientEmail ? 'text-zinc-900 dark:text-zinc-100 font-semibold' : 'text-zinc-400 dark:text-zinc-500 italic'}`}>
            {recipientEmail || 'No recipient email specified yet'}
          </span>
        </div>
        {recipientEmail && (
          <button
            onClick={onCopyRecipient}
            className="text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-mono-code font-medium cursor-pointer"
          >
            Copy
          </button>
        )}
      </div>

      {/* Subject Line */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-mono-code text-[11px] uppercase font-bold">Subject:</span>
          <button
            onClick={handleCopySubject}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            {copiedSubject ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
          </button>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={subject}
            onChange={(e) => onUpdateSubject(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-xl px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            {subject || <span className="text-zinc-400 dark:text-zinc-500 font-normal italic">Subject line preview...</span>}
          </div>
        )}
      </div>

      {/* Mail Body Preview */}
      <div className="space-y-1 flex-1 flex flex-col min-h-[200px]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-mono-code text-[11px] uppercase font-bold">Body:</span>
          <button
            onClick={handleCopyBody}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            {copiedBody ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedBody ? 'Copied' : 'Copy Body'}</span>
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={body}
            onChange={(e) => onUpdateBody(e.target.value)}
            rows={10}
            className="w-full flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl text-xs font-mono-code leading-relaxed resize-none focus:outline-none focus:border-indigo-500"
          />
        ) : (
          <div className="flex-1 bg-zinc-50 dark:bg-zinc-900/90 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[260px] select-text font-sans">
            {renderFormattedBody()}
          </div>
        )}
      </div>

      {/* Attachment Preview */}
      <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <FileText className="w-4 h-4 text-rose-500" />
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-200 text-xs">{resumeFileName}</div>
            <div className="text-[10px] text-zinc-500 font-medium">Attachment ready</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleViewResume}
            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="View uploaded PDF resume"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="text-[10px] text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-semibold cursor-pointer transition-colors"
          >
            Change
          </button>
        </div>
      </div>

      {/* Modern Redesigned Action Toolbar */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
        {/* Sleek Primary Direct Send Button */}
        <button
          onClick={handleDirectSend}
          disabled={isSendingDirect}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer group"
        >
          {isSendingDirect ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Sending Email Direct...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
              <span>1-Click Direct Send</span>
            </>
          )}
        </button>

        {/* Clean Grid of Secondary Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          {/* Launch Mail App */}
          <a
            href={mailtoUrl}
            onClick={() => {
              if (recipientEmail && companyName) onLogApplication();
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] transition-all text-center"
          >
            <Send className="w-3 h-3 text-indigo-500" />
            <span>Mail App</span>
          </a>

          {/* Gmail Web */}
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (recipientEmail && companyName) onLogApplication();
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] transition-all text-center"
          >
            <Globe className="w-3 h-3 text-rose-500" />
            <span>Gmail Web</span>
          </a>

          {/* Outlook Web */}
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (recipientEmail && companyName) onLogApplication();
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] transition-all text-center"
          >
            <Globe className="w-3 h-3 text-sky-500" />
            <span>Outlook Web</span>
          </a>

          {/* Copy Entire Email */}
          <button
            onClick={handleCopyAll}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-[11px] transition-all cursor-pointer"
          >
            {copiedAll ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-zinc-400" />}
            <span>{copiedAll ? 'Copied!' : 'Copy All'}</span>
          </button>
        </div>

        {/* Log Application Footer Button */}
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={onLogApplication}
            disabled={isLogSaved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
              isLogSaved
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            {isLogSaved ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <BookmarkPlus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />}
            <span>{isLogSaved ? 'Application Logged' : 'Log Application'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
