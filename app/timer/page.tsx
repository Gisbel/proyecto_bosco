"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Timer, Target } from "lucide-react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
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

export default function TimerPage() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [projects] = useLocalStorage<Project[]>("projects", [])
  const [activeTask, setActiveTask] = useState<string | null>(null)

  const availableTasks = tasks.filter((task) => !task.completada)

  const handlePomodoroComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, pomodoros: task.pomodoros + 1, tiempoTotal: task.tiempoTotal + 25 } : task,
      ),
    )
  }

  const selectedTask = activeTask ? tasks.find((t) => t.id === activeTask) : null

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Timer Pomodoro</h1>
          <p className="text-muted-foreground">Enfócate en tus tareas con la técnica Pomodoro</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Seleccionar Tarea
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={activeTask || ""} onValueChange={setActiveTask}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elegir tarea" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((task) => {
                        const project = projects.find((p) => p.id === task.proyectoId)
                        return (
                          <SelectItem key={task.id} value={task.id}>
                            <div>
                              <div className="font-medium">{task.titulo}</div>
                              {project && <div className="text-xs text-muted-foreground">{project.nombre}</div>}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>

                  {selectedTask && (
                    <div className="p-3 bg-muted rounded-lg">
                      <h3 className="font-semibold text-sm mb-2">{selectedTask.titulo}</h3>
                      {selectedTask.descripcion && (
                        <p className="text-xs text-muted-foreground mb-2">{selectedTask.descripcion}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span>Pomodoros: {selectedTask.pomodoros}</span>
                        {selectedTask.estimatedPomodoros && <span>Meta: {selectedTask.estimatedPomodoros}</span>}
                      </div>
                    </div>
                  )}

                  {availableTasks.length === 0 && (
                    <div className="text-center py-4">
                      <Timer className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No hay tareas disponibles</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-sm">Estadísticas de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tareas activas:</span>
                    <span className="font-semibold">{availableTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pomodoros totales:</span>
                    <span className="font-semibold">{tasks.reduce((sum, task) => sum + task.pomodoros, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timer */}
          <div className="lg:col-span-2">
            <PomodoroTimer
              activeTask={selectedTask || null}
              onComplete={handlePomodoroComplete}
              onStop={() => setActiveTask(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
