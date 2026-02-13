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
import { Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/lib/errorMessages'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoIndex, setLogoIndex] = useState(0)
  
  const { signUp } = useSupabaseAuth()
  const { t, isRTL } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validation
    if (!fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Full name is required",
      })
      setLoading(false)
      return
    }

    if (!dateOfBirth) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Date of birth is required",
      })
      setLoading(false)
      return
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Passwords do not match",
      })
      setLoading(false)
      return
    }

    // Check password length
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 6 characters",
      })
      setLoading(false)
      return
    }

    // Check if email is from Kuwait University
    if (!isKuwaitUniversityEmail(email)) {
      toast({
        variant: "destructive",
        title: "Access Restricted",
        description: t('auth.domainRestriction'),
      })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password, {
        full_name: fullName,
        date_of_birth: dateOfBirth
      })
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: getErrorMessage(error),
        })
      } else {
        toast({
          variant: "success",
          title: "Account Created",
          description: t('auth.accountCreated'),
        })
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: getErrorMessage(err),
      })
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
                  alt="LovEdu Sign Up Logo"
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
              {t('auth.signupTitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  {t('common.email')}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@grad.ku.edu.kw"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-2">
                  Date of Birth
                </label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  {t('common.password')}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  {t('common.confirmPassword')}
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? t('common.loading') : t('common.signup')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('auth.hasAccount')}{' '}
                <Link href="/login" className="text-[#dc2626] hover:text-[#b91c1c] font-medium">
                  {t('common.login')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

