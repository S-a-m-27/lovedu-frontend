'use client'

import { useState } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Lock, Loader2, ArrowLeft, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/lib/errorMessages'

export default function SettingsPage() {
  const { backendUser } = useSupabaseAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleUpdatePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "All fields are required",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New password must be at least 6 characters long",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New password and confirm password do not match",
      })
      return
    }

    if (currentPassword === newPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New password must be different from current password",
      })
      return
    }

    setSaving(true)
    try {
      const response = await apiClient.updatePassword(currentPassword, newPassword)
      
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Password Update Failed",
          description: getErrorMessage(response.error),
        })
        setSaving(false)
        return
      }

      // Success
      toast({
        variant: "success",
        title: "Password Updated",
        description: "Your password has been updated successfully",
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: getErrorMessage(err),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#001f3f] p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-300 hover:text-white hover:bg-[#003366]/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-300">Manage your account settings</p>
        </motion.div>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-[#003366] border-[#004080] hover:border-[#0055aa] transition-colors cursor-pointer">
            <CardContent className="p-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="w-full justify-between p-0 h-auto hover:bg-transparent text-white"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#004080]/30 rounded-lg">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold mb-1">Profile</h3>
                    <p className="text-sm text-gray-300">View and edit your profile information</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Update Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#003366] border-[#004080]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription className="text-gray-300">
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="bg-[#001f3f] border-[#004080] text-white pr-10"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    disabled={saving}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password (min. 6 characters)"
                    className="bg-[#001f3f] border-[#004080] text-white pr-10"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    disabled={saving}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="bg-[#001f3f] border-[#004080] text-white pr-10"
                    disabled={saving}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !saving) {
                        handleUpdatePassword()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    disabled={saving}
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
                onClick={handleUpdatePassword}
                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                className="w-full bg-[#004080] hover:bg-[#0055aa] text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
