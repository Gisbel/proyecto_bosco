"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Calendar, Clock, Flag } from "lucide-react"

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

interface TaskFormData {
  titulo: string
  descripcion: string
  proyectoId: string
  fechaAsignada: string
  prioridad: "alta" | "media" | "baja"
  estimatedPomodoros?: number
  tags?: string[]
}

interface TaskFormProps {
  projects: Project[]
  task?: Task
  onSubmit: (taskData: TaskFormData) => void
  onClose: () => void
}

const priorityColors = {
  alta: "bg-destructive text-destructive-foreground",
  media: "bg-yellow-500 text-white",
  baja: "bg-green-500 text-white",
}

const priorityLabels = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
}

export function TaskForm({ projects, task, onSubmit, onClose }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    titulo: task?.titulo || "",
    descripcion: task?.descripcion || "",
    proyectoId: task?.proyectoId || (projects.length === 1 ? projects[0].id : ""),
    fechaAsignada: task?.fechaAsignada || new Date().toISOString().split("T")[0],
    prioridad: task?.prioridad || "media",
    estimatedPomodoros: task?.estimatedPomodoros || 1,
    tags: task?.tags || [],
  })

  const [newTag, setNewTag] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.titulo.trim()) {
      onSubmit(formData)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }))
  }

  const activeProjects = projects.filter((p) => p.activo)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{task ? "Editar Tarea" : "Nueva Tarea"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
                placeholder="Nombre de la tarea"
                required
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Detalles de la tarea"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="proyecto">Proyecto</Label>
                <Select
                  value={formData.proyectoId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, proyectoId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioridad" className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Prioridad
                </Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value: "alta" | "media" | "baja") =>
                    setFormData((prev) => ({ ...prev, prioridad: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baja">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Baja
                      </div>
                    </SelectItem>
                    <SelectItem value="media">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Media
                      </div>
                    </SelectItem>
                    <SelectItem value="alta">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Alta
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Fecha Asignada
                </Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fechaAsignada}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fechaAsignada: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="estimatedPomodoros" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pomodoros Estimados
                </Label>
                <Input
                  id="estimatedPomodoros"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.estimatedPomodoros || 1}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, estimatedPomodoros: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>

            <div>
              <Label>Etiquetas</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Agregar etiqueta"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline" size="sm">
                  Agregar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                {task ? "Actualizar Tarea" : "Crear Tarea"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
