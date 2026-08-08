"use client"

import { motion, useReducedMotion } from "framer-motion"

type AnimatedTextProps = {
  text: string
  delay?: number
  className?: string
}

export function AnimatedText({ text, delay = 0, className }: AnimatedTextProps) {
  const reduceMotion = useReducedMotion()

  if (!text) return null

  if (reduceMotion) {
    return <span className={className}>{text}</span>
  }

  const words = text.split(" ")
  let globalIndex = 0

  return (
    <span className={className}>
      {words.map((word, wordIndex) => {
        const wordStart = globalIndex
        globalIndex += word.length

        return (
          <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
            {word.split("").map((char, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: delay + (wordStart + index) * 0.03,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
            {wordIndex < words.length - 1 ? "\u00A0" : null}
          </span>
        )
      })}
    </span>
  )
}
