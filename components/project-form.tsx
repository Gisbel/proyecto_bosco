"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

interface Project {
  id: string
  nombre: string
  descripcion: string
  fechaLimite: string
  cliente: string
  activo: boolean
}

interface ProjectFormData {
  nombre: string
  descripcion: string
  fechaLimite: string
  cliente: string
  activo: boolean
}

interface ProjectFormProps {
  project?: Project
  onSubmit: (projectData: ProjectFormData) => void
  onClose: () => void
}

export function ProjectForm({ project, onSubmit, onClose }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    nombre: project?.nombre || "",
    descripcion: project?.descripcion || "",
    fechaLimite: project?.fechaLimite || "",
    cliente: project?.cliente || "",
    activo: project?.activo ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.nombre.trim()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{project ? "Editar Proyecto" : "Nuevo Proyecto"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Proyecto *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Nombre del proyecto"
                required
              />
            </div>

            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={formData.cliente}
                onChange={(e) => setFormData((prev) => ({ ...prev, cliente: e.target.value }))}
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción del proyecto"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fechaLimite">Fecha Límite</Label>
              <Input
                id="fechaLimite"
                type="date"
                value={formData.fechaLimite}
                onChange={(e) => setFormData((prev) => ({ ...prev, fechaLimite: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, activo: checked }))}
              />
              <Label htmlFor="activo">Proyecto activo</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">
                {project ? "Actualizar" : "Crear Proyecto"}
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
