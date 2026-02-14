'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/apiClient'

interface BackendUser {
  id: string
  email: string
  email_verified: boolean
  created_at: string
  user_metadata: Record<string, any>
}

interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in?: number
  token_type: string
  user: BackendUser
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<BackendUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkExistingSession = async () => {
      const token = apiClient.getToken()
      if (token) {
        // Verify token with backend
        await verifyTokenAndLoadUser(token)
      } else {
        setLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  const verifyTokenAndLoadUser = async (token: string) => {
    try {
      console.log('🔐 Verifying token on mount...', {
        tokenLength: token?.length,
        tokenPreview: token?.substring(0, 20) + '...'
      })
      
      const response = await apiClient.verifyToken(token)
      
      if (response.data) {
        const userData = response.data as BackendUser
        console.log('✅ Token verified successfully:', {
          userEmail: userData.email,
          userId: userData.id
        })
        
        setUser(userData)
        
        // Try to get refresh token from storage
        const storedSession = localStorage.getItem('auth_session')
        if (storedSession) {
          try {
            const sessionData = JSON.parse(storedSession) as AuthSession
            setSession({
              ...sessionData,
              user: userData
            })
          } catch {
            // If session parse fails, create minimal session
            setSession({
              access_token: token,
              refresh_token: '',
              token_type: 'bearer',
              user: userData
            })
          }
        } else {
          // Create minimal session if no stored session
          setSession({
            access_token: token,
            refresh_token: '',
            token_type: 'bearer',
            user: userData
          })
        }
      } else {
        // Token invalid, clear everything
        console.error('❌ Token verification failed - no data in response:', response)
        clearAuth()
      }
    } catch (error) {
      console.error('❌ Failed to verify token:', error)
      if (error instanceof Error) {
        console.error('   Error message:', error.message)
        console.error('   Error stack:', error.stack)
      }
      clearAuth()
    } finally {
      setLoading(false)
    }
  }

  const clearAuth = () => {
    apiClient.clearToken()
    localStorage.removeItem('auth_session')
    setUser(null)
    setSession(null)
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      
      if (response.error) {
        return { data: null, error: { message: response.error } }
      }
      
      if (response.data) {
        const authData = response.data as AuthSession
        
        // Store token and session
        apiClient.setToken(authData.access_token)
        localStorage.setItem('auth_session', JSON.stringify(authData))
        
        // Update state
        setUser(authData.user)
        setSession(authData)
        
        return { data: { user: authData.user, session: authData }, error: null }
      }
      
      return { data: null, error: { message: 'Login failed' } }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Login failed' } }
    }
  }

  const signUp = async (email: string, password: string, user_metadata?: Record<string, any>) => {
    try {
      // Clear any old tokens before signup (since signup doesn't return a token anymore)
      apiClient.clearToken()
      localStorage.removeItem('auth_session')
      
      const full_name = user_metadata?.full_name
      const date_of_birth = user_metadata?.date_of_birth
      const response = await apiClient.signup(email, password, user_metadata, full_name, date_of_birth)
      
      if (response.error) {
        console.error('❌ Signup error:', response.error)
        return { data: null, error: { message: response.error } }
  }

      if (response.data) {
        const authData = response.data as AuthSession
        
        // Check if token exists (signup may not return token if email verification is required)
        if (authData.access_token) {
          // Debug: Log token before storing
          console.log('✅ Signup successful, token received:', {
            tokenLength: authData.access_token?.length,
            tokenPreview: authData.access_token?.substring(0, 20) + '...',
            expiresIn: authData.expires_in,
            hasRefreshToken: !!authData.refresh_token,
            userEmail: authData.user?.email
          })
          
          // Store token and session
          apiClient.setToken(authData.access_token)
          localStorage.setItem('auth_session', JSON.stringify(authData))
          
          // Verify token was stored
          const storedToken = apiClient.getToken()
          console.log('✅ Token stored, verification:', {
            stored: !!storedToken,
            storedLength: storedToken?.length,
            matches: storedToken === authData.access_token
          })
          
          // Verify token works immediately after signup (optional - token is fresh from signup)
          // This is just for debugging - if it fails, it's not critical since we just got the token
          try {
            const verifyResponse = await apiClient.verifyToken(authData.access_token)
            if (verifyResponse.data) {
              console.log('✅ Token verification after signup successful:', {
                userEmail: verifyResponse.data.email,
                userId: verifyResponse.data.id
              })
            } else if (verifyResponse.error) {
              // Log as warning, not error, since token was just created
              console.warn('⚠️ Token verification after signup returned error (non-critical):', {
                error: verifyResponse.error,
                note: 'Token was just created, this may be a temporary issue'
              })
            }
          } catch (verifyError) {
            console.warn('⚠️ Token verification after signup failed (non-critical):', verifyError)
          }
        } else {
          // No token returned - user needs to verify email first
          console.log('✅ Signup successful, but no token returned (email verification required)')
          // Don't store anything - user needs to verify email and then sign in
        }
        } catch (verifyError) {
          // Log as warning, not error, since this is optional verification
          console.warn('⚠️ Token verification after signup failed (non-critical):', {
            error: verifyError instanceof Error ? verifyError.message : String(verifyError),
            note: 'Token was just created, verification will happen on next request'
          })
        }
        
        // Update state
        setUser(authData.user)
        setSession(authData)
        
        return { data: { user: authData.user, session: authData }, error: null }
  }

      console.error('❌ Signup failed - no data in response')
      return { data: null, error: { message: 'Signup failed' } }
    } catch (error: any) {
      console.error('❌ Signup exception:', error)
      return { data: null, error: { message: error.message || 'Signup failed' } }
    }
  }

  const signOut = async () => {
    clearAuth()
    return { error: null }
  }

  // Test user login for development
  const signInTestUser = async () => {
    return await signIn('test@ku.edu.kw', 'testpassword123')
  }

  // Get current user from backend
  const getCurrentUserFromBackend = useCallback(async () => {
    try {
      const response = await apiClient.getCurrentUser()
      if (response.data) {
        const userData = response.data as BackendUser
        setUser(userData)
        return userData
      }
      return null
    } catch (error) {
      console.error('Failed to get current user from backend:', error)
      return null
    }
  }, []) // Empty dependency array since apiClient is stable

  return {
    user,
    session,
    backendUser: user, // For backward compatibility
    loading,
    signIn,
    signUp,
    signOut,
    signInTestUser,
    getCurrentUserFromBackend,
  }
}

