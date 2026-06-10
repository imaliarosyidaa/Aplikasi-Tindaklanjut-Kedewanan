export type UserRole = 'admin' | 'user'

export interface DummyUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
}

export const dummyUsers: DummyUser[] = [
  {
    id: 'admin-001',
    email: 'admin@dprd-jaksel.go.id',
    password: 'admin123',
    name: 'Admin DPRD Jakarta Selatan',
    role: 'admin',
  },
  {
    id: 'admin-002',
    email: 'superadmin@dprd-jaksel.go.id',
    password: 'superadmin123',
    name: 'Super Admin',
    role: 'admin',
  },
]
