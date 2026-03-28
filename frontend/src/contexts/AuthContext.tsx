import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { StudentUser } from '@/types'
import { api } from '@/services/api'

interface AuthContextValue {
  user: StudentUser | null
  token: string | null
  isLoading: boolean
  login(email: string, password: string): Promise<void>
  register(data: {
    email: string
    password: string
    name: string
    university: string
    college: string
    semester: number
  }): Promise<void>
  logout(): void
  refreshUser(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('student_token')
    if (stored) {
      setToken(stored)
      api.auth
        .me()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('student_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    localStorage.setItem('student_token', res.token)
    setToken(res.token)
    setUser(res.user)
  }, [])

  const register = useCallback(
    async (data: {
      email: string
      password: string
      name: string
      university: string
      college: string
      semester: number
    }) => {
      const res = await api.auth.register(data)
      localStorage.setItem('student_token', res.token)
      setToken(res.token)
      setUser(res.user)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem('student_token')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await api.auth.me()
    setUser(u)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
