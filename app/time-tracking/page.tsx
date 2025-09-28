"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Timer, BarChart3, Filter, Download, Trash2 } from "lucide-react"
import { TimeTracker } from "@/components/time-tracker"
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
  description?: string
}

export default function TimeTrackingPage() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [sessions, setSessions] = useLocalStorage<TimeSession[]>("timeSessions", [])
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterTask, setFilterTask] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("week")

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesProject = filterProject === "all" || session.projectId === filterProject
    const matchesTask = filterTask === "all" || session.taskId === filterTask
    const matchesType = filterType === "all" || session.type === filterType

    // Date filtering
    const sessionDate = new Date(session.startTime)
    const now = new Date()
    let matchesDate = true

    switch (dateRange) {
      case "today":
        matchesDate = sessionDate.toDateString() === now.toDateString()
        break
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchesDate = sessionDate >= weekAgo
        break
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchesDate = sessionDate >= monthAgo
        break
    }

    return matchesProject && matchesTask && matchesType && matchesDate
  })

  // Calculate statistics
  const totalTime = filteredSessions.reduce((sum, session) => sum + session.duration, 0)
  const totalSessions = filteredSessions.length
  const averageSession = totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0

  // Group sessions by project
  const projectStats = projects
    .map((project) => {
      const projectSessions = filteredSessions.filter((session) => session.projectId === project.id)
      const projectTime = projectSessions.reduce((sum, session) => sum + session.duration, 0)
      return {
        project,
        time: projectTime,
        sessions: projectSessions.length,
      }
    })
    .filter((stat) => stat.time > 0)

  // Group sessions by task
  const taskStats = tasks
    .map((task) => {
      const taskSessions = filteredSessions.filter((session) => session.taskId === task.id)
      const taskTime = taskSessions.reduce((sum, session) => sum + session.duration, 0)
      return {
        task,
        time: taskTime,
        sessions: taskSessions.length,
      }
    })
    .filter((stat) => stat.time > 0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("es-ES"),
      time: date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Fecha", "Hora Inicio", "Hora Fin", "Duración (min)", "Tarea", "Proyecto", "Tipo"].join(","),
      ...filteredSessions.map((session) => {
        const task = tasks.find((t) => t.id === session.taskId)
        const project = projects.find((p) => p.id === session.projectId)
        const start = formatDateTime(session.startTime)
        const end = session.endTime ? formatDateTime(session.endTime) : { date: "", time: "" }

        return [
          start.date,
          start.time,
          end.time,
          session.duration.toString(),
          task?.titulo || "Tarea eliminada",
          project?.nombre || "Proyecto eliminado",
          session.type,
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `time-tracking-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteSession = (sessionId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta sesión?")) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    }
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
                <h1 className="text-3xl font-bold text-primary">Seguimiento de Tiempo</h1>
                <p className="text-muted-foreground">Analiza tu productividad y gestiona tu tiempo</p>
              </div>
              <Button onClick={exportData} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Time Tracker */}
              <div className="lg:col-span-1">
                <TimeTracker
                  tasks={tasks}
                  projects={projects}
                  onSessionComplete={(session) => setSessions((prev) => [...prev, session])}
                />
              </div>

              {/* Analytics */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tiempo Total</p>
                          <p className="text-2xl font-bold">{formatDuration(totalTime)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Timer className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm text-muted-foreground">Sesiones</p>
                          <p className="text-2xl font-bold">{totalSessions}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-sm text-muted-foreground">Promedio</p>
                          <p className="text-2xl font-bold">{formatDuration(averageSession)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="w-5 h-5" />
                      Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="week">Esta semana</SelectItem>
                          <SelectItem value="month">Este mes</SelectItem>
                          <SelectItem value="all">Todo el tiempo</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Proyecto" />
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

                      <Select value={filterTask} onValueChange={setFilterTask}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tarea" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las tareas</SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.titulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los tipos</SelectItem>
                          <SelectItem value="pomodoro">Pomodoro</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="break">Descanso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Project Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tiempo por Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {projectStats.map((stat) => (
                        <div key={stat.project.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{stat.project.nombre}</h4>
                            <p className="text-sm text-muted-foreground">{stat.project.cliente}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{formatDuration(stat.time)}</div>
                            <div className="text-sm text-muted-foreground">{stat.sessions} sesiones</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sesiones Recientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredSessions.slice(0, 10).map((session) => {
                        const task = tasks.find((t) => t.id === session.taskId)
                        const project = projects.find((p) => p.id === session.projectId)
                        const start = formatDateTime(session.startTime)

                        return (
                          <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{task?.titulo || "Tarea eliminada"}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {session.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {project?.nombre || "Proyecto eliminado"} • {start.date} {start.time}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{formatDuration(session.duration)}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSession(session.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )
                      })}

                      {filteredSessions.length === 0 && (
                        <div className="text-center py-8">
                          <Timer className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay sesiones</h3>
                          <p className="text-muted-foreground">
                            Comienza a rastrear tu tiempo para ver estadísticas aquí
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
      </div>
    </AuthGuard>
  )
}
