import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageSettings: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguage();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await changeLanguage(e.target.value);
  };

  return (
    <div style={{ padding: '0.75rem 0' }}>
      <label
        htmlFor="language-select"
        style={{ display: 'block', fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.5rem' }}
      >
        {t('settings.language.preferredLanguage')}
      </label>
      <select
        id="language-select"
        value={currentLanguage}
        onChange={handleChange}
        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {supportedLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {t(`settings.language.languages.${lang.code}`)}
          </option>
        ))}
      </select>
    </div>
  );
};
