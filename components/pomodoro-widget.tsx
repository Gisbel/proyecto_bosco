"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, Play, Pause, Square } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface PomodoroSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
}

interface PomodoroWidgetProps {
  activeTask?: { id: string; titulo: string } | null
  onComplete?: (taskId: string) => void
  className?: string
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
}

export function PomodoroWidget({ activeTask, onComplete, className }: PomodoroWidgetProps) {
  const [settings] = useLocalStorage<PomodoroSettings>("pomodoroSettings", defaultSettings)
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  const totalTime = isBreak ? settings.shortBreakDuration * 60 : settings.workDuration * 60

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsRunning(false)
      if (!isBreak && activeTask && onComplete) {
        onComplete(activeTask.id)
      }
      // Toggle between work and break
      setIsBreak(!isBreak)
      setTimeLeft(isBreak ? settings.workDuration * 60 : settings.shortBreakDuration * 60)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, isBreak, activeTask, onComplete, settings])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-accent" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{isBreak ? "Descanso" : "Pomodoro"}</span>
              <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            {activeTask && !isBreak && <p className="text-xs text-muted-foreground truncate">{activeTask.titulo}</p>}
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRunning(!isRunning)}
              disabled={!activeTask && !isBreak}
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsRunning(false)
                setTimeLeft(settings.workDuration * 60)
                setIsBreak(false)
              }}
            >
              <Square className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
