'use client';

import React, { useState } from 'react';
import { ApplicationLog } from '../lib/types';
import { 
  History, 
  Search, 
  Download, 
  Trash2, 
  Clock
} from 'lucide-react';

interface HistoryTrackerProps {
  logs: ApplicationLog[];
  onUpdateLogStatus: (id: string, newStatus: ApplicationLog['status']) => void;
  onDeleteLog: (id: string) => void;
  onClearAllLogs: () => void;
  onLoadLogIntoComposer: (log: ApplicationLog) => void;
}

export default function HistoryTracker({
  logs,
  onUpdateLogStatus,
  onDeleteLog,
  onClearAllLogs,
  onLoadLogIntoComposer,
}: HistoryTrackerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Date', 'Company', 'Recipient Email', 'Role', 'Status', 'Subject'];
    const rows = logs.map((l) => [
      new Date(l.timestamp).toLocaleString(),
      `"${l.companyName.replace(/"/g, '""')}"`,
      `"${l.recipientEmail.replace(/"/g, '""')}"`,
      `"${l.role.replace(/"/g, '""')}"`,
      l.status,
      `"${l.subject.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `job_applications_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 rounded-2xl p-5 lg:p-6 space-y-5 border border-zinc-200 dark:border-zinc-800/80 shadow-xs">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            Application Tracker
            <span className="text-xs px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 font-mono-code font-bold border border-zinc-200 dark:border-zinc-700">
              {logs.length} Logged
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Manage past application emails</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={onClearAllLogs}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-medium transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, role, or email..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 pl-9 pr-3.5 py-2 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 px-3.5 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 space-y-2 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <Clock className="w-6 h-6 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-300">No Applications Logged</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            {logs.length === 0
              ? 'When you launch job application emails, your history will be recorded here.'
              : 'No applications match your search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-zinc-50 dark:bg-zinc-900 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">{log.companyName}</span>
                  <span className="px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 text-[10px] font-medium border border-zinc-300 dark:border-zinc-700">
                    {log.role}
                  </span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono-code">
                    {new Date(log.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-zinc-600 dark:text-zinc-400 text-[11px] font-mono-code truncate">
                  {log.recipientEmail}
                </div>
              </div>

              {/* Status Selector & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={log.status}
                  onChange={(e) => onUpdateLogStatus(log.id, e.target.value as ApplicationLog['status'])}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 focus:outline-none"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  onClick={() => onLoadLogIntoComposer(log)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-xs font-medium"
                >
                  Reload
                </button>

                <button
                  onClick={() => onDeleteLog(log.id)}
                  className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
