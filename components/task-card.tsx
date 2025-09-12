"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Clock, Play, Timer, MoreVertical, Edit, Trash2, Calendar, Target } from "lucide-react"

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

interface Project {
  id: string
  nombre: string
  descripcion: string
  fechaLimite: string
  cliente: string
  activo: boolean
}

interface TaskCardProps {
  task: Task
  project?: Project
  onComplete: (taskId: string) => void
  onPomodoroStart: (taskId: string) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  isActive: boolean
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

const statusColors = {
  pendiente: "bg-gray-500 text-white",
  "en-progreso": "bg-blue-500 text-white",
  completada: "bg-green-500 text-white",
  cancelada: "bg-red-500 text-white",
}

const statusLabels = {
  pendiente: "Pendiente",
  "en-progreso": "En Progreso",
  completada: "Completada",
  cancelada: "Cancelada",
}

export function TaskCard({ task, project, onComplete, onPomodoroStart, onEdit, onDelete, isActive }: TaskCardProps) {
  const isOverdue = new Date(task.fechaAsignada) < new Date() && !task.completada
  const progress = task.estimatedPomodoros ? (task.pomodoros / task.estimatedPomodoros) * 100 : 0

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-md ${
        isActive ? "ring-2 ring-accent" : ""
      } ${task.completada ? "opacity-75" : ""} ${isOverdue ? "border-destructive" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <Checkbox checked={task.completada} onCheckedChange={() => onComplete(task.id)} className="mt-1" />
            <div className="flex-1">
              <h3
                className={`font-semibold text-sm leading-tight ${
                  task.completada ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.titulo}
              </h3>
              {project && <p className="text-xs text-muted-foreground mt-1">{project.nombre}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs ${priorityColors[task.prioridad]}`}>
              {priorityLabels[task.prioridad]}
            </Badge>

            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(task)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                      <Trash2 className="w-3 h-3 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className={`text-xs ${statusColors[task.estado]}`}>
            {statusLabels[task.estado]}
          </Badge>
          {isOverdue && (
            <Badge variant="destructive" className="text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              Vencida
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {task.descripcion && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.descripcion}</p>}

        {task.estimatedPomodoros && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Progreso
              </span>
              <span>
                {task.pomodoros}/{task.estimatedPomodoros} pomodoros
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              <span>{task.pomodoros}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {Math.floor(task.tiempoTotal / 60)}h {task.tiempoTotal % 60}m
              </span>
            </div>
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Button
          size="sm"
          variant={isActive ? "secondary" : "outline"}
          onClick={() => onPomodoroStart(task.id)}
          disabled={task.completada}
          className="w-full"
        >
          <Play className="w-3 h-3 mr-2" />
          {isActive ? "En Progreso" : "Iniciar Pomodoro"}
        </Button>
      </CardContent>
    </Card>
  )
}
