import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isKuwaitUniversityEmail(email: string): boolean {
  const allowedDomains = ['@ku.edu.kw', '@grad.edu.kw', '@grade.edu.kw']
  return allowedDomains.some(domain => email.endsWith(domain))
}

