"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FolderOpen,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Calendar,
  User,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { NavigationHeader } from "@/components/navigation-header"
import { AuthGuard } from "@/components/auth-guard"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { TaskForm } from "@/components/task-form"
import { TaskCard } from "@/components/task-card"
import { ProjectForm } from "@/components/project-form"

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
  estimatedPomodoros?: number
  tags?: string[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [])
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const project = projects.find((p) => p.id === projectId)
  const projectTasks = tasks.filter((task) => task.proyectoId === projectId)

  useEffect(() => {
    if (!project) {
      router.push("/projects")
    }
  }, [project, router])

  if (!project) {
    return null
  }

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      estado: "pendiente" as const,
      pomodoros: 0,
      tiempoTotal: 0,
      completada: false,
    }
    setTasks([...tasks, newTask])
    setShowTaskForm(false)
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
      setTasks(tasks.filter((t) => t.id !== taskId))
    }
  }

  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map((t) =>
      t.id === taskId
        ? {
            ...t,
            completada: !t.completada,
            estado: !t.completada ? ("completada" as const) : ("pendiente" as const),
          }
        : t,
    )
    setTasks(updatedTasks)
  }

  const handleEditProject = (projectData: any) => {
    const updatedProjects = projects.map((p) => (p.id === projectId ? { ...p, ...projectData } : p))
    setProjects(updatedProjects)
    setShowProjectForm(false)
  }

  const handleDeleteProject = () => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto y todas sus tareas?")) {
      setProjects(projects.filter((p) => p.id !== projectId))
      setTasks(tasks.filter((t) => t.proyectoId !== projectId))
      router.push("/projects")
    }
  }

  const handleArchiveProject = () => {
    const updatedProjects = projects.map((p) => (p.id === projectId ? { ...p, activo: !p.activo } : p))
    setProjects(updatedProjects)
  }

  const handlePomodoroStart = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      localStorage.setItem("pomodoroAutoStart", JSON.stringify({ taskId: task.id, taskName: task.titulo }))
      router.push("/timer")
    }
  }

  // Calculate project stats
  const completedTasks = projectTasks.filter((task) => task.completada).length
  const totalPomodoros = projectTasks.reduce((sum, task) => sum + task.pomodoros, 0)
  const totalTime = projectTasks.reduce((sum, task) => sum + task.tiempoTotal, 0)
  const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0
  const isOverdue = project.fechaLimite && new Date(project.fechaLimite) < new Date()

  // Group tasks by status
  const pendingTasks = projectTasks.filter((t) => !t.completada)
  const completedTasksList = projectTasks.filter((t) => t.completada)

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => router.push("/projects")} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Proyectos
            </Button>

            {/* Project Header */}
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <FolderOpen className="w-8 h-8 text-accent mt-1" />
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">{project.nombre}</h1>
                      {project.cliente && (
                        <p className="text-muted-foreground flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          {project.cliente}
                        </p>
                      )}
                      {project.descripcion && <p className="text-muted-foreground">{project.descripcion}</p>}

                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant={project.activo ? "default" : "secondary"}>
                          {project.activo ? "Activo" : "Archivado"}
                        </Badge>
                        {isOverdue && project.activo && <Badge variant="destructive">Vencido</Badge>}
                        {project.fechaLimite && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(project.fechaLimite).toLocaleDateString("es-ES")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowProjectForm(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Proyecto
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleArchiveProject}>
                        <Archive className="w-4 h-4 mr-2" />
                        {project.activo ? "Archivar" : "Activar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeleteProject} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Proyecto
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                {/* Project Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Total Tareas</div>
                    <div className="text-2xl font-bold">{projectTasks.length}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Completadas</div>
                    <div className="text-2xl font-bold text-accent">{completedTasks}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Pomodoros</div>
                    <div className="text-2xl font-bold">{totalPomodoros}</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-1">Tiempo Total</div>
                    <div className="text-2xl font-bold">
                      {Math.floor(totalTime / 60)}h {totalTime % 60}m
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progreso del Proyecto</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Tasks Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Tareas del Proyecto</h2>
              <Button
                onClick={() => setShowTaskForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </div>

            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Pendientes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onToggleComplete={() => handleToggleComplete(task.id)}
                      onPomodoroStart={() => handlePomodoroStart(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasksList.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-muted-foreground">Completadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasksList.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditingTask(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onToggleComplete={() => handleToggleComplete(task.id)}
                      onPomodoroStart={() => handlePomodoroStart(task.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {projectTasks.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">No hay tareas en este proyecto</h3>
                  <p className="text-muted-foreground mb-4">Comienza agregando tu primera tarea</p>
                  <Button onClick={() => setShowTaskForm(true)} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Tarea
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Task Forms */}
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

        {/* Project Form */}
        {showProjectForm && (
          <ProjectForm project={project} onSubmit={handleEditProject} onClose={() => setShowProjectForm(false)} />
        )}
      </div>
    </AuthGuard>
  )
}
