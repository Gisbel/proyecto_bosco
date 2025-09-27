"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FolderOpen,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Archive,
  Timer,
  User,
} from "lucide-react"
import { ProjectForm } from "./project-form"
import Link from "next/link"

interface Project {
  id: string
  nombre: string
  descripcion: string
  fechaLimite: string
  cliente: string
  activo: boolean
}

interface ProjectSidebarProps {
  projects: Project[]
  selectedProject: string
  onProjectSelect: (projectId: string) => void
  onProjectsChange: (projects: Project[]) => void
}

export function ProjectSidebar({ projects, selectedProject, onProjectSelect, onProjectsChange }: ProjectSidebarProps) {
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const activeProjects = projects.filter((p) => p.activo)

  const handleCreateProject = (projectData: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
    }
    onProjectsChange([...projects, newProject])
    setShowProjectForm(false)
  }

  const handleEditProject = (projectData: any) => {
    if (editingProject) {
      const updatedProjects = projects.map((p) =>
        p.id === editingProject.id ? { ...editingProject, ...projectData } : p,
      )
      onProjectsChange(updatedProjects)
      setEditingProject(null)
    }
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      const updatedProjects = projects.filter((p) => p.id !== projectId)
      onProjectsChange(updatedProjects)
      if (selectedProject === projectId) {
        onProjectSelect("all")
      }
    }
  }

  const handleArchiveProject = (projectId: string) => {
    const updatedProjects = projects.map((p) => (p.id === projectId ? { ...p, activo: !p.activo } : p))
    onProjectsChange(updatedProjects)
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-4">TaskFlow</h2>

        {/* Navigation */}
        <nav className="space-y-2">
          <Button
            variant={selectedProject === "all" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onProjectSelect("all")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Todas las Tareas
          </Button>

          <Link href="/projects">
            <Button variant="ghost" className="w-full justify-start">
              <FolderOpen className="w-4 h-4 mr-2" />
              Proyectos
            </Button>
          </Link>

          <Link href="/tasks">
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Gestión de Tareas
            </Button>
          </Link>

          <Link href="/timer">
            <Button variant="ghost" className="w-full justify-start">
              <Timer className="w-4 h-4 mr-2" />
              Timer Pomodoro
            </Button>
          </Link>

          <Link href="/time-tracking">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Seguimiento de Tiempo
            </Button>
          </Link>

          <Link href="/statistics">
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Estadísticas
            </Button>
          </Link>

          <Link href="/profile">
            <Button variant="ghost" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Mi Perfil
            </Button>
          </Link>

          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </Button>
        </nav>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-sidebar-foreground">Proyectos</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowProjectForm(true)}>
            <Plus className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {activeProjects.map((project) => (
            <div key={project.id} className="group relative">
              <Button
                variant={selectedProject === project.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left pr-8"
                onClick={() => onProjectSelect(project.id)}
              >
                <FolderOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm">{project.nombre}</div>
                  {project.cliente && <div className="truncate text-xs text-muted-foreground">{project.cliente}</div>}
                </div>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingProject(project)}>
                    <Edit className="w-3 h-3 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleArchiveProject(project.id)}>
                    <Archive className="w-3 h-3 mr-2" />
                    {project.activo ? "Archivar" : "Activar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteProject(project.id)} className="text-destructive">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {activeProjects.length === 0 && (
            <div className="text-center py-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground mb-2">No hay proyectos</p>
              <Button size="sm" variant="outline" onClick={() => setShowProjectForm(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Crear Proyecto
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Resumen</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proyectos activos:</span>
              <span className="font-semibold">{activeProjects.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total proyectos:</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Forms */}
      {showProjectForm && <ProjectForm onSubmit={handleCreateProject} onClose={() => setShowProjectForm(false)} />}

      {editingProject && (
        <ProjectForm project={editingProject} onSubmit={handleEditProject} onClose={() => setEditingProject(null)} />
      )}
    </div>
  )
}
