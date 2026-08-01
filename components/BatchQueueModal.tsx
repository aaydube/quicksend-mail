'use client';

import React, { useState, useEffect } from 'react';
import { Layers, X, ArrowRight, Play, CheckCircle, Trash2, Zap, Loader2, AlertCircle } from 'lucide-react';
import { BatchCompany } from '../lib/types';

interface BatchQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBatchItem: (company: string, email: string) => void;
  onSelectAndSendBatchItem?: (company: string, email: string) => Promise<{ success: boolean; error?: string }>;
}

export default function BatchQueueModal({
  isOpen,
  onClose,
  onSelectBatchItem,
  onSelectAndSendBatchItem,
}: BatchQueueModalProps) {
  const [rawInput, setRawInput] = useState('');
  const [queue, setQueue] = useState<BatchCompany[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isBatchSending, setIsBatchSending] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleParse = () => {
    const lines = rawInput.split('\n').filter((l) => l.trim().length > 0);
    const parsedItems: BatchCompany[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,:\t]+/).map((p) => p.trim());
      let company = parts[0] || '';
      let email = parts[1] || '';

      if (company.includes('@') && !email) {
        email = company;
        company = email.split('@')[1].split('.')[0];
      }

      if (company || email) {
        parsedItems.push({
          id: `batch-${Date.now()}-${idx}`,
          companyName: company || 'Company',
          recipientEmail: email || '',
          status: 'pending',
        });
      }
    });

    setQueue(parsedItems);
    setCurrentIndex(0);
  };

  const handleLoadItem = (index: number) => {
    if (queue[index]) {
      onSelectBatchItem(queue[index].companyName, queue[index].recipientEmail);
      setCurrentIndex(index);
      setQueue((prev) =>
        prev.map((item, i) => (i === index ? { ...item, status: 'completed' } : item))
      );
    }
  };

  const handleLoadNext = () => {
    const nextIdx = currentIndex + 1 < queue.length ? currentIndex + 1 : 0;
    handleLoadItem(nextIdx);
  };

  const handleSelectAndSendItem = async (index: number) => {
    if (!queue[index] || !onSelectAndSendBatchItem) return;
    setCurrentIndex(index);
    setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, status: 'sending' } : item)));

    const res = await onSelectAndSendBatchItem(queue[index].companyName, queue[index].recipientEmail);

    if (res.success) {
      setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, status: 'sent' } : item)));
    } else {
      setQueue((prev) => prev.map((item, i) => (i === index ? { ...item, status: 'failed' } : item)));
    }
  };

  const handleSendCurrentAndNext = async () => {
    if (queue.length === 0) return;
    await handleSelectAndSendItem(currentIndex);
    const nextIdx = currentIndex + 1 < queue.length ? currentIndex + 1 : currentIndex;
    if (nextIdx !== currentIndex) {
      setCurrentIndex(nextIdx);
      onSelectBatchItem(queue[nextIdx].companyName, queue[nextIdx].recipientEmail);
    }
  };

  const handleSendAllPending = async () => {
    if (!onSelectAndSendBatchItem || queue.length === 0) return;
    setIsBatchSending(true);

    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'sent') {
        setCurrentIndex(i);
        setQueue((prev) => prev.map((item, idx) => (idx === i ? { ...item, status: 'sending' } : item)));
        const res = await onSelectAndSendBatchItem(queue[i].companyName, queue[i].recipientEmail);
        if (res.success) {
          setQueue((prev) => prev.map((item, idx) => (idx === i ? { ...item, status: 'sent' } : item)));
        } else {
          setQueue((prev) => prev.map((item, idx) => (idx === i ? { ...item, status: 'failed' } : item)));
          break;
        }
      }
    }
    setIsBatchSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Batch Queue Mode</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Paste a list of companies & emails to rapid-apply or dispatch simultaneously
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

        {/* Input box */}
        {queue.length === 0 ? (
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                Paste List of Companies & Emails (One per line):
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={8}
                placeholder={`Example format:
Google, hr@google.com
OpenAI, jobs@openai.com
Stripe, recruiting@stripe.com`}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 p-3.5 rounded-xl text-xs font-mono-code leading-relaxed resize-none focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-zinc-500 font-medium">
                Supported delimiters: comma (,), colon (:), tab, or newlines.
              </p>
            </div>

            <button
              onClick={handleParse}
              disabled={!rawInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Create Queue</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Active Queue Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                Progress: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{currentIndex + 1}</span> of{' '}
                <span className="text-zinc-900 dark:text-white font-bold">{queue.length}</span>
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Option to load next item */}
                <button
                  onClick={handleLoadNext}
                  disabled={isBatchSending}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                  title="Load next item into composer"
                >
                  <span>Load Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Option to Select & Send current item */}
                {onSelectAndSendBatchItem && (
                  <button
                    onClick={handleSendCurrentAndNext}
                    disabled={isBatchSending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Select & Send current application, then advance"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Select & Send Next</span>
                  </button>
                )}

                {/* Option to batch send all pending items */}
                {onSelectAndSendBatchItem && (
                  <button
                    onClick={handleSendAllPending}
                    disabled={isBatchSending}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    title="Send all pending applications in batch"
                  >
                    {isBatchSending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
                    )}
                    <span>{isBatchSending ? 'Sending Batch...' : 'Send All'}</span>
                  </button>
                )}

                <button
                  onClick={() => setQueue([])}
                  disabled={isBatchSending}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                  title="Clear Queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of queue items */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {queue.map((item, idx) => {
                const isActive = idx === currentIndex;
                const isCompleted = item.status === 'completed';
                const isSent = item.status === 'sent';
                const isSending = item.status === 'sending';
                const isFailed = item.status === 'failed';

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500 text-zinc-900 dark:text-white font-semibold shadow-xs'
                        : isSent
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-zinc-800 dark:text-zinc-200'
                        : isFailed
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-zinc-800 dark:text-zinc-200'
                        : isCompleted
                        ? 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {/* Item info / click to load */}
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-2"
                      onClick={() => handleLoadItem(idx)}
                    >
                      <span className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-mono-code font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.companyName}
                        </div>
                        <div className="text-[11px] font-mono-code text-zinc-500 truncate">
                          {item.recipientEmail}
                        </div>
                      </div>
                    </div>

                    {/* Dual Options & Status */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Status Badges */}
                      {isSent && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-100/70 dark:bg-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Sent
                        </span>
                      )}
                      {isFailed && (
                        <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 rounded bg-rose-100/70 dark:bg-rose-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                      {isSending && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-100/70 dark:bg-amber-500/20">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                        </span>
                      )}
                      {isActive && !isSent && !isFailed && !isSending && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/30 text-indigo-700 dark:text-indigo-200 font-bold uppercase tracking-wider">
                          Current
                        </span>
                      )}

                      {/* Option 1: Load to Composer */}
                      <button
                        onClick={() => handleLoadItem(idx)}
                        disabled={isSending || isBatchSending}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
                        title="Load into Composer only"
                      >
                        Load
                      </button>

                      {/* Option 2: Select & Send Simultaneously */}
                      {onSelectAndSendBatchItem && (
                        <button
                          onClick={() => handleSelectAndSendItem(idx)}
                          disabled={isSending || isBatchSending}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                            isSent
                              ? 'bg-emerald-600 hover:bg-emerald-500'
                              : 'bg-indigo-600 hover:bg-indigo-500'
                          }`}
                          title="Select application from queue and send email simultaneously"
                        >
                          {isSending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                          )}
                          <span>{isSent ? 'Resend' : 'Select & Send'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
