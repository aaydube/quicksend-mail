'use client';

import React, { useState, useEffect } from 'react';
import { Mail, User, FileCode2, History, Layers, Sun, Moon, LogIn, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { UserProfile } from '../lib/types';

interface HeaderProps {
  totalSent: number;
  activeTab: 'composer' | 'history';
  setActiveTab: (tab: 'composer' | 'history') => void;
  onOpenProfile: () => void;
  onOpenTemplates: () => void;
  onOpenBatch: () => void;
  onOpenAuth: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  profile?: UserProfile;
}

export default function Header({
  totalSent,
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenTemplates,
  onOpenBatch,
  onOpenAuth,
  theme,
  onToggleTheme,
  profile,
}: HeaderProps) {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for header elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const displayName = profile?.fullName
    ? profile.fullName.split(' ')[0]
    : session?.user?.name
    ? session.user.name.split(' ')[0]
    : session?.user?.email
    ? session.user.email.split('@')[0]
    : 'Profile';

  const userInitial = displayName[0].toUpperCase();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 backdrop-blur-xl border-b ${
        scrolled
          ? 'bg-white/90 dark:bg-zinc-950/90 border-zinc-300/80 dark:border-zinc-800/90 shadow-md shadow-zinc-900/5'
          : 'bg-white/95 dark:bg-zinc-950/95 border-zinc-200 dark:border-zinc-800/80 shadow-none'
      } px-4 lg:px-8 py-3`}
    >
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all relative cursor-pointer ${
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer"
            title="Batch queue for multiple companies"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Batch Queue</span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-all cursor-pointer"
            title="Customize role templates"
          >
            <FileCode2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Templates</span>
          </button>

          {/* Clean Modern Professional User Profile Avatar Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all cursor-pointer group"
            title="Open Profile & Settings"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs ring-1 ring-indigo-500/30 group-hover:scale-105 transition-transform">
              {userInitial}
            </div>
            <span className="max-w-[100px] truncate">{displayName}</span>
          </button>

          {/* Authentication Action Button */}
          {status === 'authenticated' ? (
            <button
              onClick={() => signOut()}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-500/10 hover:text-rose-500 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              title="Sign In with NextAuth"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-center cursor-pointer"
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
