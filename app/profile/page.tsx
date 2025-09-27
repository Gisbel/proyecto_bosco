"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NavigationHeader } from "@/components/navigation-header"
import { AuthGuard } from "@/components/auth-guard"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useAuth } from "@/contexts/auth-context"
import { Mail, Phone, MapPin, Briefcase, Calendar, Save, Edit2, Camera, Lock, Eye, EyeOff } from "lucide-react"

interface UserProfile {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  ubicacion: string
  profesion: string
  especialidades: string[]
  biografia: string
  avatar: string
  fechaRegistro: string
  tarifaPorHora: number
  experienciaAnios: number
  sitioWeb: string
  linkedin: string
  github: string
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const { changePassword } = useAuth()

  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>("userProfile", {
    id: "1",
    nombre: "Usuario",
    apellido: "Freelancer",
    email: "usuario@ejemplo.com",
    telefono: "+34 600 000 000",
    ubicacion: "Madrid, España",
    profesion: "Desarrollador Full Stack",
    especialidades: ["React", "Node.js", "TypeScript", "Python"],
    biografia:
      "Desarrollador freelancer con experiencia en aplicaciones web modernas. Me especializo en crear soluciones eficientes y escalables para mis clientes.",
    avatar: "",
    fechaRegistro: new Date().toISOString().split("T")[0],
    tarifaPorHora: 45,
    experienciaAnios: 5,
    sitioWeb: "https://miportfolio.com",
    linkedin: "https://linkedin.com/in/usuario",
    github: "https://github.com/usuario",
  })

  const [formData, setFormData] = useState(userProfile)

  const handleInputChange = (field: keyof UserProfile, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSpecialtyChange = (value: string) => {
    const specialties = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    setFormData((prev) => ({ ...prev, especialidades: specialties }))
  }

  const handleSave = () => {
    setUserProfile(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(userProfile)
    setIsEditing(false)
  }

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword)

    if (success) {
      setPasswordSuccess("Contraseña cambiada exitosamente")
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsChangingPassword(false)
    } else {
      setPasswordError("La contraseña actual es incorrecta")
    }
  }

  const handleCancelPasswordChange = () => {
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    setPasswordError("")
    setPasswordSuccess("")
    setIsChangingPassword(false)
  }

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NavigationHeader />
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">Mi Perfil</h1>
                <p className="text-muted-foreground">Gestiona tu información personal y profesional</p>
              </div>
              <Button
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="relative mx-auto mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={formData.avatar || "/placeholder.svg"}
                      alt={`${formData.nombre} ${formData.apellido}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(formData.nombre, formData.apellido)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-xl">
                  {formData.nombre} {formData.apellido}
                </CardTitle>
                <p className="text-muted-foreground">{formData.profesion}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.telefono}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.ubicacion}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{formData.experienciaAnios} años de experiencia</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Desde {new Date(formData.fechaRegistro).toLocaleDateString("es-ES")}</span>
                </div>

                <div className="pt-4">
                  <h4 className="font-semibold mb-2">Especialidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.especialidades.map((especialidad, index) => (
                      <Badge key={index} variant="secondary">
                        {especialidad}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => setIsChangingPassword(true)} variant="outline" className="w-full">
                    <Lock className="w-4 h-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => handleInputChange("apellido", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => handleInputChange("ubicacion", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profesion">Profesión</Label>
                  <Input
                    id="profesion"
                    value={formData.profesion}
                    onChange={(e) => handleInputChange("profesion", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experiencia">Años de Experiencia</Label>
                    <Input
                      id="experiencia"
                      type="number"
                      value={formData.experienciaAnios}
                      onChange={(e) => handleInputChange("experienciaAnios", Number.parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tarifa">Tarifa por Hora (€)</Label>
                    <Input
                      id="tarifa"
                      type="number"
                      value={formData.tarifaPorHora}
                      onChange={(e) => handleInputChange("tarifaPorHora", Number.parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="especialidades">Especialidades (separadas por comas)</Label>
                  <Input
                    id="especialidades"
                    value={formData.especialidades.join(", ")}
                    onChange={(e) => handleSpecialtyChange(e.target.value)}
                    disabled={!isEditing}
                    placeholder="React, Node.js, TypeScript, Python"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biografia">Biografía</Label>
                  <Textarea
                    id="biografia"
                    value={formData.biografia}
                    onChange={(e) => handleInputChange("biografia", e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Cuéntanos sobre tu experiencia y especialidades..."
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Enlaces Profesionales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sitioWeb">Sitio Web</Label>
                      <Input
                        id="sitioWeb"
                        value={formData.sitioWeb}
                        onChange={(e) => handleInputChange("sitioWeb", e.target.value)}
                        disabled={!isEditing}
                        placeholder="https://miportfolio.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange("linkedin", e.target.value)}
                        disabled={!isEditing}
                        placeholder="https://linkedin.com/in/usuario"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        value={formData.github}
                        onChange={(e) => handleInputChange("github", e.target.value)}
                        disabled={!isEditing}
                        placeholder="https://github.com/usuario"
                      />
                    </div>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSave} className="bg-accent hover:bg-accent/90">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                    <Button onClick={handleCancel} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {isChangingPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Cambiar Contraseña
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Ingresa tu contraseña actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Repite la nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{passwordError}</div>
                  )}

                  {passwordSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{passwordSuccess}</div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handlePasswordChange} className="flex-1">
                      Cambiar Contraseña
                    </Button>
                    <Button onClick={handleCancelPasswordChange} variant="outline" className="flex-1 bg-transparent">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
