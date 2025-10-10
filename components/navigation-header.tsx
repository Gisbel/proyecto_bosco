"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, LogOut, User, Moon, Sun } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useState, useEffect } from "react"

export function NavigationHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const canGoBack = pathname !== "/"

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Dashboard"
      case "/projects":
        return "Proyectos"
      case "/tasks":
        return "Gestión de Tareas"
      case "/timer":
        return "Timer Pomodoro"
      case "/time-tracking":
        return "Seguimiento de Tiempo"
      case "/statistics":
        return "Estadísticas"
      case "/profile":
        return "Mi Perfil"
      default:
        if (pathname.startsWith("/projects/")) {
          return "Detalle del Proyecto"
        }
        return "TaskFlow"
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-background">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          {canGoBack && (
            <Button variant="ghost" size="sm" className="flex items-center gap-1 md:gap-2 shrink-0">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Atrás</span>
            </Button>
          )}
          <h1 className="text-base md:text-xl font-semibold text-foreground truncate">{getPageTitle()}</h1>
        </div>
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          <Button variant="ghost" size="sm" className="shrink-0">
            <Moon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2 shrink-0">
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between p-3 md:p-4 border-b border-border bg-background">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        {canGoBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1 md:gap-2 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Atrás</span>
          </Button>
        )}
        <h1 className="text-base md:text-xl font-semibold text-foreground truncate">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-1 md:gap-2 shrink-0">
        <span className="text-sm text-muted-foreground hidden lg:block">Bienvenido, {user?.nombre}</span>

        <Button variant="ghost" size="sm" onClick={toggleTheme} className="shrink-0">
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 shrink-0">
              <User className="w-4 h-4" />
              <span className="hidden md:block">{user?.nombre}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="w-4 h-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
