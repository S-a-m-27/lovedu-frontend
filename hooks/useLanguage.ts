'use client'

import { useState, useEffect, useCallback } from 'react'
import { translations, i18nConfig, type Language } from '@/lib/i18n'

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en')
  const [isRTL, setIsRTL] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize language from localStorage, navigator, or default
  useEffect(() => {
    const initializeLanguage = () => {
      // Always start with default language first
      const defaultLang = i18nConfig.defaultLocale as Language
      setLanguage(defaultLang)
      setIsRTL(defaultLang === 'ar')
      updateDocumentDirection(defaultLang)
      setIsLoading(false)

      // Then check localStorage for saved preference
      const savedLanguage = localStorage.getItem('language') as Language
      
      if (savedLanguage && i18nConfig.locales.includes(savedLanguage)) {
        setLanguage(savedLanguage)
        setIsRTL(savedLanguage === 'ar')
        updateDocumentDirection(savedLanguage)
        return
      }

      // Only check navigator if no saved preference and it's a supported language
      const navigatorLanguage = navigator.language.split('-')[0]
      
      if (i18nConfig.locales.includes(navigatorLanguage as Language)) {
        const detectedLanguage = navigatorLanguage as Language
        setLanguage(detectedLanguage)
        setIsRTL(detectedLanguage === 'ar')
        updateDocumentDirection(detectedLanguage)
        localStorage.setItem('language', detectedLanguage)
      } else {
        // Save default language to localStorage
        localStorage.setItem('language', defaultLang)
      }
    }

    initializeLanguage()
  }, [])

  const updateDocumentDirection = (lang: Language) => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = lang
  }

  const applyLanguage = useCallback((lang: Language) => {
    setLanguage(lang)
    setIsRTL(lang === 'ar')
    updateDocumentDirection(lang)
  }, [])

  const changeLanguage = useCallback((newLanguage: Language) => {
    localStorage.setItem('language', newLanguage)
    applyLanguage(newLanguage)
    // Notify other hook instances in the same tab
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('language-change', { detail: newLanguage }))
    }
  }, [applyLanguage])

  // Sync language across hook instances / tabs
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'language' && event.newValue) {
        const lang = event.newValue as Language
        if (i18nConfig.locales.includes(lang)) {
          applyLanguage(lang)
        }
      }
    }

    const handleCustom = (event: Event) => {
      const custom = event as CustomEvent<Language>
      const lang = custom.detail
      if (lang && i18nConfig.locales.includes(lang)) {
        applyLanguage(lang)
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('language-change', handleCustom)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('language-change', handleCustom)
    }
  }, [applyLanguage])

  const t = useCallback((key: string) => {
    const keys = key.split('.')
    let value: any = translations[language]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    
    return value || key
  }, [language])

  // Force re-render when language changes
  const forceUpdate = useCallback(() => {
    // This will trigger a re-render of all components using this hook
    setLanguage(prev => prev)
  }, [])

  // Get available locales
  const getLocales = useCallback(() => {
    return i18nConfig.locales.map(locale => ({
      code: locale,
      name: locale === 'en' ? 'English' : 'العربية',
      nativeName: locale === 'en' ? 'English' : 'العربية',
      dir: locale === 'ar' ? 'rtl' : 'ltr'
    }))
  }, [])

  // Check if current language is RTL
  const isCurrentLanguageRTL = useCallback(() => {
    return language === 'ar'
  }, [language])

  return {
    language,
    isRTL,
    isLoading,
    changeLanguage,
    t,
    forceUpdate,
    getLocales,
    isCurrentLanguageRTL,
    // next-i18next compatibility
    i18n: {
      language,
      changeLanguage,
      dir: isRTL ? 'rtl' : 'ltr'
    }
  }
}

