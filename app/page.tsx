"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Plus, Filter, CheckCircle2, Timer, BarChart3 } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { ProjectSidebar } from "@/components/project-sidebar"
import { TaskForm } from "@/components/task-form"
import { NavigationHeader } from "@/components/navigation-header"
import { AuthGuard } from "@/components/auth-guard"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Project {
  id: string
  nombre: string
  descripcion: string
  fechaLimite: string
  cliente: string
  activo: boolean
}

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

interface PomodoroSession {
  id: string
  tareaId: string
  fechaInicio: string
  fechaFin: string
  duracion: number
  tipo: "trabajo" | "descanso"
}

export default function Dashboard() {
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [])
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [sessions, setSessions] = useLocalStorage<PomodoroSession[]>("sessions", [])
  const [selectedProject, setSelectedProject] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [activeTask, setActiveTask] = useState<string | null>(null)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0]

  // Filter tasks for today
  const todayTasks = tasks.filter((task) => task.fechaAsignada === today)

  // Apply filters
  const filteredTasks = todayTasks.filter((task) => {
    const projectMatch = selectedProject === "all" || task.proyectoId === selectedProject
    const statusMatch = filterStatus === "all" || task.estado === filterStatus
    return projectMatch && statusMatch
  })

  // Calculate daily stats
  const completedTasks = todayTasks.filter((task) => task.completada).length
  const totalPomodoros = todayTasks.reduce((sum, task) => sum + task.pomodoros, 0)
  const totalTime = todayTasks.reduce((sum, task) => sum + task.tiempoTotal, 0)

  const handleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, completada: !task.completada, estado: task.completada ? "pendiente" : "completada" }
          : task,
      ),
    )
  }

  const handlePomodoroComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, pomodoros: task.pomodoros + 1, tiempoTotal: task.tiempoTotal + 25 } : task,
      ),
    )

    // Add session record
    const newSession: PomodoroSession = {
      id: Date.now().toString(),
      tareaId: taskId,
      fechaInicio: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      fechaFin: new Date().toISOString(),
      duracion: 25,
      tipo: "trabajo",
    }
    setSessions((prev) => [...prev, newSession])
  }

  const handleEditTask = (taskData: any) => {
    if (editingTask) {
      const updatedTasks = tasks.map((t) => (t.id === editingTask.id ? { ...editingTask, ...taskData } : t))
      setTasks(updatedTasks)
      setEditingTask(null)
    }
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      const updatedTasks = tasks.filter((t) => t.id !== taskId)
      setTasks(updatedTasks)
    }
  }

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      pomodoros: 0,
      tiempoTotal: 0,
      completada: false,
      estado: "pendiente",
    }
    setTasks((prev) => [...prev, newTask])
    setShowTaskForm(false)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar */}
          <ProjectSidebar
            projects={projects}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            onProjectsChange={setProjects}
          />

          {/* Main Content */}
          <div className="flex-1 p-4 md:p-6 lg:ml-0">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-primary">Dashboard</h1>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {new Date().toLocaleDateString("es-ES", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Tarea
                </Button>
              </div>

              {/* Daily Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-muted-foreground">Tareas Completadas</p>
                        <p className="text-xl md:text-2xl font-bold">
                          {completedTasks}/{todayTasks.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-muted-foreground">Pomodoros</p>
                        <p className="text-xl md:text-2xl font-bold">{totalPomodoros}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm text-muted-foreground">Tiempo Total</p>
                        <p className="text-xl md:text-2xl font-bold">
                          {Math.floor(totalTime / 60)}h {totalTime % 60}m
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-accent shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm text-muted-foreground">Productividad</p>
                        <Progress value={(completedTasks / Math.max(todayTasks.length, 1)) * 100} className="mt-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 sm:flex-none px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                >
                  <option value="all">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="en-progreso">En Progreso</option>
                  <option value="completada">Completada</option>
                </select>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={projects.find((p) => p.id === task.proyectoId)}
                  onComplete={handleTaskComplete}
                  onPomodoroStart={setActiveTask}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  isActive={activeTask === task.id}
                />
              ))}

              {filteredTasks.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay tareas para hoy</h3>
                  <p className="text-muted-foreground mb-4">Comienza agregando una nueva tarea para organizar tu día</p>
                  <Button onClick={() => setShowTaskForm(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Tarea
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pomodoro Timer Sidebar */}
          <div className="hidden xl:block w-80 border-l border-border bg-card">
            <PomodoroTimer
              activeTask={activeTask ? tasks.find((t) => t.id === activeTask) : null}
              onComplete={handlePomodoroComplete}
              onStop={() => setActiveTask(null)}
            />
          </div>
        </div>

        {/* Task Form Modals */}
        {showTaskForm && (
          <TaskForm projects={projects} onSubmit={handleCreateTask} onClose={() => setShowTaskForm(false)} />
        )}

        {editingTask && (
          <TaskForm
            projects={projects}
            task={editingTask}
            onSubmit={handleEditTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </AuthGuard>
  )
}
