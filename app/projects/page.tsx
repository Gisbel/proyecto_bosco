"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Calendar,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react"
import { ProjectForm } from "@/components/project-form"
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

export default function ProjectsPage() {
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", [])
  const [tasks] = useLocalStorage<Task[]>("tasks", [])
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "archived">("all")

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.cliente.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && project.activo) ||
      (filterStatus === "archived" && !project.activo)
    return matchesSearch && matchesStatus
  })

  const handleCreateProject = (projectData: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
    }
    setProjects([...projects, newProject])
    setShowProjectForm(false)
  }

  const handleEditProject = (projectData: any) => {
    if (editingProject) {
      const updatedProjects = projects.map((p) =>
        p.id === editingProject.id ? { ...editingProject, ...projectData } : p,
      )
      setProjects(updatedProjects)
      setEditingProject(null)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      setProjects(updatedProjects)
    }
  }

  const handleArchiveProject = (projectId: string) => {
    const updatedProjects = projects.map((p) => (p.id === projectId ? { ...p, activo: !p.activo } : p))
    setProjects(updatedProjects)
  }

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((task) => task.proyectoId === projectId)
    const completedTasks = projectTasks.filter((task) => task.completada).length
    const totalPomodoros = projectTasks.reduce((sum, task) => sum + task.pomodoros, 0)
    const totalTime = projectTasks.reduce((sum, task) => sum + task.tiempoTotal, 0)

    return {
      totalTasks: projectTasks.length,
      completedTasks,
      totalPomodoros,
      totalTime,
      progress: projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0,
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Proyectos</h1>
            <p className="text-muted-foreground">Gestiona todos tus proyectos de freelance</p>
          </div>
          <Button
            onClick={() => setShowProjectForm(true)}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
              size="sm"
            >
              Todos
            </Button>
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              onClick={() => setFilterStatus("active")}
              size="sm"
            >
              Activos
            </Button>
            <Button
              variant={filterStatus === "archived" ? "default" : "outline"}
              onClick={() => setFilterStatus("archived")}
              size="sm"
            >
              Archivados
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const stats = getProjectStats(project.id)
            const isOverdue = project.fechaLimite && new Date(project.fechaLimite) < new Date()

            return (
              <Card key={project.id} className={`relative ${!project.activo ? "opacity-75" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <FolderOpen className="w-5 h-5 text-accent mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-foreground">{project.nombre}</h3>
                        {project.cliente && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <User className="w-3 h-3" />
                            {project.cliente}
                          </p>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingProject(project)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                          <Archive className="w-4 h-4 mr-2" />
                          {project.activo ? "Archivar" : "Activar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Badge variant={project.activo ? "default" : "secondary"}>
                      {project.activo ? "Activo" : "Archivado"}
                    </Badge>
                    {isOverdue && project.activo && <Badge variant="destructive">Vencido</Badge>}
                  </div>
                </CardHeader>

                <CardContent>
                  {project.descripcion && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.descripcion}</p>
                  )}

                  {project.fechaLimite && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Vence: {new Date(project.fechaLimite).toLocaleDateString("es-ES")}</span>
                    </div>
                  )}

                  {/* Project Stats */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso</span>
                      <span className="font-semibold">
                        {stats.completedTasks}/{stats.totalTasks} tareas
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.progress}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span className="text-muted-foreground">{stats.totalPomodoros} pomodoros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="text-muted-foreground">
                          {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                {searchTerm ? "No se encontraron proyectos" : "No hay proyectos"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Intenta con otros términos de búsqueda"
                  : "Comienza creando tu primer proyecto para organizar tus tareas"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowProjectForm(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Proyecto
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Project Forms */}
      {showProjectForm && <ProjectForm onSubmit={handleCreateProject} onClose={() => setShowProjectForm(false)} />}

      {editingProject && (
        <ProjectForm project={editingProject} onSubmit={handleEditProject} onClose={() => setEditingProject(null)} />
      )}
    </div>
  )
}
