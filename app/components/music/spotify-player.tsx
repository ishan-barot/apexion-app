
'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'

// spotify playlist data - hardcoded for now since we cant access real spotify api without complex setup
const playlistData = {
  name: 'lofi 🌸 for study, chill, and more',
  tracks: [
    { id: 1, title: 'Your Eyes', artist: 'Joey Pecoraro', duration: '3:24' },
    { id: 2, title: 'finding parking', artist: 'eery', duration: '2:45' },
    { id: 3, title: 'lazy afternoon', artist: 'Kupla', duration: '3:12' },
    { id: 4, title: 'warm coffee', artist: 'Aso', duration: '2:58' },
    { id: 5, title: 'sunday morning', artist: 'fantompower', duration: '3:33' }
  ]
}

export default function SpotifyPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(180) // 3 minutes in seconds
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            // auto-advance to next track
            handleNext()
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, duration])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // in a real app, this would control actual spotify playback
  }

  const handlePrevious = () => {
    const prevTrack = currentTrack > 0 ? currentTrack - 1 : playlistData.tracks.length - 1
    setCurrentTrack(prevTrack)
    setCurrentTime(0)
    // simulate different track durations
    setDuration(180 + Math.floor(Math.random() * 60))
  }

  const handleNext = () => {
    const nextTrack = currentTrack < playlistData.tracks.length - 1 ? currentTrack + 1 : 0
    setCurrentTrack(nextTrack)
    setCurrentTime(0)
    // simulate different track durations
    setDuration(180 + Math.floor(Math.random() * 60))
  }

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentSong = playlistData.tracks[currentTrack]

  return (
    <Card className="fixed bottom-4 left-4 right-4 bg-black text-white border-gray-800 z-40">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* album art placeholder */}
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded flex-shrink-0 flex items-center justify-center">
            <span className="text-xs font-bold">🎵</span>
          </div>

          {/* track info */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {currentSong.title}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {currentSong.artist}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {playlistData.name}
            </div>
          </div>

          {/* playback controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="text-white hover:bg-gray-800"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePlayPause}
              className="text-white hover:bg-gray-800"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNext}
              className="text-white hover:bg-gray-800"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* progress bar */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <span className="text-xs text-gray-400 w-8">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-gray-400 w-8">
              {formatTime(duration)}
            </span>
          </div>

          {/* volume control */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-gray-800"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            
            <div className="w-20">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
