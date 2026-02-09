'use client'

import { useState } from 'react'
import { useLanguage } from '@/hooks/useLanguage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LogoHorizontal } from '@/components/Logo'
import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'

export default function SubscribePage() {
  const [loading, setLoading] = useState(false)
  const { t, isRTL } = useLanguage()

  const handlePayPalActivation = async (planId: string) => {
    setLoading(true)
    // Mock PayPal integration
    setTimeout(() => {
      setLoading(false)
      // In real implementation, redirect to PayPal or handle payment
      alert('PayPal integration would be implemented here')
    }, 2000)
  }

  const plans = [
    {
      id: 'basic',
      name: t('subscription.plans.basic.name'),
      price: t('subscription.plans.basic.price'),
      features: t('subscription.plans.basic.features'),
      popular: false,
    },
    {
      id: 'premium',
      name: t('subscription.plans.premium.name'),
      price: t('subscription.plans.premium.price'),
      features: t('subscription.plans.premium.features'),
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-[#001f3f]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <LogoHorizontal size="lg" />
          <div className="flex gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('subscription.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('subscription.description')}
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`relative ${plan.popular ? 'border-[#dc2626] shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#dc2626] text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-3xl font-bold text-[#dc2626]">
                      {plan.price}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {Array.isArray(plan.features) ? plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      )) : (
                        <li className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{plan.features}</span>
                        </li>
                      )}
                    </ul>
                    
                    <Button
                      onClick={() => handlePayPalActivation(plan.id)}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? t('common.loading') : t('subscription.activateWithPayPal')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <Card className="bg-[#003366] border-[#004080]">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Why Choose LovEdu?
                </h3>
                <p className="text-gray-300">
                  Access to cutting-edge AI assistants designed specifically for academic and professional use. 
                  Built for Kuwait University members with advanced research capabilities and secure data handling.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

