'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

const LOGO_SOURCES = ['/logo.png', '/logo.jpeg', '/logo.jpg'] as const

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizes = {
    sm: { width: 90, height: 35 },
    md: { width: 160, height: 60 },
    lg: { width: 220, height: 85 }
  }

  const { width: logoWidth, height: logoHeight } = sizes[size]
  const [srcIndex, setSrcIndex] = useState(0)
  const imgSrc = LOGO_SOURCES[Math.min(srcIndex, LOGO_SOURCES.length - 1)]

  const handleError = () => {
    // Try next format if the current one fails (png -> jpeg -> jpg)
    setSrcIndex((i) => (i < LOGO_SOURCES.length - 1 ? i + 1 : i))
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative mb-2" style={{ width: logoWidth, height: logoHeight }}>
        <Image
          src={imgSrc}
          alt="LovEdu Logo"
          fill
          sizes={`${logoWidth}px`}
          className="object-contain"
          priority
          unoptimized
          onError={handleError}
          key={imgSrc}
        />
      </div>
    </div>
  )
}

// Horizontal version for headers
export const LogoHorizontal: React.FC<LogoProps> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    // Used in tight headers (e.g. sidebar). Keep it readable without eating vertical space.
    sm: { width: 420, height: 102 },
    md: { width: 230, height: 100 },
    lg: { width: 320, height: 120 }
  }

  const { width: logoWidth, height: logoHeight } = sizes[size]
  const [srcIndex, setSrcIndex] = useState(0)
  const imgSrc = LOGO_SOURCES[Math.min(srcIndex, LOGO_SOURCES.length - 1)]

  const handleError = () => {
    // Try next format if the current one fails (png -> jpeg -> jpg)
    setSrcIndex((i) => (i < LOGO_SOURCES.length - 1 ? i + 1 : i))
  }

  return (
    <div className={`flex items-center gap-3 ${className} max-w-full`}>
      <div
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: size === 'sm' ? '100%' : logoWidth,
          height: logoHeight,
          maxWidth: '100%',
        }}
      >
        <Image
          src={imgSrc}
          alt="LovEdu Logo"
          fill
          sizes={size === 'sm' ? '100vw' : `${logoWidth}px`}
          className="object-contain"
          priority
          unoptimized
          onError={handleError}
          key={imgSrc}
        />
      </div>
    </div>
  )
}

