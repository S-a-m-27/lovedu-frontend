'use client'

import { useState, useEffect } from 'react'
import { paypalClient } from '@/lib/paypalClient'

export const useCheckSubscription = () => {
  const [active, setActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Mock implementation - always return true for now
        setActive(true)
        setLoading(false)
      } catch (error) {
        console.error('Error checking subscription:', error)
        setActive(false)
        setLoading(false)
      }
    }

    checkSubscription()
  }, [])

  return { active, loading }
}

