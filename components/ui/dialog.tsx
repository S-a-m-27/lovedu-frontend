'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
}

interface DialogHeaderProps {
  children: React.ReactNode
}

interface DialogTitleProps {
  className?: string
  children: React.ReactNode
}

interface DialogDescriptionProps {
  className?: string
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  )
}

const DialogContent = ({ className = '', children }: DialogContentProps) => {
  return (
    <div className={`relative z-50 w-full max-w-md p-6 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  )
}

const DialogHeader = ({ children }: DialogHeaderProps) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

const DialogTitle = ({ className = '', children }: DialogTitleProps) => {
  return (
    <h2 className={`text-xl font-semibold ${className}`}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ className = '', children }: DialogDescriptionProps) => {
  return (
    <p className={`text-sm text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  )
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }

