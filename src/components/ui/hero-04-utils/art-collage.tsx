'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ArtCollageProps {
  primaryImage: string
  secondaryImage: string
  primaryAlt?: string
  secondaryAlt?: string
  className?: string
}

export function ArtCollage({
  primaryImage,
  secondaryImage,
  primaryAlt = '',
  secondaryAlt = '',
  className,
}: ArtCollageProps) {
  return (
    <div className={cn('relative w-full max-w-lg', className)}>
      {/* Back — rectangle (portrait), positioned top-left at zero */}
      <motion.div
        className="relative w-[75%] overflow-hidden rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="aspect-[3/4] bg-[var(--color-bg-secondary)]">
          <img
            src={secondaryImage}
            alt={secondaryAlt}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </motion.div>

      {/* Front — square, overlapping bottom-right, absolute zero */}
      <motion.div
        className="absolute right-0 bottom-0 w-[55%] overflow-hidden rounded-2xl shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      >
        <div className="aspect-square bg-[var(--color-bg-secondary)]">
          <img
            src={primaryImage}
            alt={primaryAlt}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      </motion.div>
    </div>
  )
}
