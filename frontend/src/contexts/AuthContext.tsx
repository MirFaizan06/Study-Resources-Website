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
  acceptBoardTos(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function storeTokens(token: string, refreshToken: string) {
  localStorage.setItem('student_token', token)
  localStorage.setItem('student_refresh_token', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('student_token')
  localStorage.removeItem('student_refresh_token')
}

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('student_token')
    const storedRefresh = localStorage.getItem('student_refresh_token')

    if (storedToken) {
      setToken(storedToken)
      api.auth
        .me()
        .then((u) => setUser(u))
        .catch(async () => {
          // Access token expired — try refreshing
          if (storedRefresh) {
            try {
              const result = await api.auth.refresh(storedRefresh)
              storeTokens(result.token, result.refreshToken)
              setToken(result.token)
              const u = await api.auth.me()
              setUser(u)
            } catch {
              clearTokens()
              setToken(null)
            }
          } else {
            clearTokens()
            setToken(null)
          }
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password)
    storeTokens(res.token, res.refreshToken)
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
      storeTokens(res.token, res.refreshToken)
      setToken(res.token)
      setUser(res.user)
    },
    []
  )

  const logout = useCallback(() => {
    const rt = localStorage.getItem('student_refresh_token')
    if (rt) {
      // Fire-and-forget — revoke server-side token
      api.auth.logout(rt).catch(() => null)
    }
    clearTokens()
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const u = await api.auth.me()
    setUser(u)
  }, [])

  const acceptBoardTos = useCallback(async () => {
    await api.auth.acceptBoardTos()
    await refreshUser()
  }, [refreshUser])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser, acceptBoardTos }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
