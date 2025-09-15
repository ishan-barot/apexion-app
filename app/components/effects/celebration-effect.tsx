

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface CelebrationEffectProps {
  trigger: boolean
  message: string
  type?: 'task' | 'timer' | 'streak' | 'achievement'
  onComplete?: () => void
}

export default function CelebrationEffect({ 
  trigger, 
  message, 
  type = 'task',
  onComplete 
}: CelebrationEffectProps) {
  const [show, setShow] = useState(false)

  const getEmoji = () => {
    switch (type) {
      case 'task': return '✅'
      case 'timer': return '⏰'
      case 'streak': return '🔥'
      case 'achievement': return '🏆'
      default: return '🎉'
    }
  }

  const playSound = () => {
    // Create audio context for celebration sound
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Success sound sequence
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.value = frequency
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
        
        oscillator.start(startTime)
        oscillator.stop(startTime + duration)
      }

      const now = audioContext.currentTime
      // Play a happy chord progression
      playNote(523.25, now, 0.3) // C5
      playNote(659.25, now + 0.15, 0.3) // E5
      playNote(783.99, now + 0.3, 0.3) // G5
      
    } catch (error) {
      console.log('Audio not supported')
    }
  }

  const fireConfetti = () => {
    const colors = {
      task: ['#10b981', '#3b82f6'],
      timer: ['#f59e0b', '#ef4444'],
      streak: ['#ef4444', '#f97316'],
      achievement: ['#8b5cf6', '#06b6d4']
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors[type]
    })

    // Additional burst for achievements
    if (type === 'achievement') {
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 120,
          origin: { y: 0.4 }
        })
      }, 300)
    }
  }

  useEffect(() => {
    if (trigger) {
      setShow(true)
      playSound()
      fireConfetti()

      const timer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 0.6,
              times: [0, 0.6, 1]
            }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center border-4 border-yellow-400"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-6xl mb-4"
            >
              {getEmoji()}
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Awesome!
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {message}
            </p>

            {/* Animated sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 200],
                  y: [0, (Math.random() - 0.5) * 200]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="absolute text-2xl"
                style={{
                  left: '50%',
                  top: '50%'
                }}
              >
                ✨
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
