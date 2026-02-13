/**
 * Maps backend error messages to user-friendly messages
 */
export function getErrorMessage(error: string | Error | unknown): string {
  // Handle different error object structures
  let errorString = ''
  
  if (error instanceof Error) {
    errorString = error.message
  } else if (typeof error === 'string') {
    errorString = error
  } else if (error && typeof error === 'object') {
    // Handle objects with message property (e.g., { message: "error" })
    if ('message' in error && typeof error.message === 'string') {
      errorString = error.message
    } else if ('error' in error && typeof error.error === 'string') {
      errorString = error.error
    } else if ('detail' in error && typeof error.detail === 'string') {
      errorString = error.detail
    } else {
      // Try to stringify the object safely
      try {
        const stringified = JSON.stringify(error)
        // If it's a simple object, try to extract meaningful info
        if (stringified !== '{}' && stringified.length < 200) {
          errorString = stringified
        } else {
          errorString = 'An error occurred'
        }
      } catch {
        errorString = 'An error occurred'
      }
    }
  } else {
    errorString = String(error || '')
  }
  
  // If still empty or "[object Object]", provide default
  if (!errorString || errorString === '[object Object]') {
    return 'An error occurred. Please try again.'
  }
  
  // Network errors
  if (errorString.includes('fetch') || errorString.includes('network') || errorString.includes('Failed to fetch')) {
    return 'Connection error. Please check your internet connection and try again.'
  }
  
  // Authentication errors
  if (errorString.includes('Invalid login credentials') || errorString.includes('Invalid email or password')) {
    return 'Invalid email or password. Please try again.'
  }
  
  if (errorString.includes('Email not confirmed') || errorString.includes('email_confirmed_at')) {
    return 'Please verify your email address before signing in.'
  }
  
  if (errorString.includes('User already registered') || errorString.includes('already exists')) {
    return 'An account with this email already exists.'
  }
  
  if (errorString.includes('Password')) {
    if (errorString.includes('too short') || errorString.includes('at least')) {
      return 'Password must be at least 6 characters long.'
    }
    if (errorString.includes('match')) {
      return 'Passwords do not match.'
    }
    if (errorString.includes('incorrect') || errorString.includes('wrong')) {
      return 'Incorrect password. Please try again.'
    }
  }
  
  // Domain restriction
  if (errorString.includes('domain') || errorString.includes('restricted') || errorString.includes('Kuwait University')) {
    return 'Access restricted to Kuwait University members only.'
  }
  
  // Validation errors
  if (errorString.includes('required') || errorString.includes('missing')) {
    return 'Please fill in all required fields.'
  }
  
  if (errorString.includes('email') && errorString.includes('invalid')) {
    return 'Please enter a valid email address.'
  }
  
  // Server errors
  if (errorString.includes('500') || errorString.includes('Internal Server Error')) {
    return 'Server error. Please try again later.'
  }
  
  if (errorString.includes('503') || errorString.includes('Service Unavailable')) {
    return 'Service temporarily unavailable. Please try again later.'
  }
  
  if (errorString.includes('429') || errorString.includes('Too Many Requests')) {
    return 'Too many requests. Please wait a moment and try again.'
  }
  
  // Rate limit errors
  if (errorString.includes('rate limit') || errorString.includes('too many signup') || errorString.includes('email rate limit')) {
    return 'Too many signup attempts. Please wait 5-10 minutes before trying again.'
  }
  
  // Generic API errors
  if (errorString.includes('HTTP') || errorString.includes('status')) {
    return 'Something went wrong. Please try again.'
  }
  
  // Supabase specific errors
  if (errorString.includes('supabase') || errorString.includes('Supabase')) {
    return 'Database error. Please try again later.'
  }
  
  // If error is already user-friendly (short and clear), return it
  if (errorString.length < 100 && !errorString.includes('Error:') && !errorString.includes('Exception:')) {
    return errorString
  }
  
  // Default fallback
  return 'An error occurred. Please try again.'
}
