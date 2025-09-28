"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Pause, Square, RotateCcw, Timer, Coffee, Settings, Volume2, VolumeX, Bell } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Task {
  id: string
  titulo: string
  descripcion: string
  proyectoId: string
  fechaAsignada: string
  prioridad: "alta" | "media" | "baja"
  estado: "pendiente" | "en-progreso" | "completada" | "cancelada"
  pomodoros: number
  tiempoTotal: number
  completada: boolean
  estimatedPomodoros?: number
}

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

interface PomodoroTimerProps {
  activeTask: Task | null
  onComplete: (taskId: string) => void
  onStop: () => void
  autoStart?: boolean // Added optional auto-start prop
  onAutoStartComplete?: () => void // Added callback for when auto-start is handled
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationsEnabled: true,
}

export function PomodoroTimer({ activeTask, onComplete, onStop, autoStart, onAutoStartComplete }: PomodoroTimerProps) {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>("pomodoroSettings", defaultSettings)
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentDuration = isBreak
    ? completedPomodoros % settings.longBreakInterval === 0 && completedPomodoros > 0
      ? settings.longBreakDuration
      : settings.shortBreakDuration
    : settings.workDuration

  const totalTime = currentDuration * 60

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Create a simple beep sound using Web Audio API
      const createBeepSound = () => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = "sine"

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      }

      audioRef.current = { play: createBeepSound } as any
    }
  }, [])

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
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
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }
  }, [timeLeft, isRunning])

  useEffect(() => {
    if (autoStart && activeTask && !isRunning && !isBreak) {
      // Request notification permission
      if (settings.notificationsEnabled && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission()
      }
      setIsRunning(true)
      onAutoStartComplete?.()
    }
  }, [autoStart, activeTask, isRunning, isBreak, settings.notificationsEnabled, onAutoStartComplete])

  const handleTimerComplete = () => {
    setIsRunning(false)

    // Play notification sound
    if (settings.soundEnabled && audioRef.current) {
      try {
        audioRef.current.play()
      } catch (error) {
        console.log("Audio playback failed")
      }
    }

    // Show browser notification
    if (settings.notificationsEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(isBreak ? "¡Descanso terminado!" : "¡Pomodoro completado!", {
          body: isBreak
            ? "Es hora de volver al trabajo"
            : `Has completado un pomodoro${activeTask ? ` en "${activeTask.titulo}"` : ""}`,
          icon: "/favicon.ico",
        })
      }
    }

    if (!isBreak && activeTask) {
      // Work session completed
      onComplete(activeTask.id)
      setCompletedPomodoros((prev) => prev + 1)

      // Start break
      setIsBreak(true)
      const breakTime =
        (completedPomodoros + 1) % settings.longBreakInterval === 0
          ? settings.longBreakDuration * 60
          : settings.shortBreakDuration * 60
      setTimeLeft(breakTime)

      setIsRunning(true)
    } else {
      // Break completed
      setIsBreak(false)
      setTimeLeft(settings.workDuration * 60)

      // Auto-start next pomodoro if enabled
      if (settings.autoStartPomodoros) {
        setIsRunning(true)
      }
    }
  }

  const handleStart = () => {
    // Request notification permission
    if (settings.notificationsEnabled && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setTimeLeft(settings.workDuration * 60)
    setIsBreak(false)
    onStop()
  }

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(totalTime)
  }

  const handleSkip = () => {
    setTimeLeft(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    // Update current timer if not running
    if (!isRunning) {
      if (isBreak) {
        const breakTime =
          completedPomodoros % updatedSettings.longBreakInterval === 0 && completedPomodoros > 0
            ? updatedSettings.longBreakDuration * 60
            : updatedSettings.shortBreakDuration * 60
        setTimeLeft(breakTime)
      } else {
        setTimeLeft(updatedSettings.workDuration * 60)
      }
    }
  }

  return (
    <div className="p-6 h-full">
      <Tabs defaultValue="timer" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timer">Timer</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="flex-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                {isBreak ? (
                  <>
                    <Coffee className="w-5 h-5 text-accent" />
                    {completedPomodoros % settings.longBreakInterval === 0 && completedPomodoros > 0
                      ? "Descanso Largo"
                      : "Descanso Corto"}
                  </>
                ) : (
                  <>
                    <Timer className="w-5 h-5 text-accent" />
                    Pomodoro
                  </>
                )}
                <Badge variant="outline" className="ml-auto">
                  {completedPomodoros}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTask && !isBreak ? (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">{activeTask.titulo}</h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Pomodoros: {activeTask.pomodoros}</span>
                    {activeTask.estimatedPomodoros && <span>Meta: {activeTask.estimatedPomodoros}</span>}
                  </div>
                </div>
              ) : isBreak ? (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    {completedPomodoros % settings.longBreakInterval === 0 && completedPomodoros > 0
                      ? `Descanso largo (${settings.longBreakDuration} min)`
                      : `Descanso corto (${settings.shortBreakDuration} min)`}
                  </p>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Selecciona una tarea para comenzar</p>
                </div>
              )}

              {/* Timer Display */}
              <div className="text-center mb-6">
                <div className="text-4xl font-mono font-bold text-primary mb-2">{formatTime(timeLeft)}</div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Controls */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {!isRunning ? (
                  <Button
                    onClick={handleStart}
                    disabled={!activeTask && !isBreak}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar
                  </Button>
                ) : (
                  <Button onClick={handlePause} variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </Button>
                )}

                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reiniciar
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleSkip} variant="outline" size="sm">
                  Saltar
                </Button>
                <Button onClick={handleStop} variant="outline" size="sm">
                  <Square className="w-4 h-4 mr-2" />
                  Detener
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sesión Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pomodoros:</span>
                  <span className="font-semibold">{completedPomodoros}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiempo total:</span>
                  <span className="font-semibold">{completedPomodoros * settings.workDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Próximo descanso:</span>
                  <span className="font-semibold">
                    {settings.longBreakInterval - (completedPomodoros % settings.longBreakInterval)} pomodoros
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración del Pomodoro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Settings */}
              <div>
                <h3 className="font-semibold mb-3">Duración (minutos)</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="workDuration">Trabajo</Label>
                    <Input
                      id="workDuration"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.workDuration}
                      onChange={(e) => updateSettings({ workDuration: Number.parseInt(e.target.value) || 25 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shortBreak">Descanso corto</Label>
                    <Input
                      id="shortBreak"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => updateSettings({ shortBreakDuration: Number.parseInt(e.target.value) || 5 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longBreak">Descanso largo</Label>
                    <Input
                      id="longBreak"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => updateSettings({ longBreakDuration: Number.parseInt(e.target.value) || 15 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longBreakInterval">Intervalo descanso largo</Label>
                    <Input
                      id="longBreakInterval"
                      type="number"
                      min="2"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={(e) => updateSettings({ longBreakInterval: Number.parseInt(e.target.value) || 4 })}
                    />
                  </div>
                </div>
              </div>

              {/* Auto-start Settings */}
              <div>
                <h3 className="font-semibold mb-3">Inicio Automático</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoStartBreaks">Iniciar descansos automáticamente</Label>
                    <Switch
                      id="autoStartBreaks"
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) => updateSettings({ autoStartBreaks: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoStartPomodoros">Iniciar pomodoros automáticamente</Label>
                    <Switch
                      id="autoStartPomodoros"
                      checked={settings.autoStartPomodoros}
                      onCheckedChange={(checked) => updateSettings({ autoStartPomodoros: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h3 className="font-semibold mb-3">Notificaciones</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="soundEnabled" className="flex items-center gap-2">
                      {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Sonido
                    </Label>
                    <Switch
                      id="soundEnabled"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notificationsEnabled" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notificaciones del navegador
                    </Label>
                    <Switch
                      id="notificationsEnabled"
                      checked={settings.notificationsEnabled}
                      onCheckedChange={(checked) => updateSettings({ notificationsEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Reset to defaults */}
              <div className="pt-4 border-t">
                <Button variant="outline" onClick={() => setSettings(defaultSettings)} className="w-full">
                  Restaurar configuración por defecto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
