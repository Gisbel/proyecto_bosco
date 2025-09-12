"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Timer, Play, Pause, Square, BarChart3 } from "lucide-react"
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
}

interface Project {
  id: string
  nombre: string
  descripcion: string
  fechaLimite: string
  cliente: string
  activo: boolean
}

interface TimeSession {
  id: string
  taskId: string
  projectId: string
  startTime: string
  endTime?: string
  duration: number // in minutes
  type: "pomodoro" | "manual" | "break"
  description?: string
}

interface TimeTrackerProps {
  tasks: Task[]
  projects: Project[]
  onSessionComplete?: (session: TimeSession) => void
}

export function TimeTracker({ tasks, projects, onSessionComplete }: TimeTrackerProps) {
  const [sessions, setSessions] = useLocalStorage<TimeSession[]>("timeSessions", [])
  const [activeSession, setActiveSession] = useState<TimeSession | null>(null)
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const availableTasks = tasks.filter((task) => !task.completada)

  const startSession = () => {
    if (!selectedTask) return

    const task = tasks.find((t) => t.id === selectedTask)
    if (!task) return

    const now = new Date()
    const newSession: TimeSession = {
      id: Date.now().toString(),
      taskId: selectedTask,
      projectId: task.proyectoId,
      startTime: now.toISOString(),
      duration: 0,
      type: "manual",
    }

    setActiveSession(newSession)
    setStartTime(now)
    setIsRunning(true)
  }

  const pauseSession = () => {
    setIsRunning(false)
  }

  const resumeSession = () => {
    setIsRunning(true)
  }

  const stopSession = () => {
    if (!activeSession || !startTime) return

    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    const completedSession: TimeSession = {
      ...activeSession,
      endTime: endTime.toISOString(),
      duration,
    }

    setSessions((prev) => [...prev, completedSession])
    setActiveSession(null)
    setStartTime(null)
    setIsRunning(false)

    if (onSessionComplete) {
      onSessionComplete(completedSession)
    }
  }

  const getCurrentDuration = () => {
    if (!startTime || !isRunning) return 0
    return Math.round((new Date().getTime() - startTime.getTime()) / (1000 * 60))
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getTaskSessions = (taskId: string) => {
    return sessions.filter((session) => session.taskId === taskId)
  }

  const getTotalTimeForTask = (taskId: string) => {
    return getTaskSessions(taskId).reduce((total, session) => total + session.duration, 0)
  }

  return (
    <div className="space-y-6">
      {/* Active Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Seguimiento Manual de Tiempo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeSession ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Seleccionar Tarea</label>
                <Select value={selectedTask} onValueChange={setSelectedTask}>
                  <SelectTrigger>
                    <SelectValue placeholder="Elegir tarea para rastrear tiempo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((task) => {
                      const project = projects.find((p) => p.id === task.proyectoId)
                      return (
                        <SelectItem key={task.id} value={task.id}>
                          <div>
                            <div className="font-medium">{task.titulo}</div>
                            {project && <div className="text-xs text-muted-foreground">{project.nombre}</div>}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={startSession} disabled={!selectedTask} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Iniciar Seguimiento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{tasks.find((t) => t.id === activeSession.taskId)?.titulo}</h3>
                  <Badge variant="secondary">En progreso</Badge>
                </div>
                <div className="text-2xl font-mono font-bold text-accent">{formatDuration(getCurrentDuration())}</div>
                <p className="text-sm text-muted-foreground">
                  Iniciado: {new Date(activeSession.startTime).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex gap-2">
                {isRunning ? (
                  <Button onClick={pauseSession} variant="outline" className="flex-1 bg-transparent">
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button onClick={resumeSession} className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    Reanudar
                  </Button>
                )}
                <Button onClick={stopSession} variant="destructive">
                  <Square className="w-4 h-4 mr-2" />
                  Detener
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Time Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Resumen de Tiempo por Tarea
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableTasks.slice(0, 5).map((task) => {
              const totalTime = getTotalTimeForTask(task.id)
              const sessionsCount = getTaskSessions(task.id).length
              const project = projects.find((p) => p.id === task.proyectoId)

              return (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{task.titulo}</h4>
                    {project && <p className="text-xs text-muted-foreground">{project.nombre}</p>}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatDuration(totalTime)}</div>
                    <div className="text-xs text-muted-foreground">{sessionsCount} sesiones</div>
                  </div>
                </div>
              )
            })}

            {availableTasks.length === 0 && (
              <div className="text-center py-4">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay tareas disponibles</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
