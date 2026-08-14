import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            roleRef: true,
            userTeams: { select: { team_id: true } },
          },
        })

        if (!user || user.password !== credentials.password) return null

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name,
          role: user.role as UserRole,
          roleId: user.role_id,
          roleName: user.roleRef?.name ?? null,
          teamIds: user.userTeams.map((t) => t.team_id),
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: UserRole }).role
        token.roleId = (user as { roleId?: string | null }).roleId ?? null
        token.roleName = (user as { roleName?: string | null }).roleName ?? null
        token.teamIds = (user as { teamIds?: string[] }).teamIds ?? []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as { role: UserRole }).role = token.role as UserRole
        session.user.roleId = (token.roleId as string | null) ?? null
        session.user.roleName = (token.roleName as string | null) ?? null
        session.user.teamIds = (token.teamIds as string[] | undefined) ?? []
      }
      return session
    },
  },
})