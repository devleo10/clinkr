import { motion } from 'framer-motion'

type LogoBarsProps = {
  size?: number
  color?: string
  reducedMotion?: boolean
}

export default function LogoBars({ size = 48, color = '#FB923C', reducedMotion = false }: LogoBarsProps) {
  const w = size
  const h = Math.round(size * 0.6)
  // We'll animate scaleY on each rect and set origin at bottom so only the top moves.
  const variants = {
    animate: (delay = 0) => ({
      scaleY: [0.6, 1, 0.6],
      transition: {
        repeat: Infinity,
        duration: 0.8,
        delay,
      },
    }),
  }

  if (reducedMotion) {
    return (
      <svg width={w} height={h} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <rect x="12" y="12" rx="3" ry="3" width="18" height="48" fill={color} />
        <rect x="51" y="12" rx="3" ry="3" width="18" height="48" fill={color} />
        <rect x="90" y="12" rx="3" ry="3" width="18" height="48" fill={color} />
      </svg>
    )
  }

  return (
    <svg width={w} height={h} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <g style={{ transformOrigin: '50% 100%' }}>
        <motion.rect
          x={12}
          y={12}
          rx={3}
          ry={3}
          width={18}
          height={48}
          fill={color}
          style={{ transformOrigin: '50% 100%' }}
          variants={variants}
          custom={0}
          initial={{ scaleY: 0.6 }}
          animate="animate"
        />

        <motion.rect
          x={51}
          y={12}
          rx={3}
          ry={3}
          width={18}
          height={48}
          fill={color}
          style={{ transformOrigin: '50% 100%' }}
          variants={variants}
          custom={0.18}
          initial={{ scaleY: 0.6 }}
          animate="animate"
        />

        <motion.rect
          x={90}
          y={12}
          rx={3}
          ry={3}
          width={18}
          height={48}
          fill={color}
          style={{ transformOrigin: '50% 100%' }}
          variants={variants}
          custom={0.36}
          initial={{ scaleY: 0.6 }}
          animate="animate"
        />
      </g>
    </svg>
  )
}
