"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  email: string
  nombre: string
  apellido: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const savedUser = localStorage.getItem("taskflow_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple authentication - in a real app, this would be an API call
    if (email && password.length >= 6) {
      const userData: User = {
        id: Date.now().toString(),
        email,
        nombre: email.split("@")[0],
        apellido: "Usuario",
      }
      setUser(userData)
      localStorage.setItem("taskflow_user", JSON.stringify(userData))
      localStorage.setItem("taskflow_password", password)
      return true
    }
    return false
  }

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    const savedPassword = localStorage.getItem("taskflow_password")

    // Verify current password
    if (savedPassword !== currentPassword) {
      return false
    }

    // Validate new password
    if (newPassword.length < 6) {
      return false
    }

    // Update password
    localStorage.setItem("taskflow_password", newPassword)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("taskflow_user")
    localStorage.removeItem("taskflow_password")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        changePassword,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
