'use client';

import React from 'react';
import { Mail, User, FileCode2, History, Layers, Sun, Moon, LogIn, LogOut } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface HeaderProps {
  totalSent: number;
  activeTab: 'composer' | 'history';
  setActiveTab: (tab: 'composer' | 'history') => void;
  onOpenProfile: () => void;
  onOpenTemplates: () => void;
  onOpenBatch: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Header({
  totalSent,
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenTemplates,
  onOpenBatch,
  theme,
  onToggleTheme,
}: HeaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 border-b border-zinc-200 dark:border-zinc-800/80 px-4 lg:px-8 py-3 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
            Q
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
              QuickSend <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </h1>
          </div>
        </div>

        {/* Navigation & Toolbar */}
        <div className="flex items-center gap-2.5">
          {/* Main Tab Switcher */}
          <div className="flex p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('composer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'composer'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Composer</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Tracker</span>
              {totalSent > 0 && (
                <span className="px-1.5 py-0.2 rounded-md bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono-code font-bold">
                  {totalSent}
                </span>
              )}
            </button>
          </div>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          {/* Quick action buttons */}
          <button
            onClick={onOpenBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all"
            title="Batch queue for multiple companies"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Batch Queue</span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all"
            title="Customize role templates"
          >
            <FileCode2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Templates</span>
          </button>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all"
            title="Sender profile settings"
          >
            <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Profile</span>
          </button>

          {/* NextAuth Authentication Badge / Button */}
          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-xs">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name || 'User'} className="w-4 h-4 rounded-full" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {(session.user.name || session.user.email || 'A')[0]}
                  </div>
                )}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate">
                  {session.user.name?.split(' ')[0] || session.user.email?.split('@')[0]}
                </span>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-500/10 hover:text-rose-500 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all"
              title="Sign In with NextAuth"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
