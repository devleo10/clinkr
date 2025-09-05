import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import LogoBars from './LogoBars'

type Props = {
  compact?: boolean
  message?: string
}

const LoadingScreen = ({ compact = false, message = 'Loading' }: Props) => {
  const [reducedMotion, setReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      setReducedMotion(mq.matches)
      const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
      if (mq.addEventListener) mq.addEventListener('change', handler)
      else mq.addListener(handler)
      return () => {
        if (mq.removeEventListener) mq.removeEventListener('change', handler)
        else mq.removeListener(handler)
      }
    }
    return
  }, [])

  if (compact) {
    // Compact inline logo-based loader (uses brand bars). Provide a minimum area to avoid layout flash.
    return (
      <div className="inline-flex items-center gap-3 min-w-[96px] min-h-[36px] justify-center" role="status" aria-live="polite">
        <span className="sr-only">Loading</span>
        <div className="flex items-center justify-center" aria-hidden="true">
          <LogoBars size={28} color="#FB923C" reducedMotion={reducedMotion} />
        </div>
        <div className="text-sm font-medium text-[rgba(var(--foreground),0.9)]">
          {message ? `${message}...` : 'Loading...'}
        </div>
      </div>
    )
  }

  // Full-screen, centered overlay loader with enhanced cool animations and instant positioning
  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-orange-50/95 via-amber-50/90 to-orange-100/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* Floating background particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-orange-300/40 rounded-full"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3 + i * 0.3,
            ease: 'easeInOut',
            delay: i * 0.2,
          }}
        />
      ))}

      <motion.div
        className="flex flex-col items-center justify-center space-y-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand logo bars used as the main loader in full screen */}
        <span className="sr-only">Loading</span>
        <div className="flex items-center justify-center p-2">
          <LogoBars size={96} color="#FB923C" reducedMotion={reducedMotion} />
        </div>

        {/* Enhanced text with glow effect */}
        <motion.div
          className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 relative"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(251, 146, 60, 0.3))',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            {message}
          </motion.div>
          {message}
          <motion.span className="ml-2" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            ...
          </motion.span>
        </motion.div>

        {/* Enhanced progress bar with glow */}
        <div className="w-64 h-2 bg-orange-100 rounded-full overflow-hidden shadow-inner relative">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full relative"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{
              filter: 'drop-shadow(0 0 6px rgba(251, 146, 60, 0.6))',
            }}
          />
          <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default LoadingScreen