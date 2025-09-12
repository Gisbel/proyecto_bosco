"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Calendar, CheckCircle2, Timer, Target } from "lucide-react"
import { TaskCard } from "@/components/task-card"
import { TaskForm } from "@/components/task-form"
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
  estimatedPomodoros?: number
  tags?: string[]
}

export default function TasksPage() {
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterProject, setFilterProject] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        task.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesProject = filterProject === "all" || task.proyectoId === filterProject
      const matchesStatus = filterStatus === "all" || task.estado === filterStatus
      const matchesPriority = filterPriority === "all" || task.prioridad === filterPriority
      return matchesSearch && matchesProject && matchesStatus && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { alta: 3, media: 2, baja: 1 }
          return priorityOrder[b.prioridad] - priorityOrder[a.prioridad]
        case "date":
          return new Date(a.fechaAsignada).getTime() - new Date(b.fechaAsignada).getTime()
        case "progress":
          const aProgress = a.estimatedPomodoros ? a.pomodoros / a.estimatedPomodoros : 0
          const bProgress = b.estimatedPomodoros ? b.pomodoros / b.estimatedPomodoros : 0
          return bProgress - aProgress
        default:
          return 0
      }
    })

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      pomodoros: 0,
      tiempoTotal: 0,
      completada: false,
      estado: "pendiente" as const,
    }
    setTasks((prev) => [...prev, newTask])
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
      const updatedTasks = tasks.filter((t) => t.id !== taskId)
      setTasks(updatedTasks)
    }
  }

  const handleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completada: !task.completada,
              estado: task.completada ? "pendiente" : "completada",
            }
          : task,
      ),
    )
  }

  // Calculate stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completada).length
  const overdueTasks = tasks.filter((task) => new Date(task.fechaAsignada) < new Date() && !task.completada).length
  const totalPomodoros = tasks.reduce((sum, task) => sum + task.pomodoros, 0)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Todas las Tareas</h1>
            <p className="text-muted-foreground">Gestiona y organiza todas tus tareas</p>
          </div>
          <Button onClick={() => setShowTaskForm(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tareas</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completadas</p>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Vencidas</p>
                  <p className="text-2xl font-bold">{overdueTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Pomodoros</p>
                  <p className="text-2xl font-bold">{totalPomodoros}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros y Búsqueda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects
                    .filter((p) => p.activo)
                    .map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en-progreso">En Progreso</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Fecha</SelectItem>
                  <SelectItem value="priority">Prioridad</SelectItem>
                  <SelectItem value="progress">Progreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              project={projects.find((p) => p.id === task.proyectoId)}
              onComplete={handleTaskComplete}
              onPomodoroStart={() => {}} // Placeholder for now
              onEdit={setEditingTask}
              onDelete={handleDeleteTask}
              isActive={false}
            />
          ))}

          {filteredTasks.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchTerm || filterProject !== "all" || filterStatus !== "all" || filterPriority !== "all"
                  ? "No se encontraron tareas"
                  : "No hay tareas"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterProject !== "all" || filterStatus !== "all" || filterPriority !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Comienza creando tu primera tarea"}
              </p>
              {!searchTerm && filterProject === "all" && filterStatus === "all" && filterPriority === "all" && (
                <Button onClick={() => setShowTaskForm(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Tarea
                </Button>
              )}
            </div>
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
    </div>
  )
}
