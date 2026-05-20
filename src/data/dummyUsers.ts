export type UserRole = 'admin' | 'user'

export interface DummyUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
}

export const dummyUsers: DummyUser[] = [
  // Admin accounts
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
  // User accounts (warga)
  {
    id: 'user-001',
    email: 'siti@email.com',
    password: 'user123',
    name: 'Siti Nurhaliza',
    role: 'user',
  },
  {
    id: 'user-002',
    email: 'bambang@email.com',
    password: 'user123',
    name: 'Bambang Supriyadi',
    role: 'user',
  },
  {
    id: 'user-003',
    email: 'dewi@email.com',
    password: 'user123',
    name: 'Dewi Sartika',
    role: 'user',
  },
  {
    id: 'user-004',
    email: 'hasan@email.com',
    password: 'user123',
    name: 'Hasan Basri',
    role: 'user',
  },
  {
    id: 'user-005',
    email: 'rudi@email.com',
    password: 'user123',
    name: 'Rudi Hartono',
    role: 'user',
  },
  {
    id: 'user-006',
    email: 'mulyadi@email.com',
    password: 'user123',
    name: 'Mulyadi',
    role: 'user',
  },
]
