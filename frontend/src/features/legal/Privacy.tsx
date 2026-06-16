import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">{title}</h2>
    <div className="text-[var(--foreground)] space-y-3 text-sm leading-relaxed">
      {children}
    </div>
  </section>
);

export const Privacy: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Bold-led paragraphs under "What we collect" — label + body per language
  const collectItems: { labelKey: string; bodyKey: string }[] = [
    { labelKey: "privacy.collect.accountLabel", bodyKey: "privacy.collect.account" },
    { labelKey: "privacy.collect.contentLabel", bodyKey: "privacy.collect.content" },
    { labelKey: "privacy.collect.activityLabel", bodyKey: "privacy.collect.activity" },
    { labelKey: "privacy.collect.usageLabel", bodyKey: "privacy.collect.usage" },
    { labelKey: "privacy.collect.errorsLabel", bodyKey: "privacy.collect.errors" },
    { labelKey: "privacy.collect.emailLabel", bodyKey: "privacy.collect.email" },
    { labelKey: "privacy.collect.paymentLabel", bodyKey: "privacy.collect.payment" },
    { labelKey: "privacy.collect.pushLabel", bodyKey: "privacy.collect.push" },
    { labelKey: "privacy.collect.securityLabel", bodyKey: "privacy.collect.security" },
  ];

  // Brand names/domains stay verbatim; only the descriptor is translated
  const thirdParty: { name: string; domain: string; descKey: string }[] = [
    { name: "PostHog", domain: "posthog.com", descKey: "privacy.thirdParty.posthog" },
    { name: "Sentry", domain: "sentry.io", descKey: "privacy.thirdParty.sentry" },
    { name: "Stripe", domain: "stripe.com", descKey: "privacy.thirdParty.stripe" },
    { name: "Google OAuth", domain: "google.com", descKey: "privacy.thirdParty.google" },
    { name: "Resend", domain: "resend.com", descKey: "privacy.thirdParty.resend" },
    { name: "Fly.io", domain: "fly.io", descKey: "privacy.thirdParty.fly" },
  ];

  const useItems = t("privacy.use.items", { returnObjects: true }) as string[];
  const rightsItems = t("privacy.rights.items", { returnObjects: true }) as string[];

  return (
    <div className="min-h-screen bg-[var(--theme-surface)] py-10 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="group -ml-2 mb-6 inline-flex items-center px-2 py-2 min-h-[44px] text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-all font-medium"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t("privacy.back")}
        </button>

        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">{t("privacy.title")}</h1>
        <p className="text-sm text-[var(--journal-text-muted)] mb-8">{t("privacy.lastUpdated")}</p>

        <p className="text-sm text-[var(--foreground)] mb-8">{t("privacy.intro")}</p>

        <Section title={t("privacy.collect.heading")}>
          {collectItems.map(({ labelKey, bodyKey }) => (
            <p key={labelKey}>
              <strong>{t(labelKey)}</strong> — {t(bodyKey)}
            </p>
          ))}
        </Section>

        <Section title={t("privacy.use.heading")}>
          <ul className="list-disc list-inside space-y-1">
            {useItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>{t("privacy.use.footer")}</p>
        </Section>

        <Section title={t("privacy.thirdParty.heading")}>
          <p>{t("privacy.thirdParty.intro")}</p>
          <ul className="list-disc list-inside space-y-1">
            {thirdParty.map(({ name, domain, descKey }) => (
              <li key={name}>
                <strong>{name}</strong> — {t(descKey)} ({domain})
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t("privacy.retention.heading")}>
          <p>{t("privacy.retention.p1")}</p>
          <p>{t("privacy.retention.p2")}</p>
        </Section>

        <Section title={t("privacy.rights.heading")}>
          <p>{t("privacy.rights.intro")}</p>
          <ul className="list-disc list-inside space-y-1">
            {rightsItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <p>{t("privacy.rights.footer")}</p>
        </Section>

        <Section title={t("privacy.cookies.heading")}>
          <p>{t("privacy.cookies.p1")}</p>
          <p>{t("privacy.cookies.p2")}</p>
        </Section>

        <Section title={t("privacy.children.heading")}>
          <p>{t("privacy.children.body")}</p>
        </Section>

        <Section title={t("privacy.changes.heading")}>
          <p>{t("privacy.changes.body")}</p>
        </Section>

        <Section title={t("privacy.contact.heading")}>
          <p>
            {t("privacy.contact.text")}{" "}
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
