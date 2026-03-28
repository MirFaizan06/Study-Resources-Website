import React, { useEffect, useRef } from 'react'
import styles from './AdBanner.module.scss'

// Google AdSense publisher ID — replace with your actual ID
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical'
  responsive?: boolean
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className,
}: AdBannerProps): React.ReactElement | null {
  const adRef = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    if (!adRef.current) return

    try {
      // Only push if AdSense script is loaded
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({})
        pushed.current = true
      }
    } catch {
      // AdSense not loaded yet — silently skip
    }
  }, [])

  // Don't render ads in development
  if (import.meta.env.DEV) {
    return (
      <div className={[styles.adPlaceholder, className].filter(Boolean).join(' ')} aria-hidden="true">
        <span className={styles.adLabel}>Ad Placement — {slot}</span>
      </div>
    )
  }

  return (
    <div className={[styles.adContainer, className].filter(Boolean).join(' ')}>
      <ins
        ref={adRef}
        className={`adsbygoogle ${styles.adUnit}`}
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}
