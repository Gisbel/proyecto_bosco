"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, Timer, Target, Award, Activity, Download, Filter } from "lucide-react"
import { NavigationHeader } from "@/components/navigation-header"
import { AuthGuard } from "@/components/auth-guard"
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
  duration: number
  type: "pomodoro" | "manual" | "break"
}

export default function StatisticsPage() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [sessions] = useLocalStorage<TimeSession[]>("timeSessions", [])
  const [dateRange, setDateRange] = useState<string>("month")
  const [selectedProject, setSelectedProject] = useState<string>("all")

  // Date filtering
  const getDateRange = () => {
    const now = new Date()
    switch (dateRange) {
      case "week":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case "month":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case "quarter":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      case "year":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      default:
        return new Date(0)
    }
  }

  const startDate = getDateRange()
  const filteredTasks = tasks.filter((task) => {
    const taskDate = new Date(task.fechaAsignada)
    const projectMatch = selectedProject === "all" || task.proyectoId === selectedProject
    const dateMatch = taskDate >= startDate
    return projectMatch && dateMatch
  })

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = new Date(session.startTime)
    const projectMatch = selectedProject === "all" || session.projectId === selectedProject
    const dateMatch = sessionDate >= startDate
    return projectMatch && dateMatch
  })

  // Calculate statistics
  const totalTasks = filteredTasks.length
  const completedTasks = filteredTasks.filter((task) => task.completada).length
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const totalTime = filteredSessions.reduce((sum, session) => sum + session.duration, 0)
  const totalPomodoros = filteredTasks.reduce((sum, task) => sum + task.pomodoros, 0)
  const averageTaskTime = completedTasks > 0 ? Math.round(totalTime / completedTasks) : 0

  // Priority distribution
  const priorityStats = {
    alta: filteredTasks.filter((task) => task.prioridad === "alta").length,
    media: filteredTasks.filter((task) => task.prioridad === "media").length,
    baja: filteredTasks.filter((task) => task.prioridad === "baja").length,
  }

  // Project performance
  const projectStats = projects
    .map((project) => {
      const projectTasks = filteredTasks.filter((task) => task.proyectoId === project.id)
      const projectSessions = filteredSessions.filter((session) => session.projectId === project.id)
      const completedProjectTasks = projectTasks.filter((task) => task.completada).length
      const projectTime = projectSessions.reduce((sum, session) => sum + session.duration, 0)

      return {
        project,
        totalTasks: projectTasks.length,
        completedTasks: completedProjectTasks,
        completionRate: projectTasks.length > 0 ? (completedProjectTasks / projectTasks.length) * 100 : 0,
        totalTime: projectTime,
        averageTaskTime: completedProjectTasks > 0 ? Math.round(projectTime / completedProjectTasks) : 0,
      }
    })
    .filter((stat) => stat.totalTasks > 0)

  // Daily productivity (last 7 days)
  const dailyStats = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toDateString()

    const dayTasks = tasks.filter((task) => new Date(task.fechaAsignada).toDateString() === dateStr)
    const daySessions = sessions.filter((session) => new Date(session.startTime).toDateString() === dateStr)

    return {
      date: date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
      tasks: dayTasks.length,
      completedTasks: dayTasks.filter((task) => task.completada).length,
      time: daySessions.reduce((sum, session) => sum + session.duration, 0),
      pomodoros: daySessions.filter((session) => session.type === "pomodoro").length,
    }
  }).reverse()

  // Most productive day
  const mostProductiveDay = dailyStats.reduce(
    (max, day) => (day.time > max.time ? day : max),
    dailyStats[0] || { date: "", time: 0 },
  )

  // Task completion trends
  const overdueTasks = filteredTasks.filter(
    (task) => new Date(task.fechaAsignada) < new Date() && !task.completada,
  ).length

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const exportReport = () => {
    const reportData = {
      period: dateRange,
      project:
        selectedProject === "all" ? "Todos los proyectos" : projects.find((p) => p.id === selectedProject)?.nombre,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate),
        totalTime: formatTime(totalTime),
        totalPomodoros,
        averageTaskTime: formatTime(averageTaskTime),
        overdueTasks,
      },
      projectStats,
      dailyStats,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `productivity-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-primary">Estadísticas y Reportes</h1>
                <p className="text-muted-foreground">Analiza tu productividad y rendimiento</p>
              </div>
              <Button onClick={exportReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar Reporte
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros de Análisis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Período de Tiempo</label>
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mes</SelectItem>
                        <SelectItem value="quarter">Último trimestre</SelectItem>
                        <SelectItem value="year">Último año</SelectItem>
                        <SelectItem value="all">Todo el tiempo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Proyecto</label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los proyectos</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tasa de Completado</p>
                      <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
                      <Progress value={completionRate} className="mt-1 h-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo Total</p>
                      <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
                      <p className="text-xs text-muted-foreground">{totalPomodoros} pomodoros</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                      <p className="text-2xl font-bold">{formatTime(averageTaskTime)}</p>
                      <p className="text-xs text-muted-foreground">por tarea</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm text-muted-foreground">Día Más Productivo</p>
                      <p className="text-lg font-bold">{mostProductiveDay.date}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(mostProductiveDay.time)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Distribución por Prioridad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Alta Prioridad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{priorityStats.alta}</span>
                        <div className="w-20">
                          <Progress value={(priorityStats.alta / Math.max(totalTasks, 1)) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm">Media Prioridad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{priorityStats.media}</span>
                        <div className="w-20">
                          <Progress value={(priorityStats.media / Math.max(totalTasks, 1)) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Baja Prioridad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{priorityStats.baja}</span>
                        <div className="w-20">
                          <Progress value={(priorityStats.baja / Math.max(totalTasks, 1)) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Daily Productivity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Productividad Diaria (7 días)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dailyStats.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium w-12">{day.date}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {day.completedTasks}/{day.tasks}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{day.pomodoros}🍅</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatTime(day.time)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Performance */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Rendimiento por Proyecto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectStats.map((stat) => (
                      <div key={stat.project.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{stat.project.nombre}</h4>
                            <p className="text-sm text-muted-foreground">{stat.project.cliente}</p>
                          </div>
                          <Badge
                            variant={
                              stat.completionRate >= 80
                                ? "default"
                                : stat.completionRate >= 50
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {Math.round(stat.completionRate)}% completado
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Tareas:</span>
                            <div className="font-semibold">
                              {stat.completedTasks}/{stat.totalTasks}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Tiempo total:</span>
                            <div className="font-semibold">{formatTime(stat.totalTime)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Promedio/tarea:</span>
                            <div className="font-semibold">{formatTime(stat.averageTaskTime)}</div>
                          </div>
                          <div>
                            <Progress value={stat.completionRate} className="mt-2" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {projectStats.length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay datos</h3>
                        <p className="text-muted-foreground">
                          No hay estadísticas disponibles para el período seleccionado
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Insights and Recommendations */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Insights y Recomendaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completionRate >= 80 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-1">¡Excelente rendimiento!</h4>
                        <p className="text-sm text-green-700">
                          Tienes una tasa de completado del {Math.round(completionRate)}%. Mantén este ritmo.
                        </p>
                      </div>
                    )}

                    {overdueTasks > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-1">Tareas vencidas</h4>
                        <p className="text-sm text-yellow-700">
                          Tienes {overdueTasks} tareas vencidas. Considera reprogramarlas o dividirlas en tareas más
                          pequeñas.
                        </p>
                      </div>
                    )}

                    {averageTaskTime > 120 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-1">Optimización de tiempo</h4>
                        <p className="text-sm text-blue-700">
                          Tu tiempo promedio por tarea es de {formatTime(averageTaskTime)}. Considera dividir tareas
                          grandes en subtareas más manejables.
                        </p>
                      </div>
                    )}

                    {totalPomodoros < 10 && dateRange === "week" && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-1">Usa más la técnica Pomodoro</h4>
                        <p className="text-sm text-purple-700">
                          Solo has completado {totalPomodoros} pomodoros esta semana. La técnica Pomodoro puede ayudarte
                          a mantener el enfoque.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
