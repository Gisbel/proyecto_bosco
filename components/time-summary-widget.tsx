"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Timer, Target, TrendingUp } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface TimeSession {
  id: string
  taskId: string
  projectId: string
  startTime: string
  endTime?: string
  duration: number
  type: "pomodoro" | "manual" | "break"
}

interface Task {
  id: string
  titulo: string
  pomodoros: number
  tiempoTotal: number
  estimatedPomodoros?: number
}

interface TimeSummaryWidgetProps {
  className?: string
}

export function TimeSummaryWidget({ className }: TimeSummaryWidgetProps) {
  const [sessions] = useLocalStorage<TimeSession[]>("timeSessions", [])
  const [tasks] = useLocalStorage<Task[]>("tasks", [])

  // Get today's sessions
  const today = new Date().toDateString()
  const todaySessions = sessions.filter((session) => new Date(session.startTime).toDateString() === today)

  // Calculate stats
  const todayTime = todaySessions.reduce((sum, session) => sum + session.duration, 0)
  const todayPomodoros = todaySessions.filter((session) => session.type === "pomodoro").length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completada).length

  // Weekly goal (example: 40 hours)
  const weeklyGoal = 40 * 60 // 40 hours in minutes
  const thisWeek = new Date()
  const weekStart = new Date(thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()))
  const weekSessions = sessions.filter((session) => new Date(session.startTime) >= weekStart)
  const weekTime = weekSessions.reduce((sum, session) => sum + session.duration, 0)
  const weekProgress = (weekTime / weeklyGoal) * 100

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Resumen de Tiempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Timer className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Hoy</span>
            </div>
            <div className="text-xl font-bold">{formatTime(todayTime)}</div>
            <div className="text-xs text-muted-foreground">{todayPomodoros} pomodoros</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm text-muted-foreground">Tareas</span>
            </div>
            <div className="text-xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <div className="text-xs text-muted-foreground">completadas</div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Progreso Semanal
            </span>
            <span className="text-sm font-medium">{Math.round(weekProgress)}%</span>
          </div>
          <Progress value={weekProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(weekTime)}</span>
            <span>{formatTime(weeklyGoal)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
