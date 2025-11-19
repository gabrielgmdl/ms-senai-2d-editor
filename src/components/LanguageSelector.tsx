import type { ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '../i18n'

export const LanguageSelector = () => {
  const { i18n, t } = useTranslation()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <label className="language-selector">
      <span>{t('language.label')}</span>
      <select value={i18n.language} onChange={handleChange}>
        {supportedLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  )
}

