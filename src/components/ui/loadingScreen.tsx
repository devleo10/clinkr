import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import LogoBars from './LogoBars'
import BoltBackground from '../homepage/BoltBackground'

type Props = {
  compact?: boolean
}

const LoadingScreen = ({ compact = false }: Props) => {
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
          <LogoBars size={28} color="#ED7B00" reducedMotion={reducedMotion} />
        </div>
        <div className="text-lg lg:text-xl leading-relaxed font-medium text-gray-700" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
          Loading...
        </div>
      </div>
    )
  }

  // Full-screen, centered overlay loader with enhanced cool animations and instant positioning
  return (
    <div className="fixed inset-0 z-[9999] min-h-screen" style={{ background: 'var(--c-bg)' }}>
      <BoltBackground />
      <div className="relative z-10 flex items-center justify-center min-h-screen">
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
            <LogoBars size={96} color="#ED7B00" reducedMotion={reducedMotion} />
          </div>

          {/* Enhanced text with marketing-style styling */}
          <motion.div
            className="text-lg lg:text-xl leading-relaxed font-medium text-gray-700 relative"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ 
              fontFamily: "'Space Grotesk', 'Poppins', sans-serif"
            }}
          >
            <motion.div
              className="absolute inset-0 text-gray-600"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            >
              Loading
            </motion.div>
            Loading
            <motion.span className="ml-2" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
              ...
            </motion.span>
          </motion.div>

          {/* Enhanced progress bar with orange styling */}
          <div className="w-64 h-2 bg-orange-100 rounded-full overflow-hidden shadow-inner relative">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 rounded-full relative"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LoadingScreen