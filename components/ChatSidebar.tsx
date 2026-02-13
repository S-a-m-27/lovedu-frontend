'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { useLanguage } from '@/hooks/useLanguage'
import { apiClient } from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogoHorizontal } from '@/components/Logo'
import { motion } from 'framer-motion'
import {
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  Bot,
  BookOpen,
  Heart,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  FileText,
  GraduationCap,
  X,
  RefreshCw,
  Globe,
  Search
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

interface ChatSession {
  id: string
  assistant_id: string
  created_at: string
  updated_at: string
  message_count: number
  course_id?: string | null
  course_name?: string | null
}

interface ChatSidebarProps {
  selectedAssistant: string
  onAssistantChange: (assistant: string) => void
  onNewChat: () => void
  onSessionSelect?: (sessionId: string) => void
  refreshTrigger?: number
}

interface Course {
  id: string
  course_id: string
  course: {
    id: string
    code: string
    name: string
    description: string | null
  }
  enrolled_at: string
}

export const ChatSidebar = ({ selectedAssistant, onAssistantChange, onNewChat, onSessionSelect, refreshTrigger }: ChatSidebarProps) => {
  const [isAssistantDropdownOpen, setIsAssistantDropdownOpen] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [courseCode, setCourseCode] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [enrollError, setEnrollError] = useState('')
  const [coursesExpanded, setCoursesExpanded] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<Array<{
    id: string
    code: string
    name: string
    description: string | null
  }>>([])
  const [loadingAvailableCourses, setLoadingAvailableCourses] = useState(false)
  const [showManualCode, setShowManualCode] = useState(false)
  const { signOut } = useSupabaseAuth()
  const { isRTL, t, language, changeLanguage } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    loadChatSessions()
    loadCourses()
  }, [refreshTrigger])

  const loadChatSessions = async () => {
    setLoadingSessions(true)
    try {
      const response = await apiClient.getChatSessions()
      if (response.data) {
        setChatSessions(response.data as ChatSession[])
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
    } finally {
      setLoadingSessions(false)
    }
  }

  const loadCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await apiClient.getMyCourses()
      if (response.data) {
        setCourses(response.data as Course[])
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const loadAvailableCourses = async () => {
    setLoadingAvailableCourses(true)
    try {
      const enrolledResponse = await apiClient.getMyCourses()
      const enrolledCourseIds = enrolledResponse.data
        ? (enrolledResponse.data as Course[]).map(c => c.course.id)
        : []

      const response = await apiClient.getAllCourses()

      if (response.error) {
        console.error('Error fetching courses:', response.error)
        setEnrollError(response.error)
        return
      }

      if (response.data) {
        const available = (response.data as Array<{
          id: string
          code: string
          name: string
          description: string | null
        }>).filter(course => !enrolledCourseIds.includes(course.id))
        setAvailableCourses(available)
      } else {
        setAvailableCourses([])
      }
    } catch (error) {
      console.error('Failed to load available courses:', error)
      setEnrollError('Failed to load courses. Please try again.')
    } finally {
      setLoadingAvailableCourses(false)
    }
  }

  const handleAddCourse = async (code?: string) => {
    const codeToUse = code || courseCode
    if (!codeToUse.trim()) {
      setEnrollError('Course code is required')
      return
    }

    setEnrolling(true)
    setEnrollError('')
    try {
      const response = await apiClient.enrollCourse(codeToUse.trim())
      if (response.error) {
        setEnrollError(response.error)
      } else {
        await loadCourses()
        await loadChatSessions()
        setShowAddCourseDialog(false)
        setCourseCode('')
        if (onSessionSelect) {
          const sessionsResponse = await apiClient.getChatSessions()
          if (sessionsResponse.data) {
            const courseSession = (sessionsResponse.data as any[]).find(
              (s: any) => s.course_id === response.data?.course_id
            )
            if (courseSession) {
              onSessionSelect(courseSession.id)
            }
          }
        }
      }
    } catch (error: any) {
      setEnrollError(error.message || 'Failed to enroll in course')
    } finally {
      setEnrolling(false)
    }
  }

  const handleCourseClick = async (courseId: string) => {
    const courseSession = chatSessions.find((s: any) => s.course_id === courseId)
    if (courseSession) {
      onSessionSelect?.(courseSession.id)
    } else {
      await loadChatSessions()
      const updatedSessions = await apiClient.getChatSessions()
      if (updatedSessions.data) {
        const newCourseSession = (updatedSessions.data as any[]).find(
          (s: any) => s.course_id === courseId
        )
        if (newCourseSession) {
          onSessionSelect?.(newCourseSession.id)
        }
      }
    }
  }

  const assistants = [
    { id: 'typeX', name: t('chat.assistants.typeX'), icon: Bot },
    { id: 'references', name: t('chat.assistants.references'), icon: BookOpen },
    { id: 'academicReferences', name: t('chat.assistants.academicReferences'), icon: FileText },
    { id: 'therapyGPT', name: t('chat.assistants.therapyGPT'), icon: Heart },
    { id: 'whatsTrendy', name: t('chat.assistants.whatsTrendy'), icon: TrendingUp },
  ]

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const getAssistantName = (id: string) => {
    const assistant = assistants.find(a => a.id === id)
    return assistant?.name || t('chat.assistants.typeX')
  }

  const filteredSessions = searchQuery.trim()
    ? chatSessions.filter((session) => {
        const q = searchQuery.trim().toLowerCase()
        const title = (session.course_name || getAssistantName(session.assistant_id) || '').toLowerCase()
        return title.includes(q)
      })
    : chatSessions

  return (
    <div className={`w-full sm:w-64 md:w-80 lg:w-80 bg-[#0a1628] ${isRTL ? 'border-l' : 'border-r'} border-[#1a2332] flex flex-col h-screen relative`}>
      {/* Fixed Top Header (ChatGPT-style) */}
      <div className="px-2 sm:px-4 py-2 border-b border-[#1a2332] bg-[#0a1628] flex-shrink-0 relative z-30">
        <div className="relative overflow-hidden min-h-[80px] sm:min-h-[104px] mb-1.5">
          <div
            className={`flex items-center ${
              isRTL
                ? 'mr-2 sm:mr-4 md:mr-8 -mt-1 md:-mt-2 pl-10 sm:pl-14'
                : 'ml-2 sm:ml-4 md:ml-8 -mt-1 md:-mt-2 pr-10 sm:pr-14'
            }`}
          >
            <LogoHorizontal size="sm" className="w-full" />
        </div>
          <button
            onClick={() => {
              const newLanguage = language === 'en' ? 'ar' : 'en'
              changeLanguage(newLanguage)
            }}
            className={[
              'absolute bottom-1.5',
              isRTL ? 'left-1.5 sm:left-2' : 'right-1.5 sm:right-2',
              'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-full border border-[#1a2332] bg-[#0a1628]/40 text-gray-200 hover:text-white hover:bg-[#1a2332]/40 transition-all duration-200 text-[10px] sm:text-[11px] whitespace-nowrap',
            ].join(' ')}
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">{language === 'en' ? 'العربية' : 'English'}</span>
            <span className="lg:hidden">{language === 'en' ? 'AR' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Single Scroll Region (ChatGPT-style) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
        {/* Top action buttons (ChatGPT-style rows) */}
        <div className="px-2 sm:px-3 py-2 border-b border-[#1a2332]">
          <button
            type="button"
            onClick={() => {
              onNewChat()
              setSearchOpen(false)
              setSearchQuery('')
            }}
            className={`w-full flex items-center gap-1.5 sm:gap-2 px-1 py-1.5 sm:py-2 text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors rounded-md ${
              isRTL ? 'flex-row-reverse text-right' : 'text-left'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-[13px] font-medium">{t('common.newChat')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className={`w-full flex items-center gap-1.5 sm:gap-2 px-1 py-1.5 sm:py-2 text-gray-200 hover:text-white hover:bg-white/5 transition-colors rounded-md ${
              isRTL ? 'flex-row-reverse text-right' : 'text-left'
            }`}
          >
            <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="text-xs sm:text-[13px] font-medium">{t('common.searchChats')}</span>
          </button>

          {searchOpen && (
            <div className="mt-1 px-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your chats..."
                className="h-9 bg-[#0a1628] border-[#1a2332] text-white placeholder:text-gray-500 text-sm"
              />
            </div>
          )}
        </div>

        {/* Assistant Selection */}
        <div className="px-2 sm:px-3 py-2 border-b border-[#1a2332] bg-[#0a1628]">
          <div className="relative">
            <button
              type="button"
            onClick={() => setIsAssistantDropdownOpen(!isAssistantDropdownOpen)}
              className={`w-full flex items-center justify-between gap-2 sm:gap-3 px-1 py-1.5 sm:py-2 text-gray-200 hover:text-white hover:bg-white/5 transition-colors rounded-md ${
                isRTL ? 'flex-row-reverse text-right' : 'text-left'
              }`}
          >
              <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="text-xs sm:text-[13px] font-medium truncate">{getAssistantName(selectedAssistant)}</span>
            </span>
              <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 transition-transform duration-200 ${isAssistantDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

          {isAssistantDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a1628] border border-[#1a2332] rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
              {assistants.map((assistant) => {
                const Icon = assistant.icon
                const isSelected = selectedAssistant === assistant.id
                return (
                  <button
                    key={assistant.id}
                    onClick={() => {
                      onAssistantChange(assistant.id)
                      setIsAssistantDropdownOpen(false)
                    }}
                      className={`w-full px-4 py-3 text-left hover:bg-[#1a2332] flex items-center gap-3 text-white transition-all duration-150 ${
                        isSelected ? 'bg-[#1a2332] border-l-2 border-[#2563eb]' : ''
                      }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{assistant.name}</span>
                  </button>
                )
              })}
              </div>
          )}
        </div>
      </div>

      {/* My Courses Section */}
        <div className="border-b border-[#1a2332] px-2 sm:px-3 py-1">
        <button
            type="button"
          onClick={() => setCoursesExpanded(!coursesExpanded)}
            className={`w-full flex items-center justify-between gap-2 sm:gap-3 px-1 py-1.5 sm:py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors rounded-md ${
              isRTL ? 'flex-row-reverse text-right' : 'text-left'
            }`}
        >
            <span className="text-xs sm:text-[13px] font-medium">
            {t('course.myCourses')}
            </span>
          {coursesExpanded ? (
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-200" />
          ) : (
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 transition-transform duration-200" />
          )}
        </button>
        {coursesExpanded && (
            <div className="px-1 pb-2">
            {loadingCourses ? (
                <div className="flex items-center justify-center py-6">
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : courses.length > 0 ? (
                <div className="space-y-1 mt-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => handleCourseClick(course.course_id)}
                      className={`w-full group flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg hover:bg-[#1a2332]/60 transition-all duration-150 ${
                        isRTL ? 'flex-row-reverse text-right' : 'text-left'
                      }`}
                  >
                      <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#dc2626] flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-200 truncate group-hover:text-white transition-colors">
                        {course.course.name}
                      </span>
                  </button>
                ))}
              </div>
            ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 mb-2">{t('course.noCourses')}</p>
              </div>
            )}
            <Button
              onClick={() => setShowAddCourseDialog(true)}
                className="w-full bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center gap-2 h-9 text-xs mt-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
                <Plus className="h-3.5 w-3.5" />
                {t('course.addCourse')}
            </Button>
          </div>
        )}
      </div>

        {/* Chat History Section */}
        <div className="px-3 py-1">
          <div className={`w-full flex items-center justify-between gap-3 px-1 py-2 text-gray-300 ${
            isRTL ? 'flex-row-reverse text-right' : 'text-left'
          }`}>
            <span className="text-xs sm:text-[13px] font-medium">{t('chatHistory.recentChats')}</span>
          </div>
        </div>
        <div className="px-2 sm:px-3 py-2 pb-4 sm:pb-6">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-gray-400" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-2 sm:px-4">
              <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-gray-600 mb-2 sm:mb-3" />
              <p className="text-xs sm:text-sm text-gray-500">
                {searchQuery.trim() ? 'No chats match your search.' : t('chatHistory.noHistory')}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <button
                  key={session.id}
                    onClick={() => onSessionSelect?.(session.id)}
                  className={`w-full group flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-white/5 transition-all duration-150 ${
                    isRTL ? 'flex-row-reverse text-right' : 'text-left'
                  }`}
                  >
                      {session.course_id ? (
                    <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#dc2626] flex-shrink-0" />
                      ) : (
                    <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#60a5fa] flex-shrink-0" />
                      )}
                    <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}>
                          {session.course_name || getAssistantName(session.assistant_id)}
                        </p>
                    </div>
                  </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-2 sm:px-3 py-2 sm:py-3 border-t border-[#1a2332] bg-[#0a1628] flex-shrink-0">
        <div className={`flex gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="ghost"
            onClick={() => router.push('/settings')}
            className="flex-1 text-gray-400 hover:text-white hover:bg-[#1a2332]/60 h-9 sm:h-10 text-xs sm:text-sm rounded-lg transition-all duration-150 justify-center"
          >
            <Settings className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
            <span className="hidden sm:inline">{t('common.settings')}</span>
            <span className="sm:hidden">⚙️</span>
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="flex-1 text-red-400 hover:text-red-300 hover:bg-red-900/10 h-9 sm:h-10 text-xs sm:text-sm rounded-lg transition-all duration-150 justify-center"
          >
            <LogOut className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
            <span className="hidden sm:inline">{t('common.logout')}</span>
            <span className="sm:hidden">🚪</span>
          </Button>
        </div>
      </div>

      {/* Add Course Dialog */}
      <Dialog
        open={showAddCourseDialog}
        onOpenChange={(open) => {
          setShowAddCourseDialog(open)
          if (open) {
            loadAvailableCourses()
            setShowManualCode(false)
            setCourseCode('')
            setEnrollError('')
          }
        }}
      >
        <DialogContent className="bg-[#001f3f] border-[#004080] text-white max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{t('course.addCourse')}</DialogTitle>
            <DialogDescription className="text-gray-300">
              {t('course.browseOrEnterCode')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!showManualCode && (
              <div>
                <div className={`flex justify-between items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`text-sm font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('course.availableCourses')}
                  </h3>
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadAvailableCourses}
                      disabled={loadingAvailableCourses}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingAvailableCourses ? 'animate-spin' : ''} ${isRTL ? 'ml-1' : 'mr-1'}`} />
                      {t('common.refresh')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowManualCode(true)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      {t('course.enterCodeInstead')}
                    </Button>
                  </div>
                </div>
                {loadingAvailableCourses ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">{t('course.loadingCourses')}</p>
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400">{t('course.noCoursesAvailable')}</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {availableCourses.map((course) => (
                      <Card
                        key={course.id}
                        className="bg-[#003366] border-[#004080] cursor-pointer hover:bg-[#004080] transition-colors"
                        onClick={() => handleAddCourse(course.code)}
                      >
                        <CardContent className="p-3">
                          <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className="flex-1">
                              <h4 className={`font-semibold text-white text-sm mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {course.name}
                              </h4>
                              <p className={`text-xs text-gray-300 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {t('course.code')}: {course.code}
                              </p>
                              {course.description && (
                                <p className={`text-xs text-gray-400 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {course.description}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className={`bg-[#dc2626] hover:bg-[#b91c1c] ${isRTL ? 'mr-2' : 'ml-2'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAddCourse(course.code)
                              }}
                              disabled={enrolling}
                            >
                              {t('course.enroll')}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showManualCode && (
              <div>
                <div className={`flex justify-between items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className={`text-sm font-semibold text-white ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('course.enterCourseCode')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowManualCode(false)
                      loadAvailableCourses()
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {t('course.browseCourses')}
                  </Button>
                </div>
                <div>
                  <label htmlFor="courseCode" className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('course.code')}
                  </label>
                  <Input
                    id="courseCode"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder={t('course.codePlaceholder')}
                    className="bg-[#003366] border-[#004080] text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !enrolling) {
                        handleAddCourse()
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {enrollError && (
              <div className="p-2 bg-red-900/20 border border-red-800 rounded-md">
                <p className="text-sm text-red-400">{enrollError}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddCourseDialog(false)
                  setCourseCode('')
                  setEnrollError('')
                  setShowManualCode(false)
                }}
                className="border-[#004080] text-white hover:bg-[#003366]"
              >
                {t('common.cancel')}
              </Button>
              {showManualCode && (
                <Button
                  onClick={() => handleAddCourse()}
                  disabled={enrolling || !courseCode.trim()}
                  className="bg-[#dc2626] hover:bg-[#b91c1c]"
                >
                  {enrolling ? t('course.enrolling') : t('course.addCourse')}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
