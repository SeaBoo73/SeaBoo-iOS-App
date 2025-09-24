import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface User {
  id: number
  email: string
  name?: string
  role?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false
  })

  const queryClient = useQueryClient()

  // Simulate user session check
  useEffect(() => {
    // For now, simulate no user (development mode)
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false
    })
  }, [])

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Simulate logout
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false
      })
    },
    onSuccess: () => {
      queryClient.clear()
    }
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      // Simulate login
      const user: User = {
        id: 1,
        email: credentials.email,
        name: 'Demo User'
      }
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true
      })
      return user
    }
  })

  return {
    ...authState,
    loginMutation,
    logoutMutation
  }
}