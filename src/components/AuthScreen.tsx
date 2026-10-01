import React, { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, KeyRound, LoaderCircle, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../utils/supabase';

type AuthMode = 'signIn' | 'signUp' | 'forgot' | 'resetPassword';

interface AuthScreenProps {
  initialMode?: AuthMode;
  onPasswordUpdated?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  initialMode = 'signIn',
  onPasswordUpdated,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isSignUp = mode === 'signUp';
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
        : 'Sign in to continue your vocabulary practice.';

  return (
    <main className="min-h-screen bg-[#FAF7F0] px-4 py-10 text-[#1A232E] sm:px-8">
      <div className="mx-auto flex min-h-[80vh] max-w-[440px] items-center justify-center">
        <section className="w-full border-2 border-[#1A232E] bg-[#FAF7F0] p-7 shadow-sm sm:p-10">
          <div className="mb-8 border-b border-[#C8BFB0] pb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#55697D]">
              Vocabulary Practice
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
      </div>
    </main>
  );
};
