"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Phone, PhoneOff, Mic, MicOff, Volume2, MessageSquare, Clock, Plus, Video, Users, Grid3X3 } from "lucide-react"

interface Caller {
  name: string
  number: string
  avatar: string
}

interface CallInterfaceProps {
  caller: Caller
  status: "incoming" | "active" | "ended"
  onAction: (action: "answer" | "decline" | "end") => void
}

export default function CallInterface({ caller, status, onAction }: CallInterfaceProps) {
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const [slidePosition, setSlidePosition] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const ringtoneTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRingingRef = useRef(false)

  // Start call timer when call becomes active
  useEffect(() => {
    if (status === "active") {
      intervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [status])

  // iPhone-style ringtone
  const playiPhoneRingtone = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const audioContext = audioContextRef.current

    // iPhone ringtone frequencies (simplified version of "Opening" ringtone)
    const notes = [
      { freq: 1568, duration: 0.15 }, // G6
      { freq: 1396, duration: 0.15 }, // F6
      { freq: 1175, duration: 0.15 }, // D6
      { freq: 1047, duration: 0.15 }, // C6
      { freq: 0, duration: 0.1 }, // Rest
      { freq: 1175, duration: 0.15 }, // D6
      { freq: 1047, duration: 0.15 }, // C6
      { freq: 880, duration: 0.15 }, // A5
      { freq: 784, duration: 0.3 }, // G5 (longer)
      { freq: 0, duration: 0.2 }, // Rest
    ]

    let currentTime = audioContext.currentTime

    notes.forEach((note) => {
      if (note.freq > 0) {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(note.freq, currentTime)
        oscillator.type = "sine"

        // Envelope for smooth attack and release
        gainNode.gain.setValueAtTime(0, currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.02)
        gainNode.gain.linearRampToValueAtTime(0.08, currentTime + note.duration - 0.02)
        gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration)

        oscillator.start(currentTime)
        oscillator.stop(currentTime + note.duration)
      }
      currentTime += note.duration
    })

    // Schedule next ringtone cycle
    if (isRingingRef.current) {
      ringtoneTimeoutRef.current = setTimeout(
        () => {
          if (isRingingRef.current) {
            playiPhoneRingtone()
          }
        },
        currentTime * 1000 - audioContext.currentTime * 1000 + 500,
      ) // 500ms pause between cycles
    }
  }

  // Handle ringing sound
  useEffect(() => {
    // Clean up any existing audio
    stopRingtone()

    if (status === "incoming") {
      isRingingRef.current = true
      // Small delay to ensure audio context is ready
      setTimeout(() => {
        if (isRingingRef.current) {
          playiPhoneRingtone()
        }
      }, 100)
    } else {
      stopRingtone()
    }

    return () => {
      stopRingtone()
    }
  }, [status])

  const stopRingtone = () => {
    isRingingRef.current = false

    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current)
      ringtoneTimeoutRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current
        .close()
        .then(() => {
          audioContextRef.current = null
        })
        .catch(() => {
          audioContextRef.current = null
        })
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRingtone()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleAnswer = () => {
    stopRingtone()
    onAction("answer")
  }

  const handleDecline = () => {
    stopRingtone()
    onAction("decline")
  }

  const handleEnd = () => {
    stopRingtone()
    onAction("end")
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getCurrentTime = () => {
    const now = new Date()
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Slide to answer functionality
  const handleSlideStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true)
    setSlidePosition(0)
  }

  const handleSlideMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const newPosition = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    setSlidePosition(newPosition)

    if (newPosition > 80) {
      handleAnswer()
      setIsDragging(false)
      setSlidePosition(0)
    }
  }

  const handleSlideEnd = () => {
    setIsDragging(false)
    setSlidePosition(0)
  }

  if (status === "incoming") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* iPhone Status Bar */}
        <div className="flex justify-between items-center px-6 py-2 text-white text-sm font-medium">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            </div>
            <span className="ml-2">Verizon</span>
          </div>
          <div className="text-center font-semibold">{getCurrentTime()}</div>
          <div className="flex items-center space-x-1">
            <span>100%</span>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-full h-full bg-green-500 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Incoming Call Label */}
        <div className="text-center py-4">
          <p className="text-white/70 text-sm">Incoming call...</p>
        </div>

        {/* Caller Profile */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Profile Picture */}
          <div className="relative mb-8">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-8xl shadow-2xl animate-pulse">
              {caller.avatar}
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>

          {/* Caller Name */}
          <h1 className="text-white text-4xl font-light mb-2 text-center">{caller.name}</h1>

          {/* Phone Number */}
          <p className="text-white/70 text-xl mb-4">{caller.number}</p>

          {/* Mobile Label */}
          <p className="text-white/50 text-base">mobile</p>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-16 mb-8">
          <button className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </button>
          <button className="w-14 h-14 rounded-full bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Slide to Answer */}
        <div className="px-8 pb-12">
          <div
            className="relative h-20 bg-gray-900/50 backdrop-blur-sm rounded-full flex items-center px-4"
            onTouchStart={handleSlideStart}
            onTouchMove={handleSlideMove}
            onTouchEnd={handleSlideEnd}
            onMouseDown={handleSlideStart}
            onMouseMove={handleSlideMove}
            onMouseUp={handleSlideEnd}
            onMouseLeave={handleSlideEnd}
          >
            {/* Slide Track */}
            <div className="absolute inset-2 bg-green-500/20 rounded-full"></div>

            {/* Slide Button */}
            <div
              className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200"
              style={{ transform: `translateX(${slidePosition * 2}px)` }}
            >
              <Phone className="w-8 h-8 text-white" />
            </div>

            {/* Slide Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/70 text-lg font-medium">slide to answer</span>
            </div>
          </div>

          {/* Decline Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleDecline}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "active") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col text-white">
        {/* iPhone Status Bar */}
        <div className="flex justify-between items-center px-6 py-2 text-sm font-medium">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white/50 rounded-full"></div>
            </div>
            <span className="ml-2">Verizon</span>
          </div>
          <div className="text-center font-semibold">{getCurrentTime()}</div>
          <div className="flex items-center space-x-1">
            <span>100%</span>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-full h-full bg-green-500 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Call Duration */}
        <div className="text-center py-4">
          <p className="text-green-400 text-sm font-medium">{formatDuration(callDuration)}</p>
        </div>

        {/* Caller Info */}
        <div className="flex-1 flex flex-col items-center justify-start px-8 pt-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl shadow-lg mb-6">
            {caller.avatar}
          </div>
          <h2 className="text-3xl font-light mb-2">{caller.name}</h2>
          <p className="text-white/70 text-lg">{caller.number}</p>
        </div>

        {/* Call Controls Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-3 gap-8 mb-12">
            {/* Mute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-16 h-16 rounded-full flex flex-col items-center justify-center ${
                isMuted ? "bg-white text-black" : "bg-gray-800"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Keypad */}
            <button className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Grid3X3 className="w-6 h-6" />
            </button>

            {/* Speaker */}
            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isSpeaker ? "bg-white text-black" : "bg-gray-800"
              }`}
            >
              <Volume2 className="w-6 h-6" />
            </button>

            {/* Add Call */}
            <button className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </button>

            {/* FaceTime */}
            <button className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </button>

            {/* Contacts */}
            <button className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </button>
          </div>

          {/* End Call */}
          <div className="flex justify-center">
            <button
              onClick={handleEnd}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "ended") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center text-4xl mb-6 mx-auto">
            {caller.avatar}
          </div>
          <h2 className="text-2xl font-light mb-2">Call Ended</h2>
          <p className="text-white/70">Duration: {formatDuration(callDuration)}</p>
        </div>
      </div>
    )
  }

  return null
}
