'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, User, Lock, ArrowRight, CheckCircle2, KeyRound, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Mode: 'signin' or 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  // Method: Default to 'password' as requested by the user
  const [method, setMethod] = useState<'otp' | 'password'>('password');

  // Form inputs (Empty by default)
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpHint, setOtpHint] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Request 6-digit OTP code
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), action: 'send' }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSent(true);
        setOtpHint(data.otpPreview);
        setSuccessMsg(`OTP sent to ${email.trim()}! Code: ${data.otpPreview}`);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error sending OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & Sign In / Sign Up
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpCode.join('');
    if (enteredCode.length < 6) {
      setErrorMsg('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        otp: enteredCode,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg('Failed to verify credentials.');
      } else {
        setSuccessMsg('Verification successful! Redirecting...');
        setTimeout(() => router.push('/'), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Manual Password Sign In / Sign Up
  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        name: name.trim() || email.split('@')[0],
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg('Invalid email or password.');
      } else {
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => router.push('/'), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn('google', { callbackUrl: '/' });
    } catch (err) {
      console.error('Google sign in error:', err);
      setIsLoading(false);
    }
  };

  // OTP single-digit input change handler
  const handleOtpInput = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...otpCode];
    newCode[index] = val.slice(-1);
    setOtpCode(newCode);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Brand Header */}
      <div className="text-center space-y-3 mb-8 max-w-sm">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
            Q
          </div>
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            QuickSend <span className="text-indigo-500">•</span>
          </span>
        </Link>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
          Sign in to access 1-Click Direct Email Dispatch & Application History Tracker
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5 shadow-xl backdrop-blur-xl">
        {/* Sign In / Sign Up Mode Switcher */}
        <div className="flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'signin'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-all ${
              authMode === 'signup'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-bold shadow-xs'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold text-xs transition-all shadow-xs group cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Divider */}
        <div className="flex items-center my-3">
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
          <span className="px-3 text-[10px] text-zinc-400 font-mono-code uppercase font-bold">
            Or {method === 'password' ? 'Password' : 'Email OTP'} {authMode === 'signup' ? 'Sign Up' : 'Sign In'}
          </span>
          <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
        </div>

        {/* Error or Success Banners */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            {successMsg}
          </div>
        )}

        {/* Method Toggle: Password (Default) vs OTP */}
        <div className="flex justify-end text-[11px]">
          <button
            type="button"
            onClick={() => setMethod(method === 'password' ? 'otp' : 'password')}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3" />
            <span>Switch to {method === 'password' ? 'Email OTP' : 'Password'}</span>
          </button>
        </div>

        {/* Form Section */}
        {method === 'password' ? (
          /* MANUAL EMAIL & PASSWORD FLOW (DEFAULT) */
          <form onSubmit={handlePasswordAuth} className="space-y-4 text-xs">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono-code focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono-code focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{authMode === 'signup' ? 'Create Account' : 'Sign In with Password'}</span>
                </>
              )}
            </button>
          </form>
        ) : !otpSent ? (
          /* STEP 1: Enter Email & Full Name -> Request OTP */
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-zinc-800 dark:text-zinc-300 font-semibold">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 pl-9 pr-3.5 py-2.5 rounded-xl text-xs font-mono-code focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Send 6-Digit OTP Code</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: Enter 6-Digit OTP Code */
          <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
            <div className="space-y-2 text-center">
              <label className="block text-zinc-800 dark:text-zinc-300 font-bold">
                Enter 6-Digit Verification Code
              </label>
              <p className="text-[11px] text-zinc-500">
                Sent to <span className="font-mono-code font-bold text-zinc-900 dark:text-zinc-100">{email}</span>
              </p>

              {/* 6 Digit Input Boxes */}
              <div className="flex justify-center gap-2 pt-2">
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    className="w-10 h-12 text-center text-lg font-bold font-mono-code bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
              >
                ← Change Email
              </button>

              {otpHint && (
                <span className="font-mono-code text-indigo-500 font-semibold">
                  Code: {otpHint}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify OTP & {authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
