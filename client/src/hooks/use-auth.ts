import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  role?: string
  userType?: string
  businessName?: string
}

export function useAuth() {
  const queryClient = useQueryClient()

  // Query current user session from backend
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', {
        credentials: 'include'
      })
      if (!response.ok) {
        return null
      }
      const data = await response.json()
      return data.user || null
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error('Logout fallito')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/user'], null)
      queryClient.clear()
    }
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include'
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login fallito')
      }
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/user'], data.user)
    }
  })

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    loginMutation,
    logoutMutation
  }
}
