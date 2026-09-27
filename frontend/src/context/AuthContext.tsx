/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../services/authService'
import { getProfile } from '../services/userService'

const TOKEN_KEY = 'jobtrack_token'
const USER_KEY = 'jobtrack_user'

type AuthContextValue = {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<AuthResponse>
  register: (payload: RegisterPayload) => Promise<AuthResponse>
  logout: () => void
  updateUser: (user: User) => void
  updateSession: (response: AuthResponse) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readUser() {
  const storedUser = localStorage.getItem(USER_KEY)
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser) as User
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<User | null>(readUser)
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY) && !readUser()))

  useEffect(() => {
    if (token && !user) {
      let active = true
      getProfile()
        .then((profile) => {
          if (active) {
            localStorage.setItem(USER_KEY, JSON.stringify(profile))
            setUser(profile)
          }
        })
        .catch(() => {
          if (active) {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(USER_KEY)
            setToken(null)
            setUser(null)
          }
        })
        .finally(() => {
          if (active) setIsLoading(false)
        })
      return () => { active = false }
    } else {
      setIsLoading(false)
    }
  }, [token, user])

  const saveAuth = (response: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, response.token)
    localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    setToken(response.token)
    setUser(response.user)
    setIsLoading(false)
    return response
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    login: async (payload) => saveAuth(await authService.login(payload)),
    register: async (payload) => saveAuth(await authService.register(payload)),
    logout: () => {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      setToken(null)
      setUser(null)
      setIsLoading(false)
    },
    updateUser: (updatedUser) => {
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)
    },
    updateSession: (response) => saveAuth(response),
  }), [isLoading, token, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
