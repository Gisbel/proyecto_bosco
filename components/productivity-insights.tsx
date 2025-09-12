"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Award, AlertTriangle, Lightbulb } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Task {
  id: string
  titulo: string
  fechaAsignada: string
  completada: boolean
  pomodoros: number
  tiempoTotal: number
  prioridad: "alta" | "media" | "baja"
}

interface TimeSession {
  id: string
  startTime: string
  duration: number
  type: "pomodoro" | "manual" | "break"
}

interface ProductivityInsightsProps {
  className?: string
}

export function ProductivityInsights({ className }: ProductivityInsightsProps) {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])
  const [sessions] = useLocalStorage<TimeSession[]>("timeSessions", [])

  // Calculate weekly trends
  const getWeeklyData = (weeksAgo: number) => {
    const now = new Date()
    const weekStart = new Date(now.getTime() - (weeksAgo + 1) * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(now.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000)

    const weekTasks = tasks.filter((task) => {
      const taskDate = new Date(task.fechaAsignada)
      return taskDate >= weekStart && taskDate < weekEnd
    })

    const weekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
      return sessionDate >= weekStart && sessionDate < weekEnd
    })

    return {
      tasks: weekTasks.length,
      completedTasks: weekTasks.filter((task) => task.completada).length,
      time: weekSessions.reduce((sum, session) => sum + session.duration, 0),
      pomodoros: weekSessions.filter((session) => session.type === "pomodoro").length,
    }
  }

  const thisWeek = getWeeklyData(0)
  const lastWeek = getWeeklyData(1)

  // Calculate trends
  const taskTrend = thisWeek.tasks - lastWeek.tasks
  const completionTrend = thisWeek.completedTasks - lastWeek.completedTasks
  const timeTrend = thisWeek.time - lastWeek.time
  const pomodoroTrend = thisWeek.pomodoros - lastWeek.pomodoros

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600"
    if (trend < 0) return "text-red-600"
    return "text-gray-600"
  }

  // Generate insights
  const insights = []

  if (completionTrend > 0) {
    insights.push({
      type: "success",
      icon: <Award className="w-4 h-4" />,
      title: "¡Mejorando!",
      message: `Has completado ${completionTrend} tareas más que la semana pasada.`,
    })
  }

  if (timeTrend > 60) {
    insights.push({
      type: "info",
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Más tiempo invertido",
      message: `Has trabajado ${Math.round(timeTrend / 60)} horas más esta semana.`,
    })
  }

  if (pomodoroTrend < -5) {
    insights.push({
      type: "warning",
      icon: <AlertTriangle className="w-4 h-4" />,
      title: "Menos pomodoros",
      message: "Considera usar más la técnica Pomodoro para mantener el enfoque.",
    })
  }

  const completionRate = thisWeek.tasks > 0 ? (thisWeek.completedTasks / thisWeek.tasks) * 100 : 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Insights de Productividad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Weekly Comparison */}
        <div>
          <h4 className="font-semibold mb-3">Comparación Semanal</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tareas</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(taskTrend)}
                <span className={getTrendColor(taskTrend)}>{Math.abs(taskTrend)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Completadas</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(completionTrend)}
                <span className={getTrendColor(completionTrend)}>{Math.abs(completionTrend)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tiempo</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(timeTrend)}
                <span className={getTrendColor(timeTrend)}>{Math.abs(Math.round(timeTrend / 60))}h</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pomodoros</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(pomodoroTrend)}
                <span className={getTrendColor(pomodoroTrend)}>{Math.abs(pomodoroTrend)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Tasa de Completado</span>
            <span className="text-sm font-semibold">{Math.round(completionRate)}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                insight.type === "success"
                  ? "bg-green-50 border-green-200"
                  : insight.type === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={
                    insight.type === "success"
                      ? "text-green-600"
                      : insight.type === "warning"
                        ? "text-yellow-600"
                        : "text-blue-600"
                  }
                >
                  {insight.icon}
                </div>
                <div>
                  <h5
                    className={`font-semibold text-sm ${
                      insight.type === "success"
                        ? "text-green-800"
                        : insight.type === "warning"
                          ? "text-yellow-800"
                          : "text-blue-800"
                    }`}
                  >
                    {insight.title}
                  </h5>
                  <p
                    className={`text-xs ${
                      insight.type === "success"
                        ? "text-green-700"
                        : insight.type === "warning"
                          ? "text-yellow-700"
                          : "text-blue-700"
                    }`}
                  >
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {insights.length === 0 && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Sigue trabajando para generar insights</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
