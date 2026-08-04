import type { UserRole } from '@/types'

declare module 'next-auth' {
  interface User {
    role: UserRole
    roleId?: string | null
    roleName?: string | null
  }
  interface Session {
    user: {
      id: string
      role: UserRole
      roleId?: string | null
      roleName?: string | null
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    roleId?: string | null
    roleName?: string | null
  }
}
