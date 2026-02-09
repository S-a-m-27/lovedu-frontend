'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'

export default function HomePage() {
  const { user, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        router.push('/chat')
      } else {
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-[#001f3f] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  )
}
