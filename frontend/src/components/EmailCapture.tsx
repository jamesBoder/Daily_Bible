import React, { useState, useEffect } from 'react';
import apiClient from '../services/api/api';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [state, setState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-reset success banner after 6 seconds so the form is usable again
  // if the user navigates away and back or shares the page
  useEffect(() => {
    if (state !== 'success') return;
    const timer = setTimeout(() => {
      setState('idle');
      setEmail('');
    }, 6000);
    return () => clearTimeout(timer);
  }, [state]);

  const validate = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!validate(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    setState('loading');

    try {
      await apiClient.post('/api/subscribe', { email: trimmed });
      setState('success');
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'Something went wrong. Please try again.';
      setErrorMsg(msg);
      setState('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear validation error only — don't reset submission error until user focuses
    if (emailError) setEmailError('');
  };

  const handleFocus = () => {
    // Clear a previous submission error when user re-engages with the field
    if (state === 'error') {
      setState('idle');
      setErrorMsg('');
    }
  };

  const isDisabled = state === 'loading' || state === 'success';

  if (state === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-2 py-2"
      >
        <div className="text-3xl">✉️</div>
        <p className="text-base font-semibold text-amber-800 dark:text-amber-300">
          You're on the list!
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check your inbox for a welcome email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 min-w-0">
          <input
            type="email"
            value={email}
            onChange={handleChange}
            onFocus={handleFocus}
            placeholder="your@email.com"
            autoComplete="email"
            aria-label="Email address"
            aria-describedby={emailError ? 'email-capture-error' : undefined}
            aria-invalid={!!emailError}
            maxLength={320}
            disabled={isDisabled}
            className={`w-full px-4 py-3 rounded-xl border text-sm
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-amber-400
              disabled:opacity-60 disabled:cursor-not-allowed
              ${emailError
                ? 'border-red-400 dark:border-red-500'
                : 'border-amber-200 dark:border-amber-700'
              }`}
          />
        </div>
        <button
          type="submit"
          disabled={isDisabled}
          className="px-6 py-3 rounded-xl font-semibold text-sm text-white
            bg-amber-500 hover:bg-amber-600 active:bg-amber-700
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-colors duration-150 whitespace-nowrap
            min-h-[44px]"
        >
          {state === 'loading' ? 'Subscribing…' : 'Get daily verse'}
        </button>
      </div>

      {emailError && (
        <p
          id="email-capture-error"
          role="alert"
          className="text-xs text-red-600 dark:text-red-400"
        >
          {emailError}
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {errorMsg}
        </p>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
        One email a day. No spam. Unsubscribe any time.{" "}
        <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
          Privacy policy
        </a>
      </p>
    </form>
  );
};

export default EmailCapture;
