'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import Image from 'next/image'
import { isKuwaitUniversityEmail } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Shield } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoIndex, setLogoIndex] = useState(0)
  
  const { signIn } = useSupabaseAuth()
  const { t, isRTL, language } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if email is from Kuwait University
    // COMMENTED OUT FOR TESTING - Allow all emails
    // if (!isKuwaitUniversityEmail(email)) {
    //   setError(t('auth.domainRestriction'))
    //   setLoading(false)
    //   return
    // }

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        setError(t('auth.invalidCredentials'))
      } else {
        // Check if user is admin and redirect accordingly
        if (data?.user?.user_metadata) {
          const userMetadata = data.user.user_metadata
          const isAdmin = userMetadata.is_admin === true || userMetadata.role === 'admin'
          
          if (isAdmin) {
            router.push('/admin')
          } else {
            router.push('/chat')
          }
        } else {
          router.push('/chat')
        }
      }
    } catch (err) {
      setError(t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }


  const signinSources = ['/signin.png', '/signin.jpeg', '/signin.jpg'] as const
  const signinSrc = signinSources[Math.min(logoIndex, signinSources.length - 1)]

  return (
    <div className={`min-h-screen bg-[#001f3f] flex items-center justify-center p-4 ${isRTL ? 'font-arabic' : ''}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl">
          <CardHeader className="text-center pt-4">
            <div className="flex justify-between items-center mb-4">
              <LanguageSwitcher />
            </div>
            <div className="flex justify-center my-6">
              <div className="relative w-80 h-28">
                <Image
                  src={signinSrc}
                  alt="LovEdu Sign In Logo"
                  fill
                  sizes="256px"
                  className="object-contain"
                  priority
                  unoptimized
                  onError={() =>
                    setLogoIndex((i) => (i < signinSources.length - 1 ? i + 1 : i))
                  }
                  key={signinSrc}
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white mt-2">
              {t('auth.welcome')}
            </CardTitle>
            <CardDescription>
              {t('auth.loginTitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t('common.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@ku.edu.kw"
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  {t('common.password')}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? t('common.loading') : t('common.login')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.noAccount')}{' '}
                <Link href="/signup" className="text-[#dc2626] hover:text-[#b91c1c] font-medium">
                  {t('common.signup')}
                </Link>
              </p>
            </div>

            {/* Admin Login Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                <Shield className="h-4 w-4" />
                <span>{t('admin.adminAccess')}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t('admin.adminAccessDesc')}
              </p>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

