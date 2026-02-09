'use client'

import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { forceLanguage } from '@/lib/languageUtils'

export const LanguageSwitcher = () => {
  const { language, changeLanguage, isLoading } = useLanguage()

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en'
    
    // Use force language for more reliable switching
    forceLanguage(newLanguage)
  }

  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        className="flex items-center gap-2"
      >
        <Globe className="h-4 w-4" />
        <span>Loading...</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </Button>
  )
}

