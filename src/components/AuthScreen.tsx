import React, { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, LoaderCircle, LogIn, UserPlus, X } from 'lucide-react';
import { supabase } from '../utils/supabase';

type AuthMode = 'signIn' | 'signUp' | 'forgot' | 'resetPassword';

interface AuthScreenProps {
  initialMode?: AuthMode;
  onPasswordUpdated?: () => void;
  /**
   * When provided the screen renders as a dismissible modal instead of a
   * full-page gate. Used for the guest "Cloud save" flow.
   */
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signIn',
  onPasswordUpdated,
  onClose,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isModal = Boolean(onClose);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Modal-only: Escape closes, and the page behind must stay scrollable.
  useEffect(() => {
    if (!isModal) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isModal, onClose]);

  const isSignUp = mode === 'signUp';
  const isSignIn = mode === 'signIn';
  const isForgot = mode === 'forgot';
  const isResetPassword = mode === 'resetPassword';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    if (isResetPassword && password !== confirmPassword) {
      setIsSubmitting(false);
      setError('Passwords do not match.');
      return;
    }

    const result = isForgot
      ? await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
      : isResetPassword
        ? await supabase.auth.updateUser({ password })
        : isSignUp
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (isForgot) {
      setMessage('Check your email for a password reset link.');
    } else if (isResetPassword) {
      setMessage('Your password has been updated.');
      setPassword('');
      setConfirmPassword('');
      onPasswordUpdated?.();
    } else if (isSignUp) {
      setMessage('Check your email to confirm your account, then sign in.');
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setMessage(null);
    setError(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
  };

  const title = isForgot ? 'Reset password' : isResetPassword ? 'Choose a new password' : 'Oxford 3000';
  const description = isForgot
    ? 'Enter your email and we will send you a secure reset link.'
    : isResetPassword
      ? 'Create a new password for your Oxford 3000 account.'
      : isSignUp
        ? 'Create an account to keep your learning progress safe.'
        : isSignIn
          ? 'Sign in to cloud save your progress and keep it across devices.'
          : 'Sign in to continue your vocabulary practice.';

  const card = (
    <section className="relative z-10 w-full border-2 border-[#1A232E]/70 bg-[#FAF7F0] p-7 shadow-2xl sm:p-10">
      <div className="mb-8 border-b border-[#C8BFB0] pb-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
          {isModal ? 'Cloud save' : 'Vocabulary Practice'}
        </p>
        <h1 className="mt-2 font-serif-title text-5xl italic leading-none">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#55697D]">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isResetPassword && (
          <label className="block text-xs font-bold uppercase tracking-wider text-[#55697D]">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="mt-2 w-full border-b border-[#C8BFB0] bg-transparent px-1 py-2 text-base font-normal normal-case tracking-normal text-[#1A232E] outline-none transition-colors focus:border-[#1A232E]"
            />
          </label>
        )}

        {!isForgot && (
          <>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#55697D]">
              {isResetPassword ? 'New password' : 'Password'}
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete={isSignUp || isResetPassword ? 'new-password' : 'current-password'}
                  className="w-full border-b border-[#C8BFB0] bg-transparent px-1 py-2 pr-10 text-base font-normal normal-case tracking-normal text-[#1A232E] outline-none transition-colors focus:border-[#1A232E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-[#6F7D8C] hover:text-[#1A232E]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            {isResetPassword && (
              <label className="block text-xs font-bold uppercase tracking-wider text-[#55697D]">
                Confirm password
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="mt-2 w-full border-b border-[#C8BFB0] bg-transparent px-1 py-2 text-base font-normal normal-case tracking-normal text-[#1A232E] outline-none transition-colors focus:border-[#1A232E]"
                />
              </label>
            )}
          </>
        )}

        {error && (
          <p role="alert" className="border-l-2 border-[#BA4A2C] bg-[#FFF0ED] px-3 py-2 text-sm text-[#8F321E]">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="border-l-2 border-[#2D6A4F] bg-[#E9EFE6] px-3 py-2 text-sm text-[#2D6A4F]">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 bg-[#1A232E] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#2A3B4E] disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : isForgot || isResetPassword ? (
            <KeyRound className="h-4 w-4" />
          ) : isSignUp ? (
            <UserPlus className="h-4 w-4" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {isForgot ? 'Send Reset Link' : isResetPassword ? 'Update Password' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {!isResetPassword && (
        <div className="mt-6 space-y-4 text-center text-xs font-bold uppercase tracking-wider text-[#55697D]">
          {mode === 'signIn' && (
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="block w-full underline decoration-[#C8BFB0] underline-offset-4 hover:text-[#1A232E]"
            >
              Forgot password?
            </button>
          )}
          <button
            type="button"
            onClick={() => switchMode(isForgot || isSignUp ? 'signIn' : 'signUp')}
            className="block w-full underline decoration-[#C8BFB0] underline-offset-4 hover:text-[#1A232E]"
          >
            {isForgot ? 'Back to sign in' : isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </button>
        </div>
      )}
    </section>
  );

  // Modal shell: guest clicks "Cloud save" and is asked to sign in without
  // losing the page they were studying on.
  if (isModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1A232E]/75 p-4 backdrop-blur-sm sm:items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Sign in to cloud save your progress"
      >
        <div className="relative w-full max-w-[440px]" onClick={(event) => event.stopPropagation()}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="absolute -top-2 right-0 z-20 -translate-y-full p-1.5 text-white/80 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          {card}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
          >
            Keep studying without an account
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#FAF7F0] px-4 py-10 text-[#1A232E] sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-[-5%] scale-105 bg-[#FAF7F0] blur-[7px]">
          <div className="mx-auto max-w-[1240px] px-8 pt-14 opacity-75">
            <div className="flex items-end justify-between border-b-2 border-[#1A232E] pb-8">
              <div className="font-serif-title text-7xl italic text-[#1A232E]">Oxford 3000</div>
              <div className="text-right font-serif-title text-3xl italic text-[#55697D]">
                English – Hindi
              </div>
            </div>
            <div className="mt-9 flex max-w-[850px] flex-wrap gap-2">
              {['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S'].map(
                (letter, index) => (
                  <div
                    key={letter}
                    className={`h-20 w-20 border border-[#E0D8CB] p-3 font-serif-title text-2xl ${
                      index === 1 ? 'bg-[#1A232E] text-[#FAF7F0]' : 'bg-[#EDE8DD] text-[#1A232E]'
                    }`}
                  >
                    {letter}
                    <span className="mt-2 block font-sans text-[9px] tracking-wider opacity-60">213</span>
                  </div>
                )
              )}
            </div>
            <div className="mt-12 space-y-5 border-t border-[#C8BFB0] pt-5">
              {['a, an', 'abandon', 'ability', 'able', 'about', 'above'].map((word, index) => (
                <div key={word} className="grid grid-cols-[160px_1fr_160px] gap-6 border-b border-[#E0D8CB] pb-4 font-serif-title text-2xl">
                  <span>{word}</span>
                  <span className="font-sans text-sm text-[#55697D]">used before a noun to refer to a single thing</span>
                  <span className="font-sans font-bold text-[#1A232E]">{index % 2 ? 'छोड़ देना' : 'ए, एक'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F0]/1 via-[#FAF7F0]/4 to-[#FAF7F0]/8 backdrop-blur-[2px]" />
      </div>
      <div className="mx-auto flex min-h-[80vh] max-w-[440px] items-center justify-center">
        {card}
      </div>
    </main>
  );
};
