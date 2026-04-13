import React from "react";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-700 dark:text-gray-300 space-y-3 text-sm leading-relaxed">
      {children}
    </div>
  </section>
);

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: April 2026</p>

        <p className="text-sm text-gray-700 dark:text-gray-300 mb-8">
          Words of Praise ("we", "us") is a daily Bible reading app. This policy explains what data
          we collect, why we collect it, and how you can control it. We keep it plain — no legalese.
        </p>

        <Section title="What we collect">
          <p><strong>Account data</strong> — when you sign up with email: your email address and a
          hashed password. When you sign up with Google: your name and email from Google. We never
          see your Google password.</p>
          <p><strong>Content you create</strong> — journal entries, verse favorites, community
          board posts, prayer requests, and verse annotations. This content is stored on our servers
          and is only visible to you (journals, favorites, annotations) or to all users
          (community posts, prayer wall).</p>
          <p><strong>Usage data</strong> — page views, feature interactions, and session data
          collected via PostHog analytics. This helps us understand how the app is used so we can
          improve it. We identify logged-in users by a numeric ID, never by name or email.</p>
          <p><strong>Error reports</strong> — if the app crashes or throws an error, Sentry
          automatically captures a stack trace, your browser/OS version, and the page you were on.
          No personally identifiable information is included in error reports.</p>
          <p><strong>Email address</strong> — if you subscribe to the daily verse newsletter from
          the landing page, we store your email to send you the daily verse. You can unsubscribe
          at any time via the link in every email.</p>
          <p><strong>Payment data</strong> — if you purchase a Premium lifetime license, payment
          is processed entirely by Stripe. We never see or store your card number. We store only
          your Stripe customer ID and subscription status.</p>
          <p><strong>Push notification subscription</strong> — if you opt in to push notifications,
          we store your browser's push subscription token to deliver daily verse reminders. We do
          not use this for marketing.</p>
        </Section>

        <Section title="How we use it">
          <ul className="list-disc list-inside space-y-1">
            <li>Deliver the daily verse, reading plans, and app features to you</li>
            <li>Send the daily verse email to newsletter subscribers</li>
            <li>Send streak-break reminder emails (if you opt in to reminders)</li>
            <li>Understand how features are used so we can improve them</li>
            <li>Diagnose crashes and fix bugs</li>
            <li>Process Premium purchases via Stripe</li>
          </ul>
          <p>We do not sell your data. We do not use your data for advertising.</p>
        </Section>

        <Section title="Third-party services">
          <p>Words of Praise uses the following third-party services. Each has its own privacy policy:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>PostHog</strong> — product analytics (posthog.com)</li>
            <li><strong>Sentry</strong> — error monitoring (sentry.io)</li>
            <li><strong>Stripe</strong> — payment processing (stripe.com)</li>
            <li><strong>Google OAuth</strong> — optional sign-in (google.com)</li>
            <li><strong>Resend</strong> — transactional and newsletter email (resend.com)</li>
            <li><strong>Fly.io</strong> — hosting and infrastructure (fly.io)</li>
          </ul>
        </Section>

        <Section title="Data retention">
          <p>Your account data is kept for as long as your account exists. If you delete your
          account, your personal data, journal entries, favorites, and annotations are permanently
          deleted within 30 days. Community posts and prayer wall entries may remain anonymised.</p>
          <p>Newsletter subscribers who unsubscribe have their email removed immediately.</p>
        </Section>

        <Section title="Your rights">
          <p>You can:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access or export your data — email us and we'll send it within 30 days</li>
            <li>Delete your account and all associated data from the Settings page</li>
            <li>Unsubscribe from emails at any time via the unsubscribe link</li>
            <li>Opt out of push notifications in your browser settings at any time</li>
          </ul>
          <p>If you are in the EU or California, you have additional rights under GDPR and CCPA
          respectively. Contact us to exercise them.</p>
        </Section>

        <Section title="Cookies & local storage">
          <p>We do not use advertising cookies. We use browser local storage to save your
          preferences (theme, language, font size, sound settings) locally on your device. This
          data never leaves your device.</p>
          <p>PostHog sets a first-party cookie to distinguish sessions. No cross-site tracking
          cookies are used.</p>
        </Section>

        <Section title="Children">
          <p>Words of Praise is not directed at children under 13. We do not knowingly collect
          data from children under 13. If you believe a child has provided us with personal data,
          contact us and we will delete it.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>If we make material changes, we will update the "Last updated" date above. Continued
          use of the app after changes take effect constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email us at{" "}
            <a
              href="mailto:wordsofpraiseapp@gmail.com"
              className="text-amber-600 dark:text-amber-400 hover:underline"
            >
              wordsofpraiseapp@gmail.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
};
