import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface DataScope {
  isGlobal: boolean
  teamIds: string[]
  dprdId: string | null
  userId: string | null
}

const GLOBAL_ROLES = ['super admin', 'sekretariat']

function isGlobalRole(roleName: string | null): boolean {
  if (!roleName) return false
  const normalized = roleName.trim().toLowerCase()
  return GLOBAL_ROLES.includes(normalized)
}

/**
 * Menentukan scope data user yang sedang login berdasarkan role RBAC & keanggotaan tim.
 * - SUPER_ADMIN / SEKRETARIAT → isGlobal (bebas filter team_id / dprd_id).
 * - User biasa → hanya melihat data dari team yang diikutinya (user_teams).
 * Scope selalu dibaca dari database/session, BUKAN dari param request,
 * sehingga user tidak bisa mengakses data tim lain dengan mengubah team_id pada request.
 */
export async function getDataScope(): Promise<DataScope> {
  const session = await auth()
  if (!session?.user?.id) return { isGlobal: false, teamIds: [], dprdId: null, userId: null }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      roleRef: { select: { name: true } },
      userTeams: {
        select: { team_id: true, team: { select: { dprd_id: true } } },
      },
    },
  })

  if (!user) return { isGlobal: false, teamIds: [], dprdId: null, userId: session.user.id }

  const isGlobal = isGlobalRole(user.roleRef?.name ?? null) || user.role === 'admin' && !user.dprd_id

  return {
    isGlobal,
    teamIds: user.userTeams.map((t) => t.team_id),
    dprdId: user.dprd_id ?? user.userTeams[0]?.team.dprd_id ?? null,
    userId: user.id,
  }
}

/**
 * Membangun kondisi Prisma `team_id` untuk filter data terpusat.
 * Gunakan hasilnya pada klausa `where` query data yang team-scoped.
 */
export function teamFilter(scope: DataScope): Record<string, unknown> {
  if (scope.isGlobal) return {}
  return scope.teamIds.length
    ? { team_id: { in: scope.teamIds } }
    : { team_id: { in: [] } }
}

/**
 * Membangun kondisi Prisma `master_dewan` untuk filter data aspirasi per dewan.
 * - Global role → tanpa filter (bebas lihat semua dewan).
 * - User biasa → hanya melihat aspirasi untuk dprd-nya sendiri.
 */
export function dprdFilter(scope: DataScope): Record<string, unknown> {
  if (scope.isGlobal) return {}
  return scope.dprdId ? { master_dewan: scope.dprdId } : { master_dewan: { in: [] } }
}

/**
 * Menentukan team_id default untuk data baru yang dibuat user.
 * - Global role: pakai team_id dari body jika dikirim, selain itu tim pertama user.
 * - User biasa: selalu diarahkan ke tim pertamanya (tidak bisa pilih tim lain).
 */
export function resolveTeamIdForCreate(
  scope: DataScope,
  requestedTeamId?: string | null,
): string | null {
  if (scope.isGlobal) {
    return requestedTeamId || scope.teamIds[0] || null
  }
  return scope.teamIds[0] ?? null
}
