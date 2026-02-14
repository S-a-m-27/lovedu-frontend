'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/hooks/useLanguage'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import Image from 'next/image'
import { apiClient } from '@/lib/apiClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Shield, Calendar, CheckCircle, X, Trash2, Download, Loader2, AlertCircle, Eye, ArrowLeft, GraduationCap, Plus, Edit, Save, LogOut } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { getErrorMessage } from '@/lib/errorMessages'

interface FileUpload {
  id: string
  assistant_id: string
  file_name: string
  file_url: string | null
  file_size: number | null
  uploaded_at: string
  uploaded_by: string
  file_type?: 'behavior' | 'content'
}

interface AssistantFiles {
  assistantId: string
  files: FileUpload[]
}

export default function AdminUploadPage() {
  const { t, isRTL } = useLanguage()
  const { backendUser, signOut } = useSupabaseAuth()
  const router = useRouter()

  const [isAdmin, setIsAdmin] = useState(true)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const { toast } = useToast()

  const uploadCategories = useMemo(() => [
    {
      id: 'typeX',
      nameKey: 'chat.assistants.typeX',
      icon: FileText,
    },
    {
      id: 'references',
      nameKey: 'chat.assistants.references',
      icon: FileText,
    },
    {
      id: 'academicReferences',
      nameKey: 'chat.assistants.academicReferences',
      icon: FileText,
    },
    {
      id: 'therapyGPT',
      nameKey: 'chat.assistants.therapyGPT',
      icon: FileText,
    },
    {
      id: 'whatsTrendy',
      nameKey: 'chat.assistants.whatsTrendy',
      icon: FileText,
    }
  ], [])

  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({})
  const [assistantFiles, setAssistantFiles] = useState<Record<string, FileUpload[]>>({})
  const [expandedAssistants, setExpandedAssistants] = useState<Set<string>>(new Set())

  // Course Management State
  const [courses, setCourses] = useState<Array<{
    id: string
    code: string
    name: string
    description: string | null
  }>>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set())
  const [courseFiles, setCourseFiles] = useState<Record<string, FileUpload[]>>({})
  const [behaviorFiles, setBehaviorFiles] = useState<Record<string, FileUpload[]>>({})
  const [selectedCourseFiles, setSelectedCourseFiles] = useState<Record<string, File | null>>({})
  const [selectedBehaviorFiles, setSelectedBehaviorFiles] = useState<Record<string, File | null>>({})
  const [uploadingCourseFile, setUploadingCourseFile] = useState<string | null>(null)
  const [uploadingBehaviorFile, setUploadingBehaviorFile] = useState<string | null>(null)
  const [newCourse, setNewCourse] = useState({ code: '', name: '', description: '' })
  const [editingCourseData, setEditingCourseData] = useState<Record<string, { code: string; name: string; description: string }>>({})
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [logoIndex, setLogoIndex] = useState(0)
  
  const adminSources = ['/admin.png', '/admin.jpeg', '/admin.jpg'] as const
  const adminSrc = adminSources[Math.min(logoIndex, adminSources.length - 1)]

  useEffect(() => {
    checkAdminAndLoadFiles()
  }, [])

  const checkAdminAndLoadFiles = async () => {
    try {
      setLoading(true)
      // Check admin status - for now assume true if user exists
      // You can implement proper admin check here
      setIsAdmin(true)

      // Load files for all assistants
      await Promise.all(
        uploadCategories.map(async (category) => {
          try {
            const response = await apiClient.getFiles(category.id)
            if (response.data && response.data.files) {
              setAssistantFiles(prev => ({
                ...prev,
                [category.id]: response.data!.files
              }))
            }
          } catch (err) {
            console.error(`Failed to load files for ${category.id}:`, err)
          }
        })
      )

      // Load courses
      await loadCourses()
    } catch (err) {
      console.error('Failed to check admin status:', err)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (assistantId: string, file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Only PDF files are allowed",
      })
      return
    }

    setSelectedFiles(prev => ({
      ...prev,
      [assistantId]: file
    }))
  }

  const handleUpload = async (assistantId: string) => {
    const file = selectedFiles[assistantId]
    if (!file) return

    setUploading(assistantId)
    setUploadProgress(prev => ({ ...prev, [assistantId]: 0 }))

    try {
      // Simulate upload progress (in real implementation, this would come from the upload)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[assistantId] || 0
          if (current >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, [assistantId]: current + 10 }
        })
      }, 200)

      const response = await apiClient.uploadFile(assistantId, file)

      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [assistantId]: 100 }))

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Upload Successful",
          description: `File "${file.name}" uploaded successfully!`,
        })

        // Clear selected file
        setSelectedFiles(prev => ({ ...prev, [assistantId]: null }))

        // Reload files for this assistant
        const filesResponse = await apiClient.getFiles(assistantId)
        if (filesResponse.data && filesResponse.data.files) {
          setAssistantFiles(prev => ({
            ...prev,
            [assistantId]: filesResponse.data!.files
          }))
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: getErrorMessage(err),
      })
    } finally {
      setUploading(null)
      setTimeout(() => {
        setUploadProgress(prev => {
          const updated = { ...prev }
          delete updated[assistantId]
          return updated
        })
      }, 1000)
    }
  }

  const handleDelete = async (assistantId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

    try {
      const response = await apiClient.deleteFile(assistantId, fileName)

      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Delete Successful",
          description: `File "${fileName}" deleted successfully!`,
        })

        // Reload files
        const filesResponse = await apiClient.getFiles(assistantId)
        if (filesResponse.data && filesResponse.data.files) {
          setAssistantFiles(prev => ({
            ...prev,
            [assistantId]: filesResponse.data!.files
          }))
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: getErrorMessage(err),
      })
    }
  }

  const toggleExpand = (assistantId: string) => {
    setExpandedAssistants(prev => {
      const newSet = new Set(prev)
      if (newSet.has(assistantId)) {
        newSet.delete(assistantId)
      } else {
        newSet.add(assistantId)
      }
      return newSet
    })
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Course Management Functions
  const loadCourses = async () => {
    setLoadingCourses(true)
    try {
      const response = await apiClient.getAllCourses()
      if (response.data) {
        setCourses(response.data)

        // Load files for all courses
        await Promise.all(
          response.data.map(async (course) => {
            try {
              const filesResponse = await apiClient.getCourseFiles(course.id)
              if (filesResponse.data && filesResponse.data.files) {
                setCourseFiles(prev => ({
                  ...prev,
                  [course.id]: filesResponse.data!.files
                }))
              }
            } catch (err) {
              console.error(`Failed to load files for course ${course.id}:`, err)
            }
          })
        )
      }
    } catch (err) {
      console.error('Failed to load courses:', err)
      toast({
        variant: "destructive",
        title: "Failed to Load",
        description: "Failed to load courses",
      })
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourse.code.trim() || !newCourse.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: t('course.codeRequired') + ' & ' + t('course.nameRequired'),
      })
      return
    }

    setCreatingCourse(true)

    try {
      const response = await apiClient.createCourse(newCourse.code.trim(), newCourse.name.trim(), newCourse.description.trim() || undefined)
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Failed to Create Course",
          description: getErrorMessage(response.error || 'Failed to create course'),
        })
      } else {
        toast({
          variant: "success",
          title: "Course Created",
          description: t('course.courseCreated'),
        })
        setNewCourse({ code: '', name: '', description: '' })
        setShowCreateCourse(false)
        await loadCourses()
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to Create Course",
        description: getErrorMessage(err),
      })
    } finally {
      setCreatingCourse(false)
    }
  }

  const handleUpdateCourse = async (courseId: string) => {
    const editData = editingCourseData[courseId]
    if (!editData) return

    try {
      const response = await apiClient.updateCourse(courseId, editData.code, editData.name, editData.description || undefined)
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Course Updated",
          description: t('course.courseUpdated'),
        })
        setEditingCourse(null)
        setEditingCourseData(prev => {
          const updated = { ...prev }
          delete updated[courseId]
          return updated
        })
        await loadCourses()
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to Update Course",
        description: getErrorMessage(err),
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm(t('course.confirmDelete'))) return

    try {
      const response = await apiClient.deleteCourse(courseId)
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Course Deleted",
          description: t('course.courseDeleted'),
        })
        await loadCourses()
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to Delete Course",
        description: getErrorMessage(err),
      })
    }
  }

  const loadCourseFiles = async (courseId: string) => {
    try {
      const response = await apiClient.getCourseFiles(courseId)
      if (response.data && response.data.files) {
        // Separate behavior and content files
        const contentFiles = response.data.files.filter(f => !f.file_type || f.file_type === 'content')
        const behaviorFilesList = response.data.files.filter(f => f.file_type === 'behavior')
        
        setCourseFiles(prev => ({
          ...prev,
          [courseId]: contentFiles
        }))
        setBehaviorFiles(prev => ({
          ...prev,
          [courseId]: behaviorFilesList
        }))
      }
    } catch (err) {
      console.error(`Failed to load files for course ${courseId}:`, err)
    }
  }

  const handleCourseFileSelect = (courseId: string, file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Only PDF files are allowed",
      })
      return
    }
    setSelectedCourseFiles(prev => ({ ...prev, [courseId]: file }))
  }

  const handleBehaviorFileSelect = (courseId: string, file: File | null) => {
    if (file && file.type !== 'application/pdf') {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Only PDF files are allowed",
      })
      return
    }
    setSelectedBehaviorFiles(prev => ({ ...prev, [courseId]: file }))
  }

  const handleUploadCourseFile = async (courseId: string) => {
    const file = selectedCourseFiles[courseId]
    if (!file) return

    setUploadingCourseFile(courseId)
    try {
      const response = await apiClient.uploadCourseFile(courseId, file, 'content')
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Upload Successful",
          description: `Course content file "${file.name}" uploaded successfully!`,
        })
        setSelectedCourseFiles(prev => ({ ...prev, [courseId]: null }))
        await loadCourseFiles(courseId)
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: getErrorMessage(err),
      })
    } finally {
      setUploadingCourseFile(null)
    }
  }

  const handleUploadBehaviorFile = async (courseId: string) => {
    const file = selectedBehaviorFiles[courseId]
    if (!file) return

    setUploadingBehaviorFile(courseId)
    try {
      const response = await apiClient.uploadCourseFile(courseId, file, 'behavior')
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Upload Successful",
          description: `Behavior PDF "${file.name}" uploaded successfully!`,
        })
        setSelectedBehaviorFiles(prev => ({ ...prev, [courseId]: null }))
        await loadCourseFiles(courseId)
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: getErrorMessage(err),
      })
    } finally {
      setUploadingBehaviorFile(null)
    }
  }

  const handleDeleteCourseFile = async (courseId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return

    try {
      const response = await apiClient.deleteCourseFile(courseId, fileName)
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Operation Failed",
          description: getErrorMessage(response.error),
        })
      } else {
        toast({
          variant: "success",
          title: "Delete Successful",
          description: 'File deleted successfully!',
        })
        await loadCourseFiles(courseId)
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: getErrorMessage(err),
      })
    }
  }

  const toggleCourseExpand = (courseId: string) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev)
      if (newSet.has(courseId)) {
        newSet.delete(courseId)
      } else {
        newSet.add(courseId)
        if (!courseFiles[courseId]) {
          loadCourseFiles(courseId)
        }
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className={`min-h-screen bg-[#001f3f] flex items-center justify-center p-4 ${isRTL ? 'font-arabic' : ''}`}>
        <Card className="shadow-xl max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">
              Access Denied
            </CardTitle>
            <CardDescription>
              You don't have permission to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/chat')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-[#001f3f] p-3 sm:p-4 md:p-6 ${isRTL ? 'font-arabic' : ''}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          {/* Top Row: Logout Button and Language Switcher */}
          <div className={`flex justify-between items-center mb-4 sm:mb-6 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut()
                router.push('/login')
              }}
              className="text-white hover:bg-[#003366] flex-shrink-0 text-xs sm:text-sm"
            >
              <LogOut className={`h-3 w-3 sm:h-4 sm:w-4 ${isRTL ? 'ml-1 sm:ml-2' : 'mr-1 sm:mr-2'}`} />
              <span className="hidden sm:inline">{t('common.logout')}</span>
            </Button>
            <div className={`flex items-center gap-2 sm:gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Logo Row - Centered */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative w-full max-w-[400px] sm:max-w-[480px] md:max-w-[560px] lg:max-w-[640px] h-32 sm:h-40 md:h-48 lg:h-56">
              <Image
                src={adminSrc}
                alt="LovEdu Admin Logo"
                fill
                sizes="(max-width: 640px) 400px, (max-width: 768px) 480px, (max-width: 1024px) 560px, 640px"
                className="object-contain"
                priority
                unoptimized
                onError={() => {
                  setLogoIndex((prev) => (prev < adminSources.length - 1 ? prev + 1 : prev))
                }}
                key={adminSrc}
              />
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('admin.title')}
            </h2>
            <p className={`text-sm sm:text-base text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('admin.subtitle')}
            </p>
          </div>
        </div>


        {/* Upload Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {uploadCategories.map((category, index) => {
            const Icon = category.icon
            const isUploading = uploading === category.id
            const progress = uploadProgress[category.id] || 0
            const selectedFile = selectedFiles[category.id]
            const files = assistantFiles[category.id] || []
            const isExpanded = expandedAssistants.has(category.id)

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <CardHeader>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="p-2 bg-[#003366] rounded-lg flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <CardTitle className={`text-base sm:text-lg md:text-xl ${isRTL ? 'text-right' : 'text-left'}`}>{t(category.nameKey)}</CardTitle>
                        <CardDescription className={`text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                          {files.length} {t('common.filesUploaded')}
                        </CardDescription>
                        {files.length > 0 && (
                          <div className={`mt-2 max-h-20 overflow-y-auto space-y-0.5 pr-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {files.slice(0, 3).map((file) => (
                              <div key={file.id} className={`flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <FileText className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate" title={file.file_name}>{file.file_name}</span>
                              </div>
                            ))}
                            {files.length > 3 && (
                              <div className={`text-xs text-gray-400 dark:text-gray-500 italic pt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                                +{files.length - 3} more {t('common.files')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    {/* File Input */}
                    <div className="space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('common.selectPDF')}
                      </label>
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileSelect(category.id, e.target.files?.[0] || null)}
                          className="hidden"
                          id={`file-${category.id}`}
                          disabled={isUploading}
                        />
                        <label
                          htmlFor={`file-${category.id}`}
                          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${isUploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                            }`}
                        >
                          <Upload className="h-4 w-4" />
                          {selectedFile ? t('common.changeFile') : t('common.chooseFile')}
                        </label>
                        {selectedFile && (
                          <div className={`flex items-center gap-2 text-sm text-green-600 dark:text-green-400 p-2 bg-green-50 dark:bg-green-900/20 rounded ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate flex-1">{selectedFile.name}</span>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(selectedFile.size)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                      <div className="space-y-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#dc2626] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center">{progress}%</p>
                      </div>
                    )}

                    {/* Upload Button */}
                    <Button
                      onClick={() => handleUpload(category.id)}
                      disabled={!selectedFile || isUploading}
                      className="w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                          {t('common.uploading')}
                        </>
                      ) : selectedFile ? (
                        t('common.uploadPDF')
                      ) : (
                        t('common.selectFileFirst')
                      )}
                    </Button>

                    {/* Files List Toggle */}
                    {files.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => toggleExpand(category.id)}
                        className="w-full"
                      >
                        {isExpanded ? t('course.hideFiles') : t('course.showFiles')} ({files.length})
                      </Button>
                    )}

                    {/* Files List */}
                    <AnimatePresence>
                      {isExpanded && files.length > 0 && (
                        <motion.div
                          key={`assistant-files-${category.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 border-t pt-4 mt-auto"
                        >
                          {files.map((file, idx) => (
                            <div
                              key={file.id || `assistant-file-${category.id}-${idx}-${file.file_name}`}
                              className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-start justify-between gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {file.file_name}
                                  </p>
                                </div>
                                <div className={`flex items-center gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <span>{formatFileSize(file.file_size)}</span>
                                  <span className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(file.uploaded_at)}
                                  </span>
                                </div>
                              </div>
                              <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={async () => {
                                    try {
                                      const token = apiClient.getToken()
                                      if (!token) {
                                        toast({
                                          variant: "destructive",
                                          title: "Authentication Error",
                                          description: "Please sign in again",
                                        })
                                        return
                                      }
                                      const url = apiClient.getFileDownloadUrl(category.id, file.file_name)
                                      const response = await fetch(url, {
                                        headers: {
                                          'Authorization': `Bearer ${token}`
                                        }
                                      })
                                      if (response.ok) {
                                        const blob = await response.blob()
                                        const blobUrl = URL.createObjectURL(blob)
                                        window.open(blobUrl, '_blank')
                                        // Clean up blob URL after a delay
                                        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                      } else {
                                        toast({
                                        variant: "destructive",
                                        title: "Failed to Open",
                                        description: "Failed to open file",
                                      })
                                      }
                                    } catch (err) {
                                      toast({
                                        variant: "destructive",
                                        title: "Failed to Open",
                                        description: "Failed to open file",
                                      })
                                    }
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(category.id, file.file_name)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Course Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8"
        >
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white flex-shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">{t('course.title')}</h2>
            </div>
            <Button
              onClick={() => setShowCreateCourse(!showCreateCourse)}
              className="bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {showCreateCourse ? t('common.cancel') : t('course.create')}
            </Button>
          </div>

          {/* Create Course Form */}
          {showCreateCourse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="bg-[#003366] border-[#004080]">
                <CardHeader>
                  <CardTitle className={`text-white text-base sm:text-lg ${isRTL ? 'text-right' : 'text-left'}`}>{t('course.createNew')}</CardTitle>
                  <CardDescription className={`text-gray-300 text-xs sm:text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('course.descriptionHint')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('course.code')} *</label>
                    <input
                      type="text"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g., CM101"
                      className={`w-full px-4 py-2 bg-[#001f3f] border border-[#004080] rounded-lg text-white placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('course.name')} *</label>
                    <input
                      type="text"
                      value={newCourse.name}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Construction Management"
                      className={`w-full px-4 py-2 bg-[#001f3f] border border-[#004080] rounded-lg text-white placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-300 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>{t('course.description')} ({t('common.optional')})</label>
                    <textarea
                      value={newCourse.description}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Course description..."
                      rows={3}
                      className={`w-full px-4 py-2 bg-[#001f3f] border border-[#004080] rounded-lg text-white placeholder-gray-400 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                  <Button
                    onClick={handleCreateCourse}
                    disabled={creatingCourse || !newCourse.code.trim() || !newCourse.name.trim()}
                    className="w-full bg-[#dc2626] hover:bg-[#b91c1c] disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {creatingCourse ? (
                      <>
                        <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                        {t('course.creating')}
                      </>
                    ) : (
                      t('course.createButton')
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Courses List */}
          {loadingCourses ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-gray-300">{t('course.loadingCourses')}</p>
            </div>
          ) : courses.length === 0 ? (
            <Card className="bg-[#003366] border-[#004080]">
              <CardContent className="py-8 text-center">
                <p className="text-gray-300">{t('course.noCourses')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-[#003366] border-[#004080] h-full flex flex-col">
                    <CardHeader>
                      <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <CardTitle className={`text-white text-base sm:text-lg mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {editingCourse === course.id ? (
                              <input
                                type="text"
                                value={editingCourseData[course.id]?.name || course.name}
                                onChange={(e) => setEditingCourseData(prev => ({
                                  ...prev,
                                  [course.id]: { ...prev[course.id], name: e.target.value, code: prev[course.id]?.code || course.code, description: prev[course.id]?.description || course.description || '' }
                                }))}
                                className={`w-full px-2 py-1 bg-[#001f3f] border border-[#004080] rounded text-white text-base sm:text-lg font-semibold ${isRTL ? 'text-right' : 'text-left'}`}
                              />
                            ) : (
                              course.name
                            )}
                          </CardTitle>
                          <CardDescription className={`text-gray-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {editingCourse === course.id ? (
                              <input
                                type="text"
                                value={editingCourseData[course.id]?.code || course.code}
                                onChange={(e) => setEditingCourseData(prev => ({
                                  ...prev,
                                  [course.id]: { ...prev[course.id], code: e.target.value.toUpperCase(), name: prev[course.id]?.name || course.name, description: prev[course.id]?.description || course.description || '' }
                                }))}
                                className={`w-full px-2 py-1 bg-[#001f3f] border border-[#004080] rounded text-gray-300 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                                dir="ltr"
                              />
                            ) : (
                              `${t('course.code')}: ${course.code}`
                            )}
                          </CardDescription>
                          {!editingCourse && courseFiles[course.id] && courseFiles[course.id].length > 0 && (
                            <div className={`mt-1.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                              <div className="text-xs text-gray-400 mb-1">
                                {courseFiles[course.id].length} {t('common.filesUploaded')}:
                              </div>
                              <div className="max-h-20 overflow-y-auto space-y-0.5 pr-1">
                                {courseFiles[course.id].slice(0, 3).map((file, idx) => (
                                  <div key={file.id || `course-file-${course.id}-${idx}-${file.file_name}`} className={`flex items-center gap-1.5 text-xs text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <FileText className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate" title={file.file_name}>{file.file_name}</span>
                                  </div>
                                ))}
                                {courseFiles[course.id].length > 3 && (
                                  <div className={`text-xs text-gray-500 italic pt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    +{courseFiles[course.id].length - 3} more {t('common.files')}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className={`flex gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {editingCourse === course.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateCourse(course.id)}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(null)
                                  setEditingCourseData(prev => {
                                    const updated = { ...prev }
                                    delete updated[course.id]
                                    return updated
                                  })
                                }}
                                className="h-8 w-8 p-0"
                                variant="ghost"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingCourse(course.id)
                                  setEditingCourseData(prev => ({
                                    ...prev,
                                    [course.id]: { code: course.code, name: course.name, description: course.description || '' }
                                  }))
                                }}
                                className="h-8 w-8 p-0"
                                variant="ghost"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteCourse(course.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                variant="ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      {course.description && (
                        <p className={`text-xs sm:text-sm text-gray-400 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {editingCourse === course.id ? (
                            <textarea
                              value={editingCourseData[course.id]?.description || ''}
                              onChange={(e) => setEditingCourseData(prev => ({
                                ...prev,
                                [course.id]: { ...prev[course.id], description: e.target.value, code: prev[course.id]?.code || course.code, name: prev[course.id]?.name || course.name }
                              }))}
                              rows={2}
                              className={`w-full px-2 py-1 bg-[#001f3f] border border-[#004080] rounded text-gray-400 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                            />
                          ) : (
                            course.description
                          )}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      {/* Behavior PDF Upload Section */}
                      <div className="space-y-3 mb-4 pb-4 border-b border-[#004080]">
                        <label className="block text-xs sm:text-sm font-medium text-blue-300 mb-2">
                          📋 {t('course.uploadBehaviorPDF') || 'Upload Behavior PDF'}
                        </label>
                        <p className="text-[10px] sm:text-xs text-gray-400 mb-2">
                          {t('course.behaviorPDFDescription') || 'PDFs that define agent behavior, rules, and guidelines'}
                        </p>
                        <div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleBehaviorFileSelect(course.id, e.target.files?.[0] || null)}
                            className="hidden"
                            id={`behavior-file-${course.id}`}
                          />
                          <label
                            htmlFor={`behavior-file-${course.id}`}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer transition-colors duration-200 text-xs sm:text-sm ${uploadingBehaviorFile === course.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                          >
                            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {selectedBehaviorFiles[course.id] ? (t('course.changeFile') || 'Change File') : (t('course.choosePDF') || 'Choose Behavior PDF')}
                          </label>
                          {selectedBehaviorFiles[course.id] && (
                            <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-400 p-1.5 sm:p-2 bg-green-900/20 rounded mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate flex-1">{selectedBehaviorFiles[course.id]!.name}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleUploadBehaviorFile(course.id)}
                          disabled={!selectedBehaviorFiles[course.id] || uploadingBehaviorFile === course.id}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          {uploadingBehaviorFile === course.id ? (
                            <>
                              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                              {t('course.uploading') || 'Uploading...'}
                            </>
                          ) : (
                            t('course.uploadBehaviorPDF') || 'Upload Behavior PDF'
                          )}
                        </Button>
                        {/* Behavior Files List */}
                        {behaviorFiles[course.id] && behaviorFiles[course.id].length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-400">{behaviorFiles[course.id].length} behavior PDF(s) uploaded</p>
                            {behaviorFiles[course.id].slice(0, 2).map((file, idx) => (
                              <div key={file.id || `behavior-${course.id}-${idx}-${file.file_name}`} className="text-xs text-blue-300 truncate">• {file.file_name}</div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Course Content PDF Upload Section */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          📚 {t('course.uploadContentPDF') || 'Upload Course Content PDF'}
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                          {t('course.contentPDFDescription') || 'PDFs containing course materials (syllabi, lecture notes, etc.)'}
                        </p>
                        <div>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => handleCourseFileSelect(course.id, e.target.files?.[0] || null)}
                            className="hidden"
                            id={`course-file-${course.id}`}
                          />
                          <label
                            htmlFor={`course-file-${course.id}`}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg cursor-pointer transition-colors duration-200 text-xs sm:text-sm ${uploadingCourseFile === course.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#dc2626] hover:bg-[#b91c1c] text-white'
                              }`}
                          >
                            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            {selectedCourseFiles[course.id] ? t('course.changeFile') : (t('course.choosePDF') || 'Choose Content PDF')}
                          </label>
                          {selectedCourseFiles[course.id] && (
                            <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-green-400 p-1.5 sm:p-2 bg-green-900/20 rounded mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate flex-1">{selectedCourseFiles[course.id]!.name}</span>
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleUploadCourseFile(course.id)}
                          disabled={!selectedCourseFiles[course.id] || uploadingCourseFile === course.id}
                          className="w-full"
                          size="sm"
                        >
                          {uploadingCourseFile === course.id ? (
                            <>
                              <Loader2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                              {t('course.uploading')}
                            </>
                          ) : (
                            t('course.uploadPDFButton') || 'Upload Content PDF'
                          )}
                        </Button>

                        {/* Files List Toggle */}
                        {courseFiles[course.id] && courseFiles[course.id].length > 0 && (
                          <Button
                            variant="outline"
                            onClick={() => toggleCourseExpand(course.id)}
                            className="w-full"
                            size="sm"
                          >
                            {expandedCourses.has(course.id) ? t('course.hideFiles') : t('course.showFiles')} ({courseFiles[course.id].length})
                          </Button>
                        )}

                        {/* Course Files List */}
                        <AnimatePresence>
                          {expandedCourses.has(course.id) && courseFiles[course.id] && courseFiles[course.id].length > 0 && (
                            <motion.div
                              key={`course-files-${course.id}`}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2 border-t pt-3 mt-3"
                            >
                              {courseFiles[course.id].map((file, idx) => (
                                <div
                                  key={file.id || `course-content-${course.id}-${idx}-${file.file_name}`}
                                  className={`p-2 sm:p-2.5 bg-[#001f3f] rounded-lg flex items-start justify-between gap-1.5 sm:gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-white truncate">{file.file_name}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-400">{formatFileSize(file.file_size)}</p>
                                  </div>
                                  <div className={`flex gap-0.5 sm:gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={async () => {
                                        try {
                                          const token = apiClient.getToken()
                                          if (!token) {
                                            toast({
                                              variant: "destructive",
                                              title: "Authentication Error",
                                              description: "Please sign in again",
                                            })
                                            return
                                          }
                                          const url = apiClient.getCourseFileDownloadUrl(course.id, file.file_name)
                                          const response = await fetch(url, {
                                            headers: {
                                              'Authorization': `Bearer ${token}`
                                            }
                                          })
                                          if (response.ok) {
                                            const blob = await response.blob()
                                            const blobUrl = URL.createObjectURL(blob)
                                            window.open(blobUrl, '_blank')
                                            // Clean up blob URL after a delay
                                            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
                                          } else {
                                            toast({
                                        variant: "destructive",
                                        title: "Failed to Open",
                                        description: "Failed to open file",
                                      })
                                          }
                                        } catch (err) {
                                          toast({
                                        variant: "destructive",
                                        title: "Failed to Open",
                                        description: "Failed to open file",
                                      })
                                        }
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteCourseFile(course.id, file.file_name)}
                                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 p-6 bg-[#003366] rounded-lg border border-[#004080]"
        >
          <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Shield className="h-6 w-6 text-white mt-1 flex-shrink-0" />
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <h3 className={`font-semibold text-white mb-2 text-base sm:text-lg ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('admin.uploadGuidelines')}
              </h3>
              <ul className={`text-xs sm:text-sm text-gray-300 space-y-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                {(t('admin.guidelines') as unknown as string[])?.map((guideline: string, index: number) => (
                  <li key={index} className={isRTL ? 'text-right' : 'text-left'}>• {guideline}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
