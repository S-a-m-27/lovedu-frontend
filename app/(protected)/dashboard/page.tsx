'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Loader2, Edit2, Save, X } from 'lucide-react'
import { apiClient } from '@/lib/apiClient'

export default function ProfilePage() {
  const { backendUser, getCurrentUserFromBackend } = useSupabaseAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<typeof backendUser>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editFullName, setEditFullName] = useState('')
  const [editDateOfBirth, setEditDateOfBirth] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load fresh user data from backend to ensure we have latest metadata
    const loadUserData = async () => {
      try {
        setLoading(true)
        const freshUser = await getCurrentUserFromBackend()
        if (freshUser) {
          setUserData(freshUser)
        } else if (backendUser) {
          // Fallback to backendUser if API call fails but we have cached data
          setUserData(backendUser)
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
        // Fallback to backendUser if available
        if (backendUser) {
          setUserData(backendUser)
        }
      } finally {
        setLoading(false)
      }
    }

    // Always load from backend, even if we have backendUser cached
    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount to prevent infinite loops

  // All hooks must be called before any conditional returns
  const currentUser = userData || backendUser
  const userMetadata = currentUser?.user_metadata || {}

  const fullName = userMetadata.full_name || userMetadata.fullName || ''
  const dateOfBirth = userMetadata.date_of_birth || userMetadata.dateOfBirth || ''

  // Initialize edit values when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditFullName(fullName)
      setEditDateOfBirth(dateOfBirth)
      setError(null)
    }
  }, [isEditing, fullName, dateOfBirth])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const response = await apiClient.updateProfile(
        editFullName.trim() || undefined,
        editDateOfBirth.trim() || undefined
      )
      
      if (response.error) {
        setError(response.error)
        setSaving(false)
        return
      }

      if (response.data) {
        // Update local state with new data
        setUserData(response.data as typeof backendUser)
        setIsEditing(false)
        // Also update the auth hook's user state
        await getCurrentUserFromBackend()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditFullName(fullName)
    setEditDateOfBirth(dateOfBirth)
    setError(null)
  }

  // Show loading state until data is loaded
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#001f3f] p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-sm sm:text-base text-gray-300">Your personal information</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[#003366] border-[#004080]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription className="text-gray-300">
                Your account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-[#001f3f] rounded-lg">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-400">Email</p>
                  <p className="text-sm sm:text-base text-white font-medium break-words">{currentUser?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-[#001f3f] rounded-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-400 mb-1">Full Name</p>
                  {isEditing ? (
                    <Input
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-[#002233] border-[#004080] text-white"
                    />
                  ) : (
                    <p className="text-white font-medium">{fullName || t('profile.notProvided')}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-3 bg-[#001f3f] rounded-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-400 mb-1">Date of Birth</p>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editDateOfBirth}
                      onChange={(e) => setEditDateOfBirth(e.target.value)}
                      className="bg-[#002233] border-[#004080] text-white"
                    />
                  ) : (
                    <p className="text-white font-medium">
                      {dateOfBirth || t('profile.notProvided')}
                    </p>
                  )}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-[#004080] hover:bg-[#0055aa] text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      disabled={saving}
                      variant="outline"
                      className="flex-1 border-[#004080] text-white hover:bg-[#003366]"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full bg-[#004080] hover:bg-[#0055aa] text-white"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
