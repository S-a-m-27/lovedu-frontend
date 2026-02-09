// Language utility functions for debugging and testing

export const resetLanguageSettings = () => {
  // Clear localStorage
  localStorage.removeItem('language')
  
  // Reset document direction
  document.documentElement.dir = 'ltr'
  document.documentElement.lang = 'en'
  
  console.log('🔄 Language settings reset to default (English)')
}

export const getCurrentLanguageSettings = () => {
  const savedLanguage = localStorage.getItem('language')
  const documentDir = document.documentElement.dir
  const documentLang = document.documentElement.lang
  const navigatorLang = navigator.language
  
  console.log('📊 Current Language Settings:')
  console.log(`  - localStorage: ${savedLanguage}`)
  console.log(`  - document.dir: ${documentDir}`)
  console.log(`  - document.lang: ${documentLang}`)
  console.log(`  - navigator.language: ${navigatorLang}`)
  
  return {
    savedLanguage,
    documentDir,
    documentLang,
    navigatorLang
  }
}

export const forceLanguage = (language: 'en' | 'ar') => {
  localStorage.setItem('language', language)
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = language
  
  console.log(`🔧 Forced language to: ${language}`)
  
  // Reload the page to apply changes
  window.location.reload()
}

export const clearLanguageCache = () => {
  // Clear localStorage
  localStorage.removeItem('language')
  
  // Reset to English
  document.documentElement.dir = 'ltr'
  document.documentElement.lang = 'en'
  
  console.log('🧹 Language cache cleared, reset to English')
  
  // Reload the page
  window.location.reload()
}
